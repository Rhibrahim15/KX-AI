# KX Sanctuary OS — Deployment and operations

**Status: deployment guide for the rebuild target; not a declaration that production is live.**

Target topology: Next.js on Vercel → Express API on Railway → PostgreSQL via Prisma. The API and BFF are being rebuilt on branch `rebuild/foundation`.

## 1. Current deployment gate

Do **not** expose the web application publicly yet.

The backend requires a bearer token in production, and the Next.js BFF keeps that token server-side. However, the BFF does not yet authenticate individual visitors or apply reliable rate limiting. An unrestricted visitor could still make requests through the BFF and spend the founder's provider quota.

Before public release, implement and verify:
- Visitor authentication or a reliable hosting-level access gate.
- Rate limiting at the BFF and backend.
- Request/usage limits and abuse monitoring.
- Secret rotation and tested incident recovery.
- Persistent storage and backup/restore verification.

## 2. Railway — API

Deploy the repository root as a Node.js service.

Recommended settings for the current API milestone:

| Setting | Value |
|---|---|
| Root directory | Repository root |
| Install | `npm ci` |
| Start | `npm run api` |
| Health check | `/v1/health` |
| Port | Railway-provided `PORT` |

Required environment:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Set to `production` |
| `PORT` | Supplied by Railway |
| `API_AUTH_TOKEN` | Strong random bearer token required at production startup |
| `CORS_ORIGINS` | Exact web origin(s), comma-separated |
| `GROQ_API_KEY` | Primary provider key |
| `OPENROUTER_API_KEY` | First fallback provider |
| `CEREBRAS_API_KEY` | Optional fallback |
| `MISTRAL_API_KEY` | Optional fallback |
| `LLM_PROVIDER_ORDER` | For example `groq,openrouter,cerebras,mistral` |

Use only provider credentials you have actually provisioned. Keep keys in Railway's variable manager, not in source files or Docker build arguments.

**Database note:** `DATABASE_URL` and the Prisma schema are prepared, but Prisma dependencies, migrations and repository wiring are not complete. Do not add a production database migration command to the start command until the persistence milestone is implemented and tested.

## 3. Vercel — web application

Import the same repository. Configure:

| Setting | Value |
|---|---|
| Root directory | Repository root (`.`) |
| Build command | `npm run build` |
| Framework | Next.js |
| App source | Root `src/` application |

The separate `frontend/` directory is starter scaffold and is not the canonical UI.

Server-only environment variables:

| Variable | Value |
|---|---|
| `KX_AI_BACKEND_URL` | HTTPS Railway API origin, e.g. `https://<service>.up.railway.app` |
| `KX_AI_BACKEND_TOKEN` | Same secret value as Railway's `API_AUTH_TOKEN` |

Do not prefix these variables with `NEXT_PUBLIC_`. The server-side route `src/app/api/chat/route.ts` reads them and forwards the backend token. The browser calls only the same-origin `/api/chat` route.

## 4. Authentication and CORS

- Production API startup fails when `API_AUTH_TOKEN` is missing.
- Protected API requests require `Authorization: Bearer <API_AUTH_TOKEN>`.
- `GET /v1/health` is public for hosting-platform health checks.
- `CORS_ORIGINS` must be an explicit comma-separated list. Wildcard origins are rejected.
- The BFF-to-API request is server-to-server. CORS is not visitor authentication.
- Visitor authentication and rate limiting are still missing from the BFF. Treat the app as private-development-only until both are in place.

## 5. Database and persistence milestone

The Prisma schema defines sessions and messages, and a repository adapter contract exists. The following are not complete yet:
- Install and lock `prisma` and `@prisma/client`.
- Generate Prisma Client and add reviewed migrations.
- Wire inbound message persistence before provider execution.
- Persist assistant messages and provider affinity transactionally.
- Refactor Telegram onto the same repository.
- Prove conversation continuity by restarting the API process.

Only after this gate passes should a Railway PostgreSQL service and production migration step be treated as active requirements.

## 6. Channels and optional integrations

| Channel | Current position |
|---|---|
| Web | Root UI and same-origin BFF exist; public visitor authentication is outstanding |
| Telegram | Existing polling and Whisper code retained; not yet migrated to shared persistence |
| Discord | Existing code requires end-to-end verification and shared-session integration |
| WhatsApp | Existing send/webhook code requires complete inbound/reply verification |
| Media | Disabled; API returns HTTP 501 |
| RAG / tools | Not yet connected to the new chat path |

Do not label a channel deployed until a live end-to-end test passes.

## 7. Smoke tests

After the required deployment gates are met:

1. `GET /v1/health` returns `200`.
2. A protected direct API request without a bearer token returns `401`.
3. A chat request through `POST /api/chat` returns a real assistant response and identifies the actual provider/model.
4. A provider failure causes documented failover; HTTP 400 does not fail over.
5. A media request returns explicit `501` until media generation is implemented.
6. After persistence is complete, restart the backend and verify the conversation remains available.
7. Visitor access and rate limits reject unauthorized or excessive requests.
8. Backups are restored successfully in a test environment.

## 8. Secret hygiene

- Rotate every key ever shared in a chat, screenshot, log or source file.
- Keep `.env` local and git-ignored. Commit placeholders only in `.env.example`.
- Keep API keys on the backend.
- Store the BFF token only in Vercel server environment variables.
- Never log authorization headers or raw secrets.
