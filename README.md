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

Open http://localhost:5173 and create an account. Vite proxies `/api` to port
4000, so requests stay same-origin and the httpOnly session cookie is sent
automatically — see [`vite.config.js`](vite.config.js).

`cd server && npm run db:seed` loads a demo account
(`demo@example.com` / `password123`) with a few projects already in it.

## Layout

```
src/
  lib/api.js          fetch wrapper + API⇄UI shape translation
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

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Oxlint |
| `cd server && npm run dev` | API with `--watch` |
| `cd server && npm run db:studio` | Browse the data in Prisma Studio |
