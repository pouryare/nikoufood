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
