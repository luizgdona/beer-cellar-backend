# Beer Cellar — Backend

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5_strict-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/license-MIT-green)

A RESTful API service for managing a personal beer collection. Users can register, authenticate, and catalog beers they own or have consumed — complete with tasting notes, purchase info, expiration tracking, image uploads, and Google Calendar reminders.

---

## Built With

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js + TypeScript (strict) | 20+ / 5 |
| Framework | Express | 5 |
| ORM | TypeORM | 0.3 |
| Database | PostgreSQL | 15 |
| Cache / Rate limiting | Redis | 7 |
| Validation | Zod | 3 |
| Auth | JWT (access: 15 min · refresh: 7 days) | — |
| Password hashing | bcryptjs (12 rounds) | 3 |
| File storage | AWS S3 | — |
| Testing | Vitest | — |
| Containerization | Docker + Docker Compose | — |

---

## Architecture

```
Route → Middleware → Service → Repository → Entity
```

| Layer | Location | Responsibility |
|---|---|---|
| Routes | `src/routes/` | HTTP only — parse params/body, call service, format response. No business logic. |
| Middleware | `src/middleware/` | Auth (`authenticateToken`), request validation (`validate(Schema)`), error handling, rate limiting. |
| Services | `src/services/` | All business logic and orchestration. |
| Repositories | `src/repositories/` | The only layer that talks to TypeORM and the database directly. |
| Schemas | `src/schemas/` | Zod schemas; TypeScript types are derived via `z.infer<>`. |
| Entities | `src/entities/` | TypeORM entity classes that map to database tables. |

```
src/
├── config/       # appConfig — single source for all env-dependent values
├── entities/     # TypeORM entities (User, Beer)
├── middleware/   # auth, validation, errorHandler, rateLimiter
├── repositories/ # BeerRepository, UserRepository
├── routes/       # auth.ts, beers.ts
├── schemas/      # Zod validation schemas
├── services/     # BeerService, AuthService, EmailService, etc.
└── utils/        # Logger, tokenUtils, validators
```

---

## API Reference

**Base URL:** `/api/v1`

**Response envelope:**

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": "message" }
```

### Auth — `/api/v1/auth`

| Method | Path | Auth required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account; returns user + token pair |
| POST | `/auth/login` | No | Authenticate; returns user + token pair |
| POST | `/auth/refresh` | No | Exchange refresh token for a new token pair |
| GET  | `/auth/me` | Yes | Return the authenticated user's profile |
| POST | `/auth/logout` | Yes | Invalidate the refresh token |

### Beers — `/api/v1/beers`

All beer routes require `Authorization: Bearer <accessToken>`.

| Method | Path | Description |
|---|---|---|
| GET    | `/beers` | List beers for the authenticated user (`?status=available\|consumed&search=`) |
| POST   | `/beers` | Create a new beer |
| GET    | `/beers/stats/summary` | Aggregate stats for the authenticated user |
| GET    | `/beers/:id` | Get a single beer |
| PUT    | `/beers/:id` | Full update of a beer |
| DELETE | `/beers/:id` | Delete a beer |
| PATCH  | `/beers/:id/consume` | Mark a beer as consumed |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15
- Redis 7

> Alternatively, use Docker Compose to spin up Postgres and Redis — see [Docker Compose](#docker-compose) below.

### Clone and install

```bash
git clone https://github.com/luizgdona/beer-cellar-backend.git
cd beer-cellar-backend
npm install
```

### Environment variables

```bash
cp .env.example .env
```

Fill in the values — see [Environment Variables](#environment-variables) for the full list. **Never commit `.env`.**

### Development

```bash
npm run dev:watch   # nodemon with auto-reload
```

Server starts on the port defined by `PORT` (default `3001`).

### Production build

```bash
npm run build   # compiles TypeScript to dist/
npm start       # runs dist/index.js
```

---

## Running Tests

```bash
npm test         # vitest in watch mode
npm run test:run # single pass (CI)
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | HTTP port (default `3001`) |
| `NODE_ENV` | No | `development`, `test`, or `production` |
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | No | PostgreSQL port (default `5432`) |
| `DB_USERNAME` | Yes | PostgreSQL username |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_NAME` | Yes | PostgreSQL database name |
| `REDIS_HOST` | No | Redis host (default `localhost`) |
| `REDIS_PORT` | No | Redis port (default `6379`) |
| `JWT_SECRET` | Yes | Secret for signing access tokens |
| `REFRESH_TOKEN_SECRET` | Yes | Secret for signing refresh tokens |
| `AWS_ACCESS_KEY_ID` | No | AWS credentials for S3 image uploads |
| `AWS_SECRET_ACCESS_KEY` | No | AWS credentials for S3 |
| `AWS_S3_BUCKET` | No | S3 bucket name |
| `AWS_REGION` | No | AWS region (default `us-east-1`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID (Calendar integration) |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | No | OAuth redirect URI registered in Google Console |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP port (default `2525`) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASSWORD` | No | SMTP password |
| `SMTP_FROM` | No | Sender address for transactional emails |
| `BACKEND_URL` | No | Public URL of this service |
| `FRONTEND_URL` | No | Public URL of the frontend (CORS + email links) |

All values are read exclusively by `src/config/app.config.ts`. Business code never accesses `process.env` directly.

---

## Docker Compose

The `docker-compose.yml` defines three services: `db` (Postgres 15), `redis` (Redis 7), and `backend`.

### Infrastructure only (recommended for development)

```bash
docker compose up db redis
```

Starts Postgres on `5432` and Redis on `6379`. Run the backend locally with `npm run dev:watch`.

### Full stack

```bash
docker compose up
```

Builds and starts the backend container alongside Postgres and Redis. The backend waits for both services to pass their health checks before starting.

```bash
docker compose down      # stop containers
docker compose down -v   # also remove volumes (wipes DB data)
```

---

## Key Design Decisions

**Beer queries are scoped by `userId`** — Every database read and write for the `Beer` entity includes `userId` in the `WHERE` clause. The user identity comes exclusively from `req.user.id` (the verified JWT payload), never from a client-supplied field. This prevents horizontal privilege escalation.

**Zod is the single source of truth for types** — Schemas are defined once as Zod objects in `src/schemas/`. TypeScript types are derived via `z.infer<>`. Manual type definitions that duplicate the schema are prohibited.

**Integration failures are non-blocking** — Google Calendar event creation and outbound email are side effects. If either fails, the error is logged and discarded. The primary HTTP response is unaffected, preventing third-party outages from degrading core functionality.

**Config is centralized** — `src/config/app.config.ts` is the only place that reads `process.env`. This makes environment dependencies explicit and easy to mock in tests.

**Middleware is composable and stateless** — Protected routes apply `authenticateToken` then `validate(Schema)` in sequence. Each middleware piece has a single responsibility and no mutable state.

---

## License

MIT
