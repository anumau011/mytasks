# Todo API

Express + Postgres + Prisma backend with cookie-based JWT auth.

## Setup

```bash
cd server
npm install
cp .env.example .env      # then edit DATABASE_URL and JWT_SECRET
npm run db:migrate        # creates the tables
npm run db:seed           # optional demo data
npm run dev               # http://localhost:4000
```

`DATABASE_URL` points at a Postgres database that must already exist:

```bash
createdb -U postgres todo
```

## Auth

Register/login return the user and set a `token` httpOnly cookie (7 days).
The cookie is sent automatically by the browser — from the frontend, use
`fetch(url, { credentials: 'include' })`. API clients can instead pass
`Authorization: Bearer <token>` using the token in the response body.

Passwords are hashed with bcrypt (10 rounds) and never returned.

### Password reset

`POST /auth/forgot-password` answers 200 whatever the address, so the endpoint
can't be used to find out who has an account. When the address does match a
user it issues a single-use link:

- a 32-byte random token goes in the emailed URL; only its SHA-256 lands in
  `PasswordResetToken`, so a database dump can't be used to reset anyone
- requesting a new link deletes the previous one — one live link per account
- links expire after `RESET_TOKEN_MINUTES` (default 30). An expired row is
  deleted the moment it's presented; whatever is never presented gets swept by
  the cron below
- `POST /auth/reset-password` changes the password and deletes every
  outstanding link for that user in one transaction, then sets the auth cookie

## Email (EmailJS)

Reset emails go out through the EmailJS REST API. Two things must be true or
sends are rejected:

1. Under **Account → Security**, turn on *Allow EmailJS API for non-browser
   applications*. Server-side calls are blocked by default.
2. `EMAILJS_PRIVATE_KEY` must be set — it's the `accessToken` the API
   authenticates server calls with, and it must never reach the browser.

The template needs these four variables:

| Variable | Contents |
| --- | --- |
| `{{to_email}}` | recipient, wire this to the template's To field |
| `{{to_name}}` | recipient's name |
| `{{reset_link}}` | the URL to put behind the button |
| `{{expires_minutes}}` | how long the link lasts |

**Leave the EmailJS variables blank in development.** The reset link is printed
to the server console instead, so the flow is testable without an account.

## Cron

The API schedules its own maintenance — no external scheduler to deploy. Every
`CRON_HEALTH_PING_MS` (default 5 min, `0` disables) it:

1. `GET`s its own `/api/health` to keep the instance warm on hosts that idle
   it out, then **reads the response body to completion**. An undici response
   whose body is never consumed holds its socket and buffered chunks, so a
   ping that fired and forgot would accumulate them; draining releases the
   connection back to the keep-alive pool immediately.
2. Deletes expired `PasswordResetToken` rows.

Ticks never overlap — a slow tick is skipped rather than stacked — and each
ping has a 10s abort timeout so a hung request can't wedge the loop.

## Routes

All routes are under `/api`. Everything except `/api/health` and `/api/auth/*`
requires authentication.

| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| GET | `/health` | — | liveness check |
| POST | `/auth/register` | `{name, email, password}` | password min 8 chars |
| POST | `/auth/login` | `{email, password}` | |
| POST | `/auth/logout` | — | clears the cookie |
| GET | `/auth/me` | — | current user |
| POST | `/auth/forgot-password` | `{email}` | always 200; emails a reset link |
| POST | `/auth/reset-password` | `{token, password}` | consumes the link, signs in |
| GET | `/projects` | — | all projects with sections + todos |
| POST | `/projects` | `{name, type}` | type: `SIMPLE` \| `PROJECT` |
| GET | `/projects/:id` | — | |
| PATCH | `/projects/:id` | `{name?, type?}` | |
| DELETE | `/projects/:id` | — | cascades to sections + todos |
| POST | `/projects/:id/sections` | `{title}` | |
| POST | `/projects/:id/todos` | `{text}` | checklist todo (SIMPLE projects) |
| PATCH | `/sections/:id` | `{title?, hidden?, position?}` | |
| DELETE | `/sections/:id` | — | cascades to its todos |
| POST | `/sections/:id/todos` | `{text}` | |
| PATCH | `/todos/:id` | `{text?, status?, position?}` | status: `TODO` \| `PROGRESS` \| `DONE` |
| DELETE | `/todos/:id` | — | |

Errors return `{ error: string, details?: { field: string[] } }`.

## Ownership

Every lookup is scoped by the authenticated `userId`, so another user's record
returns 404 rather than revealing that it exists.

## Data model

`User → Project → Section → Todo`. A `Todo` always carries `projectId`; for
`PROJECT`-type projects it also carries `sectionId`. `SIMPLE` projects use the
todos whose `sectionId` is null.
