# نیکو اعتماد (Nikoo Etemad) — corporate website

Persian, RTL-first corporate brand site built with **Next.js (App Router)**, **Payload CMS 3**, **PostgreSQL**, Tailwind CSS, GSAP, Motion and React Three Fiber.

> The repository is **private** on purpose: it contains two commercial fonts (Peyda, IRANYekanX) under `public/fonts`.

## Quick start

```bash
pnpm install
cp .env.example .env        # fill DATABASE_URL and PAYLOAD_SECRET
pnpm seed                   # starter content (only on an empty database)
pnpm dev                    # http://localhost:3000   admin: /admin
```

The first account created at `/admin` becomes the administrator. To create it from the terminal instead, run the seed with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

## Where things live

| Path | What |
| --- | --- |
| `src/collections` | Products, brands, categories, provinces, representatives, leads (forms inbox), articles, media |
| `src/globals` | Site settings, theme (colors/fonts), navigation, and the text of every page |
| `src/seed` | Persian starter content + the 31 provinces |
| `src/lib` | CMS data layer, form schemas, email notifications, formatting |
| `src/data` | Province map shapes (MIT, from `iran-map-simple`) and the traced logo mark |

Nothing visible on the site is hard-coded: texts, contact details, menus, colors, fonts, map coverage and form messages are all editable in the admin panel.

## Pages

Home, About, Products (filters are plain links: `/products?category=bulk&type=plant`), Product detail, Brands, Brand detail, Network (map, steps, FAQ), Partnership, Representation (`/representation?province=isfahan` preselects a province), Contact and Articles. **Articles stay hidden** (menu, sitemap and the pages themselves) until the first one is published; the setting `Site settings → Articles` can force show or hide.

Forms (representation: name, mobile, province; partnership; contact) are saved in the admin under **Leads** and emailed to the address set in Site settings. Payment terms are never shown on the public site.

## Deploying on the ArvanCloud VPS

```bash
cp .env.example .env     # set DB_PASSWORD, PAYLOAD_SECRET (openssl rand -hex 32), NEXT_PUBLIC_SITE_URL, SMTP_*
docker compose up -d --build                    # database, migrations, then the site on 127.0.0.1:3000
docker compose run --rm tools pnpm seed         # first time only: starter content on the empty database
```

Put nginx in front (`deploy/nginx.conf.sample`) and add a certificate with certbot. Uploaded pictures and fonts live in the `media` volume; back up that volume and the `db-data` volume.

### Docker Hub (built by GitHub)

`.github/workflows/docker.yml` builds two images, `<user>/nikoufood` (the site) and `<user>/nikoufood-tools` (migrations and seed), and pushes them to Docker Hub on every push to `main`, every `v*` tag and the manual **Run workflow** button. Pull requests only build. Add two repository secrets first: `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`. **Keep the Docker Hub repositories private**: the images contain the paid fonts. On the server use `docker-compose.prod.yml` (it only pulls images; see the comments at its top).

**After a change to CMS fields** (developers): `pnpm payload generate:types`, then `pnpm migrate:create <name>` and commit `src/migrations`. The `migrate` service applies it on the next `docker compose up -d --build`.

## One-command server install (`install.sh`)

`deploy/install.sh` sets the site up on a Debian or Ubuntu server, It asks questions in plain English and does the rest.

You only need `install.sh` on the server. It downloads the newest server kit (and, for a native install, the newest site files) from the GitHub release by itself:

1. In GitHub, open Actions, run the **Release files** workflow once (or push a tag such as `v1.0.0`). It publishes a release.
2. Copy `deploy/install.sh` to the server and run `sudo bash install.sh`. The repository is private, so it asks for a GitHub token with read access to Contents (create one at GitHub, Settings, Developer settings, Fine-grained tokens). It is kept in `/etc/nikou/github-token` for later upgrades. For no questions about it: `sudo GITHUB_TOKEN=<token> bash install.sh`.
3. If you would rather copy files by hand, put `nikoufood-<version>-linux-x64.tar.gz` next to `install.sh` and it is used instead of downloading.

The installer asks:

- **Docker or native.** Docker pulls the images from Docker Hub. Native unpacks the release tarball and runs it with systemd (no Docker needed).
- **Do you already have PostgreSQL?** Yes: connect with host, user and password, or let the installer make a separate database and user inside the PostgreSQL already on the server and connect to it by itself. The second choice is offered when PostgreSQL is running on the server and the installer can use the `postgres` superuser. No: the installer installs one for you (a container for Docker, the Debian package for native).
- Website address, port (default 3000), first admin, starter content, mail, ArvanCloud CDN, and optional backups.
- **Arvan API key (optional, asked when the site is behind Arvan).** With it the installer adds the A record of the address in Arvan by itself, first with the cloud switched off. Arvan's cloud would answer Let's Encrypt's check instead of your server and the certificate would never be issued (error 502). Once Caddy has its certificate the installer switches the cloud on, and asks Arvan for managed HTTPS. The domain must already be in your Arvan account. Without a key it tells you what record to add by hand. `sudo nikou arvan-dns` does just this step later (also the fix if you see a 502 right after installing). The key is kept in `/etc/nikou/arvan-key`, readable by root only, and is never given to the site.

It never touches another app's PostgreSQL settings or Caddy file. The site gets its own `/etc/caddy/sites/nikoufood.caddy`.

Afterwards use `nikou` (or just `nikou` for a menu): `status`, `upgrade`, `rollback`, `backup`, `restore`, `logs`, `doctor`, `secrets`. Example: `nikou upgrade` downloads the newest version and rolls back by itself if it does not start.

### Updating the site

Every release has a version number, and a server only moves to a higher one. To publish a new version:

```
git tag v1.2.0
git push origin v1.2.0
```

The **Release files** workflow then builds the files, checks that the new tarball really starts and answers, and publishes a GitHub release. (The **Run workflow** button does the same with the `version` in `package.json`.) For Docker servers the **Docker** workflow builds the images on the same tag.

On the server there are two ways to apply it, and both give the same two choices, **now** or **tonight**:

- **Downloads are fast and resumable:** a release is fetched in 8 parallel pieces, each retried, so a poor connection does not start over. Every release has two files: the full one (site, Node and tools) and a small `.app.tar.gz` with only the site code. If Node and the libraries did not change, `nikou update` downloads just the small file (about 10 MB instead of 370 MB) and builds the full release on the server.
- **By hand:** `sudo nikou update` downloads the newest version (Docker: pulls the newest images), then asks `Upgrade now?`. Answer no and it is applied tonight at `UPGRADE_AT` (default 03:30 Tehran time, set in `/etc/nikou/nikou.conf`). Use `--now` or `--tonight` to skip the question. A waiting version can be applied at once with `sudo nikou upgrade-scheduled`.
- **By itself:** `sudo nikou github-deploy` (the installer offers it at the end) makes a key-only user called `nikoudeploy` and a key, then shows four secrets one at a time to paste into GitHub (environment `production`: `DEPLOY_SSH_KEY`, `DEPLOY_USER`, `DEPLOY_HOST`, `DEPLOY_KNOWN_HOSTS`; for a Docker server also `DEPLOY_MODE` = `docker`). After that, each new `v...` tag is sent to the server by the **deploy** job and applied tonight. Run it again to replace the key.

If the server cannot reach GitHub, `install.sh` and `nikou update` say which files to upload by hand with `scp`, wait for them, and go on by themselves.

Before an upgrade the installer checks that the file is for this machine type (x64 or arm64) and that there is enough free disk space, and changes nothing if not. A failed upgrade goes back to the previous version by itself.

### Safety nets

- **Dry run:** `sudo nikou install --dry-run` asks the questions and lists everything the install would do. Nothing is written or changed.
- **Restore test:** every Sunday the newest backup is restored into a scratch database, compared with the live one and thrown away (`sudo nikou restore-test` does it now). The live database is never touched. The backup holds both the database and the uploaded pictures.
- **Alerts by email:** if the mail settings are set, a failed backup, upgrade or restore test, and a site that does not answer twice in a row (checked every 10 minutes), are emailed to the alert address (asked with the mail questions; default is the admin email). `sudo nikou doctor` shows whether all of this is switched on.

## Speed

- **Pictures** go through the site's image optimizer: AVIF or WebP, sized for each screen, made on the first visit and kept on disk for 31 days. Nothing to convert by hand.
- **Text and code** are compressed by Caddy (zstd or gzip). The 3D scenes load after the page text.
- **Cache headers:** site files (`/_next/static`) are kept by browsers for a year (set by Next). `/brand/*` and uploaded media (`/api/media/file/*`) are kept for 30 days.
- **Arvan edge cache (done in the Arvan panel, CDN section, caching rules):** cache these paths so visitors get them from a nearby Arvan server instead of the VPS: `/_next/static/*`, `/_next/image*`, `/api/media/file/*`, `/brand/*`. Do not cache `/admin`, `/api` (other than media files) or form posts. After changing an uploaded file in the admin, purge the Arvan cache for that path if the old picture still shows.

## Local notes

- `pnpm dev` uses Payload's automatic schema push; production uses migrations only.
- After `pnpm seed` (or `SEED_FORCE=1 pnpm seed`, which overwrites content) delete `.next/dev/cache/fetch-cache` and restart the dev server: seeding outside Next does not clear the page cache.
- `pnpm lint` and `npx tsc --noEmit` must stay clean; `pnpm build` needs no database.
- `tools/render` (Playwright) renders the butter stand-in pictures; `node tools/make-icons.cjs` rebuilds the fallback icons and share image from the logo. Neither is part of the site build.
- The fonts need licence codes from FontIran; until then they stay in this private repository.
