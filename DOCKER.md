# Docker Setup — Acquisitions API

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed
- A [Neon](https://neon.tech) account with:
  - An **API key** (Account Settings → API Keys)
  - A **Project ID** (Project Settings → General)
  - A **Parent Branch ID** (the branch you want dev to fork from — usually `main`)

---

## Development (Neon Local)

Neon Local is a proxy that creates **ephemeral database branches** from your Neon Cloud project. Each time you start the dev environment, you get a fresh copy of your database. When you stop it, the branch is automatically deleted.

### 1. Configure environment

Copy and fill in `.env.development`:

```env
# Required — get these from the Neon console
NEON_API_KEY=napi_xxxxxxxxxxxx
NEON_PROJECT_ID=cold-river-12345678
PARENT_BRANCH_ID=br-xxxxxxxxxxxx

# These are pre-configured for the Docker network — no changes needed
DATABASE_URL=postgres://neon:npg@neon-db:5432/neondb
NEON_FETCH_ENDPOINT=http://neon-db:5432/sql

# App config
PORT=3000
JWT_SECRET=dev-secret-change-me
ARCJET_KEY=your_arcjet_key
```

### 2. Start

```sh
docker compose -f docker-compose.dev.yml up --build
```

This starts:
- **neon-db** — Neon Local proxy on port `5432` (creates an ephemeral branch)
- **app** — Express server on port `3000` with file watching enabled

### 3. Run migrations

In a separate terminal, run migrations against the local proxy:

```sh
docker compose -f docker-compose.dev.yml exec app npx drizzle-kit migrate
```

### 4. Stop

```sh
docker compose -f docker-compose.dev.yml down
```

The ephemeral branch is automatically deleted when the `neon-db` container stops.

---

## Production (Neon Cloud)

In production, the app connects **directly** to your Neon Cloud database over HTTPS using the serverless driver. No Neon Local proxy is involved.

### 1. Configure environment

Fill in `.env.production`:

```env
DATABASE_URL=postgres://user:pass@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

PORT=3000
JWT_SECRET=your_strong_production_secret
ARCJET_KEY=your_arcjet_key
```

### 2. Start

```sh
docker compose -f docker-compose.prod.yml up --build -d
```

### 3. Stop

```sh
docker compose -f docker-compose.prod.yml down
```

---

## How the DATABASE_URL switch works

The `src/config/database.js` module checks for the `NEON_FETCH_ENDPOINT` environment variable:

- **Set** (dev): configures `neonConfig` to route the serverless driver through the Neon Local HTTP proxy
- **Not set** (prod): the serverless driver connects directly to Neon Cloud — no extra config needed

This means the same application code runs in both environments — only the env vars change.

---

## Environment Variable Reference

### App variables (`.env.development` / `.env.production`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | `development` or `production` | Yes |
| `DATABASE_URL` | Postgres connection string | Yes |
| `NEON_FETCH_ENDPOINT` | Neon Local HTTP endpoint (dev only) | No |
| `JWT_SECRET` | Secret for signing JWTs | Yes |
| `JWT_EXPIRATION` | JWT expiry duration | No (default: 1d) |
| `ARCJET_KEY` | Arcjet API key | Yes |
| `LOG_LEVEL` | Winston log level | No (default: info) |

### Neon Local variables (dev compose only)

| Variable | Description | Required |
|---|---|---|
| `NEON_API_KEY` | Neon API key | Yes |
| `NEON_PROJECT_ID` | Neon project ID | Yes |
| `PARENT_BRANCH_ID` | Branch to fork ephemeral branches from | Yes |

---

## Common Commands

```sh
# Dev: rebuild and start
docker compose -f docker-compose.dev.yml up --build

# Dev: view logs
docker compose -f docker-compose.dev.yml logs -f app

# Dev: run a one-off command inside the app container
docker compose -f docker-compose.dev.yml exec app <command>

# Prod: start detached
docker compose -f docker-compose.prod.yml up --build -d

# Prod: view logs
docker compose -f docker-compose.prod.yml logs -f app
```
