# KX Sanctuary OS — Deployment and operations

**Status:** target deployment guide, not a declaration that production is live.

Target topology: Next.js on Vercel → Express API on Railway → PostgreSQL via Prisma. The current rebuilt application is suitable for private development and integration testing only.

## 1. Current deployment gate

**Do not expose the web application publicly yet.**

The backend requires a bearer token in production. The Next.js app also has a private password gate with a signed 12-hour HttpOnly session cookie. Middleware protects pages and API routes and fails closed when production access secrets are missing.

These controls are not a complete public-service security layer. Distributed login throttling, shared BFF/API rate limiting, usage budgets, abuse monitoring and incident recovery are still outstanding. A signed-in user could otherwise consume the founder's provider quota.

Before public release, implement and verify:
- Shared brute-force protection for the login endpoint.
- Distributed request limits at the BFF and backend.
- Provider usage/spend budgets and abuse monitoring.
- Secret rotation and recovery runbooks.
- Persistent storage, backups and a successful restore test.

## 2. Railway — API

Deploy the repository root as a Node.js service.

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
| `API_AUTH_TOKEN` | Strong random bearer token; required at production startup |
| `CORS_ORIGINS` | Exact web origin(s), comma-separated |
| `GROQ_API_KEY` | Primary provider credential |
| `OPENROUTER_API_KEY` | Fallback provider credential |
| `CEREBRAS_API_KEY` | Optional fallback |
| `MISTRAL_API_KEY` | Optional fallback |
| `LLM_PROVIDER_ORDER` | For example `groq,openrouter,cerebras,mistral` |

Keep credentials in Railway's variable manager, never in source files or Docker build arguments.

**Database note:** `DATABASE_URL` and the Prisma schema are prepared, but Prisma dependencies, migrations and repository wiring are not complete. Do not add a production migration command to the start command until the persistence milestone has been implemented and tested.

## 3. Vercel — web application

Import the same repository.

| Setting | Value |
|---|---|
| Root directory | Repository root (`.`) |
| Build command | `npm run build` |
| Framework | Next.js |
| Application source | Root `src/` app |

The separate starter frontend and root HTML prototypes have been archived under `docs/archive/`. They are not deployment targets.

Server-only environment variables:

| Variable | Value |
|---|---|
| `KX_AI_BACKEND_URL` | HTTPS Railway API origin, e.g. `https://<service>.up.railway.app` |
| `KX_AI_BACKEND_TOKEN` | Same secret value as Railway's `API_AUTH_TOKEN` |
| `KX_WEB_ACCESS_PASSWORD` | Unique private workspace password |
| `KX_WEB_SESSION_SECRET` | Independent random signing secret, at least 32 characters |

Never prefix these variables with `NEXT_PUBLIC_`. The server-side route `src/app/api/chat/route.ts` reads them and forwards the backend bearer token. The browser calls only the same-origin `/api/chat` route.

## 4. Authentication and request boundaries

- Production API startup fails if `API_AUTH_TOKEN` is missing.
- Protected API requests require `Authorization: Bearer <API_AUTH_TOKEN>`.
- `GET /v1/health` is public for hosting health checks.
- `CORS_ORIGINS` must be an explicit comma-separated allowlist; wildcard origins are rejected.
- Express uses Helmet security headers.
- The BFF rejects cross-origin chat POSTs, validates message roles and size, and forwards the token server-side.
- The web password gate uses a signed 12-hour HttpOnly, SameSite Strict cookie. The login route checks the request origin and compares the password using a timing-safe comparison.
- Distributed brute-force protection, request rate limiting and usage budgets remain missing. Keep the application private until these are configured.

## 5. Database and persistence milestone

The Prisma schema defines sessions and messages, and a repository adapter boundary exists. The following are not complete:
- Install and lock `prisma` and `@prisma/client`.
- Generate Prisma Client and add reviewed migrations.
- Wire inbound message persistence before provider execution.
- Persist assistant messages and provider affinity transactionally.
- Migrate Telegram to the same repository.
- Prove conversation continuity by restarting the API process.

Only after this gate passes should a Railway PostgreSQL service and production migration step be treated as active requirements.

## 6. Channels and optional integrations

| Channel | Current position |
|---|---|
| Web | Root UI and password-gated same-origin BFF exist; shared rate limiting is outstanding |
| Telegram | Existing polling and Whisper code retained; not migrated to shared persistence |
| Discord | Existing code requires end-to-end verification and shared-session integration |
| WhatsApp | Existing code requires complete webhook verification and inbound/reply testing |
| Media | Disabled; API returns HTTP 501 |
| RAG / tools | Not connected to the rebuilt chat path |

Do not label a channel deployed until a live end-to-end test passes.

## 7. Smoke tests

After the deployment gates are met:

1. `GET /v1/health` returns `200`.
2. A protected API request without a bearer token returns `401`.
3. An unauthenticated web request is redirected to `/login`; an unauthenticated BFF call returns `401`.
4. A chat request through `POST /api/chat` returns a real assistant response with the actual provider/model.
5. Provider outages fail over; HTTP 400 does not.
6. Media requests return explicit `501` until real generation is implemented.
7. After persistence is complete, restart the API and verify conversations remain available.
8. Distributed login/BFF/backend rate limits reject abusive request patterns.
9. Database backups restore successfully in a test environment.

## 8. Secret hygiene

- Rotate every key ever shared in a chat, screenshot, log or source file.
- Keep `.env` local and git-ignored. Commit placeholders only in `.env.example`.
- Keep provider keys and the API bearer token on the backend.
- Store the BFF token and web access secrets only in server environment variables.
- Never log authorization headers, session cookies or raw secrets.
