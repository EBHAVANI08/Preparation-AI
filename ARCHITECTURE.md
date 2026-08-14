# Preparation AI architecture

Preparation AI is a modular Next.js SaaS application. React renders the product, route handlers enforce the security boundary, and MongoDB is the durable source of truth.

## Request path

`browser -> Next.js route -> session -> validation -> authorization -> domain logic -> MongoDB`

The signed session is stored in an HTTP-only cookie. Every tenant-owned record carries `organizationId`; authorization queries include both `userId` and `organizationId`.

## Exam integrity

Starting an exam generates a canonical exam and stores it in `attempts`. The public response is sanitized and never contains correct options, numeric answers, tolerances, or answer keys. Submission sends an attempt ID and answers. Evaluation reloads the canonical exam and stores an idempotent result.

## Collections

- `users`: identity and student profile
- `organizations`: tenant and plan
- `memberships`: role within a tenant
- `attempts`: canonical exam, submission, and result
- `audit_events`: security and administrative events (foundation index included)

## Production dependencies

- MongoDB Atlas replica set with backups
- A 32+ character `AUTH_SECRET` from a secrets manager
- AI provider credentials
- Redis-compatible distributed rate limiter before horizontal scaling
- Queue/worker for reports, notifications, and expensive AI work

The current in-memory limiter protects a single process. Replace it with Redis when deploying more than one application instance.

## AI gateway

Mentor requests use a provider-neutral gateway. `AI_PROVIDER_ORDER` sets preferred providers, while timeouts and provider errors trigger automatic fallback. Groq and Z.ai are supported through server-side OpenAI-compatible APIs. Conversations, selected provider, and model are persisted in MongoDB. Provider keys never cross the server boundary.

## Operations

- `GET /api/health` reports database readiness.
- `npm run check` runs type checking, lint, and tests.
- GitHub Actions verifies checks and the production build.
- Security headers are configured globally in `next.config.ts`.
