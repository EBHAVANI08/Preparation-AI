# Preparation AI

Competitive-exam preparation SaaS built with Next.js, React, TypeScript, MongoDB, Zustand, Tailwind CSS, and a provider-backed AI mentor.

## Local setup

1. Install Node.js 22 and MongoDB, or create a MongoDB Atlas development cluster.
2. Copy `.env.example` to `.env.local`.
3. Set `MONGODB_URI`, `MONGODB_DB`, and a random 32+ character `AUTH_SECRET`.
4. Run `npm install` and `npm run dev`.
5. Verify `http://localhost:3000/api/health` before registering.

## AI automation

Add one or both provider keys to `.env.local`: `GROQ_API_KEY` and `ZAI_API_KEY`. `AI_PROVIDER_ORDER=groq,zai` controls priority. When the first provider times out or fails, the server automatically switches to the next configured provider. Models are configurable through `GROQ_MODEL` and `ZAI_MODEL`; keys and provider calls remain server-only.

## Verification

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

See `ARCHITECTURE.md` for security boundaries, collections, and production requirements.
