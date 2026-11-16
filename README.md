# KX Sanctuary OS

KX is a personal, multilingual AI workspace built around one assistant identity. It is designed to help its founder think clearly, learn, build software, and manage projects. The long-term direction is persistent memory, useful tools, and continuity across web and messaging channels.

**Engineering rule:** functionality is not complete until it works and has been tested end to end. Unsupported capabilities must say so clearly.

## Current state

The rebuild is isolated on `rebuild/foundation`; `main` remains unchanged. Work is tracked in [draft PR #1](https://github.com/Rhibrahim15/KX-AI/pull/1).

| Area | Current position |
|---|---|
| Core API | Express uses the shared KX prompt, context manager and typed provider router |
| Provider routing | Groq, OpenRouter, Cerebras and Mistral; configured order, per-provider timeout, HTTP 400 stops failover |
| Context | Approximate token budget, pinned messages, deduplication, chronological ordering; rejects an oversized newest message |
| Web app | One canonical Next.js application under `src/`; duplicate scaffold and prototypes are archived |
| Web chat | Same-origin BFF, same-origin request check, private password gate, server-side backend token |
| Credentials | Provider credentials stay on the backend; legacy browser keys are excluded from persistence and backups |
| Memory | Prisma schema and repository boundary prepared; migrations and live persistence are not wired |
| Messaging | Existing Telegram/Discord/WhatsApp code is retained but not yet migrated to the shared runtime |
| Knowledge and media | Preview/legacy areas only; media endpoint returns HTTP 501 |
| Production operations | Private password gate and bearer authentication exist; distributed rate limiting, usage budgets and monitoring are still required |

See [verified status](docs/STATUS.md), [architecture](docs/ARCHITECTURE.md), and [roadmap](docs/ROADMAP.md).

## Architecture

```
Browser
  │
  ▼
Next.js 16 app (src/)
  ├── private access proxy (`proxy.ts`)
  └── POST /api/chat (same-origin BFF)
        │ server-only backend token
        ▼
Express API (api/server.ts)
  ├── KX identity prompt
  ├── ContextManager
  └── LLMRouter
        └── Groq → OpenRouter → Cerebras → Mistral

Future: SessionRepository → Prisma → PostgreSQL
```

The API is currently stateless. The browser sends the conversation turns with each chat request; browser conversations are stored locally. PostgreSQL memory and cross-channel session continuity are not yet active.

## Local development

Requirements: Node.js 20.9+ (Node 22 LTS recommended) and npm.

```bash
git clone https://github.com/Rhibrahim15/KX-AI.git
cd KX-AI
npm ci
cp .env.example .env
```

Configure at least one provider key (for example `GROQ_API_KEY`) and set:

```dotenv
KX_AI_BACKEND_URL=http://localhost:7860
```

For local development, leave `API_AUTH_TOKEN`, `KX_AI_BACKEND_TOKEN`, `KX_WEB_ACCESS_PASSWORD` and `KX_WEB_SESSION_SECRET` empty unless you explicitly want to test authentication. In production, all relevant access secrets must be configured.

Start the API in terminal 1:

```bash
npm run api:dev
```

Start the web app in terminal 2:

```bash
npm run dev
```

Open `http://localhost:3000`. API health: `http://localhost:7860/v1/health`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run typecheck:api
npm run typecheck:core
npm run test:core
npm run build
```

GitHub Actions runs lint, type checks, unit tests, dependency audits and the Next.js production build for rebuild pushes and pull requests. The core suite currently covers context handling and provider failover semantics. A green build does not prove live provider credentials, persistence, messaging channels or deployment.

## Configuration

See [.env.example](.env.example).

- `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `CEREBRAS_API_KEY`, `MISTRAL_API_KEY`: server-side provider credentials.
- `LLM_PROVIDER_ORDER`: server-side failover order.
- `API_AUTH_TOKEN`: backend bearer token; required when `NODE_ENV=production`.
- `CORS_ORIGINS`: explicit allowed browser origins; wildcard origins are rejected.
- `KX_AI_BACKEND_URL`: backend origin used by the Next.js BFF.
- `KX_AI_BACKEND_TOKEN`: must match backend `API_AUTH_TOKEN`; server-only, never use a `NEXT_PUBLIC_` prefix.
- `KX_WEB_ACCESS_PASSWORD`: private web workspace password; required in production.
- `KX_WEB_SESSION_SECRET`: independent random signing secret (minimum 32 characters); required in production.
- `DATABASE_URL`: reserved for the persistence milestone; current chat does not use it.

## Framework and model defaults

The web runtime is being upgraded to Next.js 16 with React 19. The private access gate uses Next.js 16's `proxy.ts` convention. Groq defaults to `openai/gpt-oss-120b`; OpenRouter defaults to the `openrouter/free` model router. Both remain configurable through environment variables.

## Important limitations

- Conversations are stored in this browser, not PostgreSQL. Switching browsers or devices does not sync them.
- Standard chat uses server-managed automatic provider routing. The server reports the actual provider and model used.
- The backend supplies the only authoritative KX system prompt. The browser sends user/assistant turns only.
- Telegram's current bot still uses legacy in-process history; it has not been moved to the shared repository or router.
- Discord and WhatsApp are not integrated with the rebuilt runtime.
- RAG, MCP tools, GitHub/file execution, TTS and media generation are not operational on the rebuilt chat path. Media requests return HTTP 501.
- The access gate is a private single-password gate, not a full identity system. Shared brute-force protection, distributed rate limiting, usage budgets and monitoring are not implemented. **Do not expose KX publicly until these controls are added and tested.**

## Repository layout

- `src/`: canonical Next.js web application.
- `api/`: Express API and rebuilt core services.
- `bots/`: legacy messaging clients awaiting migration.
- `prisma/`: planned PostgreSQL schema.
- `gkp/`, `research/`: retained knowledge and research material; not yet connected to the rebuilt chat path.
- `docs/`: authoritative architecture, status, deployment and roadmap.
- `docs/archive/`: superseded documents, duplicate UI and historical prototypes.

The old `frontend/` scaffold, root HTML prototypes and superseded root documentation have been moved under `docs/archive/` to keep one active application path.

## Security

1. Never commit `.env`, API keys, bot tokens or access tokens.
2. Rotate credentials that have ever been pasted into chats, screenshots, logs or source files.
3. Keep provider keys and the backend bearer token on the server.
4. Use a unique web password and a separate random session secret of at least 32 characters.
5. Keep the deployment private until distributed rate limiting, usage caps, monitoring and recovery procedures are implemented.

## License

AGPL-3.0. See [LICENSE](LICENSE).
