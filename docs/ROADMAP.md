# KX Sanctuary OS — Rebuild roadmap

**Current position:** Foundation work is in progress on `rebuild/foundation` (draft PR #1). `main` remains untouched. A milestone is complete only after its acceptance tests pass.

## Phase 0 — Foundation

- [x] `api/types/core.ts` — shared message/session/context/provider contracts
- [x] `api/services/ContextManager.ts` — token estimate, windowing, pinned messages, deduplication
- [x] `api/adapters/types.ts` and `OpenAICompatibleAdapter.ts`
- [x] `api/services/LLMRouter.ts` — configured failover; HTTP 400 is fatal
- [x] `api/agent/prompts.ts` — one shared identity prompt
- [x] `api/repositories/SessionRepository.ts` — repository boundary and Prisma adapter
- [x] `prisma/schema.prisma` — Session/Message schema authored
- [x] `api/services/audio.service.ts` — reusable Telegram Whisper transcription service
- [ ] Install and lock `prisma` / `@prisma/client`; generate client and migration
- [ ] Full Next.js build and runtime integration pass on the latest commit

**Acceptance:** core type-check and unit tests pass; production app build passes; API boots without regression. Persistence is not claimed in this phase.

## Phase 1 — Persistent memory

- [ ] Install Prisma dependencies and generate reviewed migrations
- [ ] Wire `DATABASE_URL` and a PostgreSQL database
- [ ] Persist inbound user messages before model execution
- [ ] Persist assistant message and provider affinity transactionally
- [ ] Migrate Telegram conversation history from the in-memory Map
- [ ] Add session retrieval/listing APIs with appropriate authorization

**Acceptance:** send a conversation, terminate the API process, restart it, and retrieve earlier messages from PostgreSQL.

## Phase 2 — Web application

- [x] Select the substantive root Next.js app under `src/` as the canonical UI candidate
- [x] Replace standard browser-to-provider calls with a same-origin BFF
- [x] Keep the backend token server-side and remove legacy provider keys from browser persistence/backups
- [x] Replace arbitrary model picker with honest server-managed routing
- [x] Remove misleading claims and hide unverified tools from primary navigation
- [ ] Pass the production build on the latest revision
- [ ] Add visitor authentication/access gate
- [ ] Add reliable rate limiting and usage budgets
- [ ] Add user-visible provider status, retry and error states
- [ ] Verify accessibility, mobile layout and keyboard interaction

**Acceptance:** access-controlled web app sends a real request through the BFF to the backend and displays the actual responding provider/model.

## Phase 3 — Tools

- [ ] Typed tool protocol and registry
- [ ] Web search with real source URLs
- [ ] GitHub read operations first; write operations require explicit confirmation
- [ ] Sandboxed file tools with path validation and audit logs
- [ ] Per-tool permissions, timeouts and structured errors

**Acceptance:** every exposed tool performs a real call and returns verifiable results. Unsupported operations remain unavailable.

## Phase 4 — Voice and media

- [ ] Complete shared Telegram voice-service extraction and tests
- [ ] Add web audio upload/recording through the same AudioService
- [ ] Add optional TTS output after a real provider integration is chosen
- [ ] Re-verify image/video provider APIs before implementing jobs and polling
- [ ] Retain HTTP 501 until the media provider lifecycle is genuinely complete

**Acceptance:** voice transcription can be repeated with real audio; media output is an openable generated file or a precise provider error.

## Phase 5 — Knowledge and long-term memory

- [ ] Curate and index the project knowledge corpus
- [ ] Choose a supported vector strategy (pgvector is preferred only after PostgreSQL persistence is operational)
- [ ] Retrieve top-k content into ContextPackage under a token budget
- [ ] Add explicit memory review, correction and deletion controls

**Acceptance:** answer questions from stored personal memory and cited project documents without inventing context.

## Phase 6 — Omnichannel

- [ ] Telegram uses the shared prompt, router, ContextManager and repository
- [ ] Discord gateway passes live end-to-end tests
- [ ] WhatsApp webhook verification and inbound→reply loop complete
- [ ] Map identities safely so one user's sessions are not exposed to another

**Acceptance:** the same user receives consistent KX identity and persistent context on each verified channel.

## Phase 7 — Production operations

- [ ] Visitor authentication for the web BFF
- [ ] Backend and BFF rate limiting, request caps and abuse controls
- [ ] Secret rotation and provider spend limits
- [ ] Railway/Vercel deployment and health checks
- [ ] Logs/metrics/error monitoring without leaking prompts or credentials
- [ ] Database backups and a successful restore test
- [ ] Document runbooks and rollback procedure

**Acceptance:** unauthorized callers are rejected, usage is bounded, backups restore, and the service can be operated and recovered safely.

## Phase 8 — Autonomy

- [ ] Scheduled tasks and reminders
- [ ] Proactive notifications with user-configured permissions
- [ ] Daily briefing from verified calendar/tasks/weather/agriculture sources

**Acceptance:** KX initiates a useful, accurate notification under an explicitly configured schedule.

## Later / exploratory

- Local Ollama/self-hosted models
- Advanced voice calls and mobile client
- AgroLingo AI integration
- Multi-user onboarding only if the product direction changes
