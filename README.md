# Beer Cellar — Backend

A RESTful API service for managing a personal beer collection. Users can register, authenticate, and catalog beers they own or have consumed, complete with tasting notes, purchase info, expiration tracking, image uploads, and Google Calendar reminders.

---

## Tech Stack

| Concern | Technology | Rationale |
|---|---|---|
| Runtime | Node.js + TypeScript 5 | Strong typing across the entire codebase; strict mode enforced |
| Framework | Express 5 | Minimal footprint, async-native in v5, wide ecosystem |
| ORM | TypeORM 0.3 | Decorator-based entities, migrations, QueryBuilder — no raw SQL |
| Database | PostgreSQL 15 | Relational integrity for user-scoped beer data; JSONB available when needed |
| Cache / Rate limiting | Redis 7 | Fast in-memory store for rate-limit counters and refresh-token allowlisting |
| Validation | Zod 3 | Single schema definition drives both runtime validation and TypeScript types via `z.infer<>` |
| Auth | JWT (access: 15 min, refresh: 7 days) | Stateless short-lived access tokens; refresh tokens enable seamless session renewal |
| Password hashing | bcryptjs | Industry-standard adaptive hashing; pure JS, no native bindings required |
| File storage | AWS S3 | Scalable, durable object storage for beer images |
| Email | SMTP (EmailService) | Transactional emails for auth flows (welcome, password reset) |
| Calendar integration | Google Calendar API | Non-blocking consumption reminders created on beer save |
| Testing | Vitest | Fast, ESM-native test runner compatible with the TypeScript setup |
| Logging | Custom Logger util | Structured log levels (info/warn/error); no stray `console.log` in production |
| Containerization | Docker + Docker Compose | Reproducible local environment for Postgres, Redis, and the backend service |

---

## Architecture

The codebase follows a strict layered architecture:

```
Route → Middleware → Service → Repository → Entity
```

| Layer | Location | Responsibility |
|---|---|---|
| Routes | `src/routes/` | HTTP only — parse params/body, call service, format response. No business logic. |
| Middleware | `src/middleware/` | Composable, stateless. Handles auth (`authenticateToken`), request validation (`validate(Schema)`), error handling, and rate limiting. |
| Services | `src/services/` | All business logic and orchestration (e.g., saving a beer then creating a Google Calendar event). |
| Repositories | `src/repositories/` | The only layer that talks to TypeORM and the database directly. |
| Schemas | `src/schemas/` | Zod schema definitions. TypeScript types are derived from these via `z.infer<>` — never defined separately. |
| Entities | `src/entities/` | TypeORM entity classes that map to database tables. |

```
src/
├── config/       # appConfig — single source for all env-dependent values
├── entities/     # TypeORM entities (User, Beer)
├── middleware/   # auth, validation, errorHandler, rateLimiter
├── repositories/ # BeerRepository, UserRepository
├── routes/       # auth.ts, beers.ts
├── schemas/      # Zod validation schemas
├── services/     # BeerService, AuthService, GoogleCalendarService, etc.
└── utils/        # Logger, tokenUtils, validators
```

---

## API Reference

**Base URL:** `/api/v1`

**Response envelope:**

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message" }
```

### Auth — `/api/v1/auth`

| Method | Path | Description | Auth required |
|---|---|---|---|
| POST | `/auth/register` | Create account; returns user + token pair | No |
| POST | `/auth/login` | Authenticate; returns user + token pair | No |
| POST | `/auth/refresh` | Exchange refresh token for new token pair | No |

### Beers — `/api/v1/beers`

All beer routes require `Authorization: Bearer <accessToken>`.

| Method | Path | Description |
|---|---|---|
| GET | `/beers` | List beers for the authenticated user; supports `?status=available\|consumed&search=` |
| POST | `/beers` | Create a new beer |
| GET | `/beers/stats/summary` | Aggregate stats for the authenticated user |
| GET | `/beers/:id` | Get a single beer |
| PUT | `/beers/:id` | Full update of a beer |
| DELETE | `/beers/:id` | Delete a beer |
| PATCH | `/beers/:id/consume` | Mark a beer as consumed |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15
- Redis 7
- npm

> Alternatively, use Docker Compose to spin up Postgres and Redis — see the [Docker Compose](#docker-compose) section.

### Clone and Install

```bash
git clone <repository-url>
cd beer-cellar-backend
npm install
```

### Environment Variables

Copy the example below into a `.env` file at the project root and fill in the values for your environment. See the [Environment Variables](#environment-variables) section for the full list of required keys.

```bash
cp .env.example .env   # if provided, otherwise create .env manually
```

### Run in Development

```bash
npm run dev:watch   # nodemon with auto-reload via ts-node
```

The server starts on the port defined by `PORT` (default `3001`).

### Build for Production

```bash
npm run build   # emits compiled JS to dist/
npm start       # runs dist/index.js
```

---

## Running Tests

```bash
npm test         # vitest in watch mode
npm run test:run # vitest run — single pass (CI)
```

---

## Environment Variables

Create a `.env` file in the project root. **Never commit this file.** The following variables are required:

| Variable | Description |
|---|---|
| `PORT` | HTTP port the server listens on |
| `NODE_ENV` | `development`, `test`, or `production` |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `JWT_SECRET` | Secret for signing access tokens |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh tokens |
| `AWS_ACCESS_KEY_ID` | AWS credentials for S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for S3 |
| `AWS_S3_BUCKET` | S3 bucket name for beer images |
| `AWS_REGION` | AWS region (e.g. `us-east-1`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for Calendar integration |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URI registered in Google Console |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `SMTP_FROM` | Sender address for transactional emails |
| `BACKEND_URL` | Public URL of this backend service |
| `FRONTEND_URL` | Public URL of the frontend (used in CORS and email links) |

All values are accessed internally via the `appConfig` module (`src/config/app.config.ts`). Business code never reads `process.env` directly.

---

## Docker Compose

The `docker-compose.yml` defines three services: `db` (Postgres 15), `redis` (Redis 7), and `backend`.

### Spin up only the infrastructure dependencies

```bash
docker compose up db redis
```

This starts Postgres on port `5432` and Redis on port `6379`, then you can run the backend locally with `npm run dev:watch`.

### Spin up everything

```bash
docker compose up
```

This builds and starts the backend container alongside Postgres and Redis. The backend waits for both services to pass their health checks before starting.

### Tear down

```bash
docker compose down          # stop and remove containers
docker compose down -v       # also remove named volumes (wipes DB data)
```

---

## Key Design Decisions

### All beer queries are scoped by `userId`

Every database read and write for the `Beer` entity includes `userId` in the `WHERE` clause. The user identity always comes from `req.user.id` (the verified JWT payload) — never from a client-supplied field. This prevents horizontal privilege escalation.

### Zod is the single source of truth for types

Schemas in `src/schemas/` are defined once as Zod objects. TypeScript types are derived via `z.infer<>`. Manual type definitions that would duplicate the schema are prohibited. This eliminates the class of bug where the runtime validator and the TypeScript type drift apart.

### Integration failures are non-blocking

Google Calendar event creation and outbound email are side effects. If either fails, the failure is caught, logged via `Logger`, and discarded. The primary HTTP response (e.g., `201 Created` for a new beer) is unaffected. This prevents third-party API outages from degrading core functionality.

### Config is centralized

`src/config/app.config.ts` is the only place in the codebase that reads `process.env`. Services, repositories, and routes import from `appConfig`. This makes the dependency on environment state explicit and easy to mock in tests.

### No raw SQL

All database access goes through TypeORM's repository methods or `QueryBuilder`. Raw SQL strings are prohibited. This keeps queries type-safe, database-portable, and protected against SQL injection by default.

### Middleware is composable and stateless

Protected routes apply `authenticateToken` followed by `validate(Schema)` in sequence. Each middleware piece has a single responsibility and carries no mutable state, making the pipeline easy to reason about and test in isolation.
