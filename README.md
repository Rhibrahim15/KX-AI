# KX Sanctuary OS

KX is a personal, multilingual AI workspace built around one assistant identity. Its purpose is to help its founder think clearly, learn, build software, and manage projects. The long-term direction is persistent memory, useful tools, and continuity across web and messaging channels.

**Engineering rule:** functionality is not considered complete until it works and has been tested end to end. Unsupported features must say so clearly.

## Current state

The active rebuild is on `rebuild/foundation`; `main` remains unchanged. The work is being delivered in small, reviewable milestones through [draft PR #1](https://github.com/Rhibrahim15/KX-AI/pull/1).

| Area | Current position |
|---|---|
| Core API | Shared identity prompt, context manager and typed provider router are wired into the Express entrypoint on the rebuild branch |
| Provider routing | Groq, OpenRouter, Cerebras and Mistral adapters; configured order; provider timeout; HTTP 400 stops failover |
| Context | Approximate token budget, pinned messages, deduplication and chronological history selection |
| Web chat | Root Next.js app under `src/`; standard chat uses a same-origin BFF at `/api/chat` |
| Credentials | Standard chat credentials stay on the backend. Optional legacy keys are session-only and excluded from browser persistence and backups |
| Memory | Prisma schema and repository boundary prepared; Prisma dependencies, migrations and live persistence are not wired yet |
| Messaging channels | Existing Telegram/Discord/WhatsApp code is retained but not yet migrated to the shared core or proven end to end |
| Knowledge and media | Preview/legacy areas only. Media API explicitly returns HTTP 501 rather than fake success |
| Production access | Password gate and signed 12-hour HttpOnly sessions are implemented; shared rate limiting and usage budgets are still required before public exposure |

See [docs/STATUS.md](docs/STATUS.md) for the verified status and [docs/ROADMAP.md](docs/ROADMAP.md) for the build gates.

## Architecture

```
Browser
  │
  ▼
Next.js app (src/) ── POST /api/chat
  │                    server-side BFF
  │                    KX_AI_BACKEND_URL
  │                    KX_AI_BACKEND_TOKEN
  ▼
Express API (api/server.ts)
  │
  ├── shared KX identity prompt
  ├── ContextManager
  ├── LLMRouter
  │     └── Groq → OpenRouter → Cerebras → Mistral
  │
  └── SessionRepository (prepared; persistence not yet wired)
           │
           ▼
       PostgreSQL / Prisma (next milestone)
```

Channels are interfaces, not separate assistants. All channels must eventually use the same identity, context rules and persistent repository.

## Local development

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/Rhibrahim15/KX-AI.git
cd KX-AI
npm ci
cp .env.example .env
```

In `.env`, configure at least one provider key (for example `GROQ_API_KEY`) and set:

```dotenv
KX_AI_BACKEND_URL=http://localhost:7860
```

If you set `API_AUTH_TOKEN` locally, set `KX_AI_BACKEND_TOKEN` to the same value. For a local development-only API with `NODE_ENV=development`, both can be left empty.

Start the API in terminal 1:

```bash
npm run api:dev
```

Start the Next.js app in terminal 2:

```bash
npm run dev
```

Open `http://localhost:3000`. API health check: `http://localhost:7860/v1/health`.

## Quality checks

```bash
npm run typecheck
npm run typecheck:api
npm run typecheck:core
npm run test:core
npm run build
```

The GitHub Actions workflow checks the Next.js application, active API entrypoint, core contracts and unit tests on rebuild pushes and pull requests. The full Next.js production build is included so frontend integration errors are not hidden by passing core-only tests.

## Configuration

See [.env.example](.env.example).

- `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY`, `MISTRAL_API_KEY`: server-side model provider credentials.
- `LLM_PROVIDER_ORDER`: server-side failover order.
- `API_AUTH_TOKEN`: backend bearer token; required when `NODE_ENV=production`.
- `CORS_ORIGINS`: explicit allowed browser origins; wildcard origins are rejected.
- `KX_AI_BACKEND_URL`: backend origin used by the Next.js BFF.
- `KX_AI_BACKEND_TOKEN`: must match backend `API_AUTH_TOKEN`; server-only, never use a `NEXT_PUBLIC_` prefix.
- `KX_WEB_ACCESS_PASSWORD`: private web workspace password; required in production.
- `KX_WEB_SESSION_SECRET`: independent random signing secret (minimum 32 characters); required in production.
- `DATABASE_URL`: reserved for the persistence milestone; the current chat path does not use it yet.

## Important limitations

- Chat history is not yet persisted in PostgreSQL. The current browser workspace stores conversations locally; the API receives the message history with each request.
- The root app's model selector is intentionally replaced with server-managed automatic routing. The server reports the actual provider and model used.
- Telegram voice-note transcription is being extracted into a shared service; the existing bot has not yet been migrated to persistent shared sessions.
- Discord and WhatsApp are not yet integrated with the new runtime.
- Knowledge retrieval, MCP tools and media generation are not claimed as operational. Media requests return HTTP 501.
- The BFF is protected by a password gate and signed 12-hour HttpOnly cookie. This does not provide distributed brute-force protection, request throttling or provider usage budgets. Do not expose the web app publicly until reliable shared rate limiting and monitoring are configured.

## Security

1. Never commit `.env`, API keys, bot tokens or access tokens.
2. Rotate credentials that have ever been pasted into chats, screenshots, logs or source files.
3. Keep provider keys in backend environment variables.
4. Keep `KX_AI_BACKEND_TOKEN` in the Next.js server environment only.
5. Do not treat the application as public-deployment-ready until visitor authentication, rate limiting, monitoring and recovery procedures are implemented.

## License

AGPL-3.0. See [LICENSE](LICENSE).
