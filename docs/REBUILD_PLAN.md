# KX Sanctuary OS — Rebuild plan

**Current branch:** `rebuild/foundation`  
**Preservation branch:** `main` (unchanged)  
**Review:** [Draft PR #1](https://github.com/Rhibrahim15/KX-AI/pull/1)

## Working rules

- Build and test in small, reviewable commits.
- Keep the active product to one Next.js application, one Express API and one shared identity.
- Preserve useful legacy code and documents in `docs/archive/` until runtime references are traced.
- Never mark a capability complete because a file or interface exists.
- Keep the service private until the login endpoint, BFF and API have distributed rate limits and usage controls.

## What is established

- The canonical frontend is the root Next.js application under `src/`. The duplicate starter app and root HTML prototypes are archived.
- The active Express entrypoint is `api/server.ts`; it uses the new prompt, ContextManager and LLMRouter.
- Provider clients wired into the rebuilt router: Groq, OpenRouter, Cerebras and Mistral.
- Telegram still runs through a legacy router and in-process Map; it is not yet on shared memory.
- Prisma schema and repository adapter are prepared, but the Prisma runtime dependency, migrations and database wiring are not complete.
- The rebuilt media endpoint returns HTTP 501; old media clients are not considered verified.
- Root docs and legacy prototypes have been separated from the active product source.

## Milestone 0 — Core foundation <done>

- [x] Shared message/session/context/provider contracts.
- [x] ContextManager: pinned messages, windowing, deduplication and chronological ordering.
- [x] Reject an oversized newest message instead of silently omitting it.
- [x] OpenAI-compatible adapter contract and implementation.
- [x] LLMRouter with configured failover, provider timeout and HTTP 400 fatal semantics.
- [x] Shared KX system identity prompt.
- [x] Prisma schema and repository adapter boundary (not a live database).
- [x] Reusable Telegram voice-note transcription service.
- [x] Core tests and separate web/API TypeScript checks.

**Acceptance:** core checks pass; the Next.js production build passes. CI passed on commit `252bf98` (six core tests). The latest archive-only commit has its own CI run.

## Milestone 1 — Server-side chat and private web shell <done with open hardening>

- [x] Root Next.js app selected as the active frontend.
- [x] Same-origin BFF; server-side backend bearer token.
- [x] Backend identity prompt is authoritative; client system prompts are not accepted.
- [x] Standard chat uses server-managed automatic model routing.
- [x] Remove legacy multi-model composer, obfuscation, telemetry and client-side response transformations from the active path.
- [x] Private password gate with signed 12-hour HttpOnly session.
- [x] Simplified Settings: appearance, privacy and local-data controls.
- [x] Remove duplicate frontend scaffold and superseded root docs from active paths.
- [ ] Shared brute-force protection for login.
- [ ] Distributed rate limiting and provider usage budgets.
- [ ] Complete accessibility/mobile review and authenticated live-provider smoke test.

**Acceptance:** an authenticated private web session reaches the API through the BFF and displays an actual response with provider/model metadata. CI build alone does not prove provider credentials are valid.

## Milestone 2 — Persistent memory

- [ ] Install and lock `prisma` / `@prisma/client`.
- [ ] Generate the client and add reviewed migration files.
- [ ] Provision PostgreSQL and configure `DATABASE_URL`.
- [ ] Persist the inbound user turn before provider execution.
- [ ] Persist assistant response and provider affinity transactionally.
- [ ] Add session fetch/list/delete endpoints with access controls.
- [ ] Move browser memory to the backend without losing export/import compatibility.
- [ ] Demonstrate survival after killing and restarting the API.

**Acceptance:** conversation history can be retrieved after an API process restart and is not tied to one browser.

## Milestone 3 — Telegram migration

- [ ] Refactor Telegram to the shared KX prompt, ContextManager and LLMRouter.
- [ ] Replace in-memory `Map` history with SessionRepository.
- [ ] Use `AudioService` for real voice-note transcription.
- [ ] Map Telegram identity to the correct private session.
- [ ] Test duplicate updates, API failures, retry/backoff and restart recovery.

**Acceptance:** Telegram conversation history survives restart and uses the same KX behavior as web.

## Milestone 4 — Tools

- [ ] Typed tool protocol and registry.
- [ ] Web search returning real URLs.
- [ ] GitHub read operations; writes require explicit confirmation.
- [ ] Sandboxed file operations with validation and audit trail.
- [ ] Timeouts, permissions, per-tool errors and usage ceilings.

**Acceptance:** every exposed tool produces verifiable results; unimplemented tools remain unavailable.

## Milestone 5 — Knowledge and RAG

- [ ] Curate the retained GKP/research corpus.
- [ ] Choose vector storage only after PostgreSQL persistence is stable.
- [ ] Add retrieval into ContextPackage with a token cap and source metadata.
- [ ] Add user-visible review, correction and deletion of stored memory.

**Acceptance:** KX can answer from saved memory and retrieved documents while distinguishing source evidence from inference.

## Milestone 6 — Voice and media

- [ ] Wire AudioService into Telegram and test Hausa/English/Arabic transcription.
- [ ] Add web audio upload/recording through the same service.
- [ ] Add optional TTS after selecting and verifying a provider.
- [ ] Re-verify image/video provider APIs and implement real async job tracking.
- [ ] Keep HTTP 501 until a real media result can be retrieved.

**Acceptance:** real audio is transcribed, and media requests return an openable file or an honest provider error.

## Milestone 7 — Omnichannel

- [ ] Discord gateway end-to-end verification.
- [ ] WhatsApp webhook verification and inbound-to-reply loop.
- [ ] Shared identity and per-user session mapping across channels.

**Acceptance:** one user receives consistent KX identity and persistent context on each verified channel.

## Milestone 8 — Production operations

- [ ] Shared brute-force protection and distributed rate limits.
- [ ] Provider quota/spend limits and abuse monitoring.
- [ ] Secret rotation and documented incident response.
- [ ] Private Railway/Vercel deployment and health checks.
- [ ] Logs/metrics without leaking credentials or sensitive content.
- [ ] Database backups and successful restore test.
- [ ] Rollback and recovery runbook.

**Acceptance:** unauthorized and excessive requests are rejected; backups restore; the system can be operated and recovered safely.

## Milestone 9 — Autonomy

- [ ] Scheduled reminders and checks.
- [ ] Proactive notifications under user-configured permissions.
- [ ] Daily briefing from verified calendar, task and external data sources.

**Acceptance:** KX sends a useful, accurate notification under an explicitly configured schedule.

## Later / exploratory

- Local Ollama/self-hosted models.
- Mobile, voice-call or desktop/VS Code clients.
- AgroLingo AI integration.
- Multi-user onboarding only if the product direction changes.
