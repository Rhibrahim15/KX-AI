# KX Sanctuary OS

**KX** is a personal, multilingual AI assistant designed to help its founder think clearly, learn, build software, and manage work. The long-term direction is one assistant identity across web and messaging channels, backed by durable memory and tools that perform real actions.

This repository is being rebuilt around a simple rule: **working, testable software over feature claims**.

## Current engineering status

As of **16 November 2026**, the repository is under an architectural rebuild on the `rebuild/foundation` branch.

| Area | Verified position |
|---|---|
| API | Express entrypoint now uses the shared prompt, context manager and typed provider router on the rebuild branch |
| Provider routing | Groq, OpenRouter, Cerebras and Mistral OpenAI-compatible adapters; 15-second per-provider timeout; HTTP 400 stops failover |
| Context | Deterministic token-estimated windowing, deduplication and pinned-message handling |
| Memory | Prisma schema and repository adapter prepared; database migrations and chat/Telegram persistence are not wired yet |
| Telegram | Existing polling and voice-transcription implementation is retained for refactoring; persistent shared sessions are not yet implemented |
| Web UI | Existing root `src/` components and a separate `frontend/` app both exist; the canonical frontend has not yet been selected |
| Discord / WhatsApp | Existing integration code requires end-to-end verification and shared-session wiring |
| Media generation | Deliberately returns HTTP 501 until a real provider integration and task lifecycle are implemented |
| Production security | Production startup requires `API_AUTH_TOKEN`; CORS uses an explicit origin allowlist. Rate limiting and operational hardening remain future work |

Do not describe persistence, omnichannel continuity, media generation or deployment as complete until their acceptance tests have passed.

## Architecture

The target runtime is intentionally layered:

```
Web / Telegram / Discord / WhatsApp
                |
           Controllers
                |
       ContextManager + prompt
                |
       Typed LLMRouter
                |
       Provider adapters
                |
     SessionRepository (Prisma)
                |
        PostgreSQL memory
```

See [docs/REBUILD_PLAN.md](docs/REBUILD_PLAN.md) for the rebuild sequence. Architecture and product decisions belong in `docs/`; older code is preserved until its replacement is verified.

## Quick start

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/Rhibrahim15/KX-AI.git
cd KX-AI
npm ci
cp .env.example .env
```

Add at least one model provider key to `.env`, then run:

```bash
npm run typecheck:core
npm run test:core
npm run api:dev
```

Health check:

```bash
curl http://localhost:7860/v1/health
```

Local API requests do not require `API_AUTH_TOKEN` unless you configure one. The API accepts an OpenAI-compatible `messages` array at `POST /v1/chat/completions`. Until the persistence milestone is completed, callers must send the conversation history they want the model to see.

## Configuration

See [.env.example](.env.example). Only the variables required for the feature being run should be configured. Never paste credentials into issues, chat, screenshots or source files. Rotate any credential that may have been exposed.

For production:
- Set `NODE_ENV=production` and a strong `API_AUTH_TOKEN`.
- Set `CORS_ORIGINS` to the exact deployed frontend origin(s).
- Store credentials in the hosting provider's secret manager.
- Do not expose the backend publicly before authentication, rate limiting and monitoring are reviewed.

## Engineering rules

1. No fake success responses. Unsupported functionality returns an explicit error.
2. Persist inbound messages before model execution once the database milestone is wired.
3. HTTP 400 from a provider is treated as an application/payload defect and does not trigger failover.
4. Keep one KX identity prompt shared by all channels.
5. Keep changes small, tested and reversible. Do not delete legacy modules until references and replacements are verified.

## License

AGPL-3.0. See [LICENSE](LICENSE).
