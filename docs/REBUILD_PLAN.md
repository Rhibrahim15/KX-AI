# KX Sanctuary OS — Rebuild plan

## Working rule

The existing `main` branch is the preservation point. Rebuild work happens on `rebuild/foundation` and is reviewed before any merge. No legacy code is deleted until its runtime usage and replacement are verified.

## What the current repository shows

- The root Next.js application lives under `src/`; a separate `frontend/` directory also exists. These are competing frontend paths and must be reconciled before deployment.
- The root Express entrypoint is `api/server.ts`. It calls Groq/OpenRouter directly and does not use the richer provider registry in `api/lib/`.
- Telegram has a real polling/transcription path, but stores chat history in process memory.
- Existing UI components, provider clients, RAG code and bot integrations are potential salvage candidates; none should be assumed production-ready without tests and runtime tracing.
- The media route in the root API returns success-shaped demo responses and must not be exposed as a real capability.
- The root API currently lacks authentication and has permissive CORS. Production deployment remains blocked until these are addressed.

## Rebuild sequence

1. **Foundation:** shared types, deterministic context windowing, provider adapter contract, typed LLM failover, identity prompt, repository contract, Prisma schema and extracted audio transcription service.
2. **Persistence:** install Prisma dependencies, generate the client, create migrations, wire session persistence into web chat and Telegram, and prove survival across process restarts.
3. **One frontend:** choose either the root `src/` application or `frontend/` after comparing UI completeness and build health; remove the duplicate only after that decision.
4. **Tools:** implement tool calling with authorization, input validation, audit logs and explicit confirmation for consequential actions.
5. **Knowledge and channels:** integrate RAG and harden Telegram, Discord and WhatsApp against the same session and identity contracts.
6. **Operations:** authentication, rate limits, secret rotation, deploy workflows, backups, monitoring and documented recovery.

## Foundation verification

Run:

```bash
npm run typecheck
npm run test:core
```

The current milestone does not claim persistence is active: the schema and repository adapter are prepared, but the Prisma runtime dependency, migration and database wiring belong to the persistence milestone.
