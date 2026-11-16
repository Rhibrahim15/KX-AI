# KX Sanctuary OS — Architecture

**Last updated:** 16 November 2026  
**Active application:** root Next.js app under `src/`  
**Active API entrypoint:** `api/server.ts`  
**Rebuild branch:** `rebuild/foundation`

This document separates the working rebuild slice from the intended long-term system. It does not treat an interface or a planned module as proof of a live capability.

## 1. Current runtime — what is wired

```
Browser
  │
  ▼
Next.js middleware
  ├── verifies signed private-access cookie
  └── redirects unauthenticated visitors to /login
  │
  ▼
src/app (React / Next.js)
  │
  └── POST /api/chat
        ├── same-origin check
        ├── validates message roles and payload size
        ├── strips client system prompts
        └── attaches KX_AI_BACKEND_TOKEN server-side
              │
              ▼
        api/server.ts (Express)
          ├── Helmet headers
          ├── explicit CORS allowlist
          ├── API_AUTH_TOKEN bearer check
          ├── request bounds
          ├── shared KX_SYSTEM_PROMPT
          ├── ContextManager
          └── LLMRouter
                ├── Groq
                ├── OpenRouter
                ├── Cerebras
                └── Mistral
```

The web chat request is stateless at the API layer: the browser sends the selected conversation turns with every request. Browser conversation data is stored in the local Zustand store. The backend does not yet persist messages to PostgreSQL.

### Separate legacy messaging processes

```
Telegram bot ──▶ old api/lib/llm_router.ts
     ├── legacy in-memory chat history
     └── existing Groq Whisper voice-note transcription

Discord bot ───▶ old router (not verified end to end)
WhatsApp code ─▶ Graph API send path (inbound/reply flow incomplete)
```

These bots are retained for migration, but they do not yet share the rebuilt web prompt, ContextManager, provider router or repository.

### Explicitly unavailable on the rebuild API

- Media routes return HTTP 501 until real provider jobs and result retrieval exist.
- RAG, MCP tools, GitHub execution, file execution, TTS and scheduled autonomy are not connected to the rebuilt chat path.
- Legacy `api/routes/*` and most `api/lib/*` modules are not mounted by the active API server.

## 2. Foundation contracts

### 2.1 Shared types — `api/types/core.ts`

The shared types establish one vocabulary for messages, sessions, context and provider names. They are used by ContextManager, provider adapters and the repository boundary.

### 2.2 ContextManager — `api/services/ContextManager.ts`

Current behavior:
- Estimates tokens as `ceil(character count / 4)`; it is a heuristic, not a tokenizer.
- Defaults to an 8,000-token history target and a 20-message ordinary-history limit.
- Includes pinned (`isImportant`) messages before ordinary history.
- Deduplicates by message ID, with a timestamp/role/content-prefix fallback.
- Selects ordinary history newest-first, then sorts the retained result chronologically.
- Throws when the system prompt/retrieved context or pinned messages exceed their budget.
- Also throws when the newest ordinary message cannot fit, rather than silently sending a prompt that omits the user's latest ask.

The context manager is deterministic and O(n) over the supplied history.

### 2.3 Provider adapters — `api/adapters/`

`OpenAICompatibleAdapter` currently serves:
- Groq
- OpenRouter
- Cerebras
- Mistral

It converts a ContextPackage into an OpenAI-compatible chat completion payload and parses assistant text. Gemini and Ollama appear in the provider type union as future options; dedicated adapters are not currently wired into the new router.

### 2.4 LLMRouter — `api/services/LLMRouter.ts`

- Default configured order: `groq → openrouter → cerebras → mistral`.
- The order is configurable through `LLM_PROVIDER_ORDER`.
- Each provider attempt has a timeout.
- HTTP 400 is treated as an application/payload error and stops failover.
- Other provider failures may move to the next configured adapter.
- The successful result includes response text, provider and model.
- There is no static fallback answer pretending a provider responded.

## 3. Identity and request flow

The authoritative system identity lives in `api/agent/prompts.ts`. The browser does not send a system prompt; the BFF accepts only user and assistant turns, and the Express API supplies the shared prompt.

Current web request sequence:

1. The user submits a message in the root Next.js app.
2. The composer adds the user turn to local conversation state.
3. The browser sends previous user/assistant turns plus the new turn to `POST /api/chat`.
4. Next middleware requires a valid private-access session.
5. The BFF validates origin, role, message count and character limits.
6. The BFF forwards the request to the configured API with the backend bearer token.
7. Express validates the request again, applies ContextManager, and calls LLMRouter.
8. The API returns an OpenAI-compatible response including actual provider/model metadata.
9. The browser records the assistant response locally.

The browser currently retains local conversation history. A backend restart does not lose browser history, but another device or Telegram does not share it. This is not persistent server-side memory.

## 4. Persistence — prepared, not active

Files already present:
- `prisma/schema.prisma`: Session and Message models.
- `api/repositories/SessionRepository.ts`: repository contract and Prisma adapter boundary.

Still required:
- Install and lock `prisma` and `@prisma/client`.
- Generate Prisma Client and add migrations.
- Provision PostgreSQL and configure `DATABASE_URL`.
- Persist the inbound user message before model execution.
- Persist assistant response/provider affinity transactionally.
- Add authenticated session retrieval and deletion.
- Migrate Telegram to the same repository.
- Demonstrate memory continuity after terminating and restarting the API.

Until those steps are complete, do not describe KX as having PostgreSQL memory.

## 5. Voice and messaging channels

`api/services/audio.service.ts` extracts the Telegram voice-note sequence into a reusable service:
- Telegram getFile and download.
- In-memory audio Blob/FormData.
- Groq Whisper `whisper-large-v3`.
- No forced language parameter; transcription provider handles language detection.

The existing Telegram bot has not yet been migrated to this service and the shared repository. Discord and WhatsApp remain unverified/incomplete. The intended next step is to move every channel behind a shared controller contract rather than duplicate prompt/router logic.

## 6. Security boundaries

Implemented:
- Private web password gate and signed 12-hour HttpOnly/SameSite Strict cookie.
- Production fails closed if web access password/session secret are absent.
- Same-origin checks on login and BFF chat requests.
- Backend bearer authentication required in production.
- Explicit CORS origin allowlist; wildcard origins are rejected.
- Helmet security headers.
- Request count and character bounds at the BFF and API.
- Provider credentials and backend token remain server-side.

Still missing:
- Distributed login throttling and BFF/backend rate limiting.
- Per-user identity/accounts and role-based authorization.
- Provider usage quotas/budgets and abuse monitoring.
- Formal security/privacy assessment and incident recovery runbooks.
- Database encryption/backup/restore validation once persistence exists.

This is a private development system, not ready for unrestricted public exposure.

## 7. Target architecture

The longer-term target is:

```
Web / Telegram / Discord / WhatsApp
                 │
           Channel adapters
                 │
          Shared controllers
                 │
        persist inbound message
                 │
       ContextManager + KX prompt
                 │
             LLMRouter
                 │
          Provider adapters
                 │
       persist assistant result
                 │
       SessionRepository / Prisma
                 │
             PostgreSQL
                 │
      RAG, tools and scheduled jobs
```

The order remains **Foundation → Plumbing → Rooms → Furniture**. Persistence and one channel migration come before advanced autonomy or a large tools surface.

## 8. Non-negotiable engineering rules

1. No success-shaped fake responses. Unsupported features return an explicit error.
2. The latest user message must never be silently dropped from context.
3. HTTP 400 is fatal and does not trigger provider failover.
4. One KX identity prompt is shared across channels.
5. A feature is marked complete only after its acceptance test passes.
6. Keep legacy modules until usage is traced and replacements are verified; archive rather than silently deleting valuable project history.
7. Keep deployments private until authentication, rate limiting, usage budgets, monitoring and recovery are tested.

## 9. Deployment topology

Target:
- Vercel: root Next.js application.
- Railway: long-running Express API and, later, bot processes.
- PostgreSQL: session and message storage after persistence work.
- Provider API keys: backend environment variables only.

Deployment is not yet verified. See [DEPLOYMENT.md](DEPLOYMENT.md).
