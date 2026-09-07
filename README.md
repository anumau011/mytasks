# Tasks

A todo app with two project styles: a flat **simple** checklist, and a
**project** split into sections with a to-do / in-progress / done kanban board.

React + Vite on the front, Express + Prisma + Postgres on the back. All data
lives in the database and is scoped to the signed-in user — nothing is kept in
the browser.

## Running it

The app needs both halves up. The API first:

```bash
cd server
cp .env.example .env      # fill in DATABASE_URL and JWT_SECRET
npm install
npm run db:migrate        # create the tables
npm run dev               # http://localhost:4000
```

Then the client, in a second terminal:

```bash
npm install
npm run dev               # http://localhost:5173
```

Open http://localhost:5173 and create an account.

## Talking to the API

The client calls the API at an absolute URL — [`VITE_API_URL`](.env.example),
already set to `http://localhost:4000` in [`.env.development`](.env.development)
— using an axios instance in [`lib/api.js`](src/lib/api.js). There is no dev
proxy, so dev and production take the same path through CORS and the same
cookie rules.

Two settings have to agree for the session cookie to survive the trip:

- **`withCredentials: true`** on the axios client, so the browser sends and
  stores the cookie on a cross-origin call.
- **`CLIENT_ORIGIN`** on the server, which must list the client's exact origin.
  A credentialed request cannot be answered with a wildcard, so the origin is
  echoed back explicitly — see [`server/src/app.js`](server/src/app.js).

In production the two halves are different `*.onrender.com` subdomains, and
because `onrender.com` is on the Public Suffix List those count as different
*sites*. So `NODE_ENV=production` also switches the cookie to
`SameSite=None; Secure`; on `SameSite=Lax` the browser would drop it and every
request would come back 401. Locally, `:5173` and `:4000` differ only by port,
which is not part of a site, so `Lax` still applies there.

Deploying means setting `VITE_API_URL` on the static site **before** the build
— Vite bakes it into the bundle — and `CLIENT_ORIGIN` plus
`NODE_ENV=production` on the API.

`cd server && npm run db:seed` loads a demo account
(`demo@example.com` / `password123`) with a few projects already in it.

## Layout

```
src/
  lib/api.js          axios client + API⇄UI shape translation
  lib/useProjects.js  project state; every mutation goes to the API
  lib/store.js        pure display helpers (dates, status labels)
  components/         AuthScreen gates Dashboard, which holds the app
server/
  src/routes/         auth, projects, sections, todos
  prisma/schema.prisma
```

The API speaks Prisma enums (`PROJECT`, `DONE`) and nests todos under
`section.todos`; the UI works in lowercase strings and calls them
`section.items`. `lib/api.js` is the only place that translates between them.

## The signed-out site

`/` shows two different things depending on the session:

- **Signed out** → [`Landing`](src/components/Landing.jsx), the marketing page.
  Its buttons swap in [`AuthScreen`](src/components/AuthScreen.jsx) with
  `initialMode` set to `login` or `register`; the form's Home button goes back.
- **Signed in** → straight into the app. `auth.me()` decides, so a returning
  user with a live cookie never sees the landing page at all.

The landing page is the only indexable screen, so it carries the real headings
and copy. Everything behind the login is marked `noindex`.

## SEO

| Where | What |
| --- | --- |
| [`index.html`](index.html) | Static title, description, canonical, Open Graph, Twitter card, and JSON-LD (`SoftwareApplication`, `WebSite`, `FAQPage`). Crawlers that don't run JS see this and the `<noscript>` pitch below it. |
| [`Seo.jsx`](src/components/Seo.jsx) | Per-view head tags at runtime — React 19 hoists any `<title>`/`<meta>`/`<link>` into `<head>` on its own, so no Helmet provider is needed. The static copies are marked `data-seo-default` and removed on first mount so nothing ends up duplicated. |
| [`public/robots.txt`](public/robots.txt) | Allows the site, blocks `?token=` reset links, `/api/` and `/assets/`, points at the sitemap. |
| [`public/sitemap.xml`](public/sitemap.xml) | Home, blog index, blog post. Add a `<url>` entry for every new post. |
| [`public/blog/`](public/blog/) | Plain static HTML, outside the React build. Fully crawlable with zero JS, which a client-rendered SPA route cannot be. |

The FAQ markup in `index.html` must keep matching the FAQ text rendered by
`Landing.jsx` — Google drops `FAQPage` markup whose answers aren't visible on
the page.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Oxlint |
| `cd server && npm run dev` | API with `--watch` |
| `cd server && npm run db:studio` | Browse the data in Prisma Studio |
