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

`deploy/install.sh` sets the site up on a Debian or Ubuntu server, the same way RouteFlow is installed. It asks questions in plain English and does the rest.

Get the files onto the server (example: a server kit made by GitHub):

1. In GitHub, open Actions, then the **release** workflow, and download `nikoufood-server-kit.tar.gz` (for a native install also download `nikoufood-<version>-linux-x64.tar.gz`).
2. Copy them to the server, for example `scp nikoufood-server-kit.tar.gz root@SERVER:/root/`.
3. On the server: `tar xzf nikoufood-server-kit.tar.gz && cd nikoufood-server-kit && sudo bash install.sh`.

The installer asks:

- **Docker or native.** Docker pulls the images from Docker Hub. Native unpacks the release tarball and runs it with systemd (no Docker needed).
- **Do you already have PostgreSQL?** Yes: connect with host, user and password, or let the installer make a separate database and user inside the PostgreSQL already on the server (for example RouteFlow's). No: the installer installs one for you (a container for Docker, the Debian package for native).
- Website address, port (default 3000), first admin, starter content, mail, ArvanCloud CDN, and optional backups.

It never touches RouteFlow's PostgreSQL settings or its Caddy file. The site gets its own `/etc/caddy/sites/nikoufood.caddy`.

Afterwards use `nikou` (or just `nikou` for a menu): `status`, `upgrade`, `rollback`, `backup`, `restore`, `logs`, `doctor`, `secrets`. Example: `nikou upgrade` pulls the newest version and rolls back by itself if it does not start.

## Local notes

- `pnpm dev` uses Payload's automatic schema push; production uses migrations only.
- After `pnpm seed` (or `SEED_FORCE=1 pnpm seed`, which overwrites content) delete `.next/dev/cache/fetch-cache` and restart the dev server: seeding outside Next does not clear the page cache.
- `pnpm lint` and `npx tsc --noEmit` must stay clean; `pnpm build` needs no database.
- `tools/render` (Playwright) renders the butter stand-in pictures; `node tools/make-icons.cjs` rebuilds the fallback icons and share image from the logo. Neither is part of the site build.
- The fonts need licence codes from FontIran; until then they stay in this private repository.
