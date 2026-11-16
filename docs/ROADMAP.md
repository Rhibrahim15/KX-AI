# KX Sanctuary OS — Roadmap

> **Current position: Phase 0 (Foundation), not yet committed.**
> Each phase has acceptance criteria — a checkbox is only ticked when its criterion is *demonstrated*, not
> when the code is written.

---

## Phase 0 — Foundation restructure ⬅ **WE ARE HERE**

Commit the "house" as designed in [`ARCHITECTURE.md`](ARCHITECTURE.md):

- [ ] `api/types/core.ts` — Message / SessionState / ContextPackage / ModelProvider
- [ ] `api/services/ContextManager.ts` — hybrid windowing, pinned messages, dedupe
- [ ] `api/adapters/types.ts` + `api/adapters/OpenAIAdapter.ts` — provider adaptation
- [ ] `api/services/LLMRouter.ts` — typed failover; **400 = fatal, no failover**
- [ ] `prisma/schema.prisma` + install `prisma` & `@prisma/client`
- [ ] `api/repositories/SessionRepository.ts` — interface + `PrismaSessionRepository`
- [ ] `api/services/audio.service.ts` — extract Groq Whisper pipeline from `bots/telegram.ts`
- [ ] `api/agent/prompts.ts` — single identity prompt (replaces `GODMODE_SYSTEM_PROMPT` import)
- [ ] Update `tsconfig`/scripts; `npx tsc --noEmit` passes

**Acceptance:** `npm run api` still boots (no behavior regression); new units compile; Prisma client
generates. Nothing is claimed "working" beyond that.

---

## Phase 1 — Persistence end-to-end (the amnesia cure)

- [ ] `DATABASE_URL` wired (local Postgres or Railway plugin); `prisma migrate dev`
- [ ] `POST /v1/chat/completions` rewritten: session upsert → persist user msg → ContextManager → Router →
      persist assistant msg + provider (transaction)
- [ ] `api/controllers/telegram.controller.ts` (webhook mode) OR `bots/telegram.ts` refactored onto
      SessionRepository — in-memory `Map` deleted
- [ ] Session listing endpoint `GET /v1/sessions` (for the UI later)

**Acceptance (must be demonstrated):** have a conversation → kill the server → restart → ask "what did I
say earlier?" → the assistant answers from the DB. Screenshot it.

---

## Phase 2 — Premium PWA frontend (Vercel)

- [ ] Replace boilerplate `frontend/app/page.tsx` with the real premium UI: centered glowing orb, greeting,
      quick actions (Take Notes / Brainstorm / Get Advice), bottom input bar (attach · search · reason · mic),
      light/dark themes, mobile-first, fluid animations — quality bar: the Dribbble references or better
- [ ] `src/app/api/chat/route.ts` — BFF proxy to `KX_AI_BACKEND_URL` (keeps backend URL and any token
      server-side), streaming pass-through
- [ ] Chat view: markdown, code highlighting, honest error states (no fake optimistic "success")
- [ ] PWA: manifest + icons + offline shell
- [ ] Deploy to Vercel; set `KX_AI_BACKEND_URL`

**Acceptance:** open the Vercel URL on a phone, send a message, receive a real reply from the Railway
backend, switch theme, install as PWA.

---

## Phase 3 — Hands I: web + GitHub + files

- [ ] Tool-calling protocol through the adapters (`toolCalls`/`toolCallId` already in the type contract)
- [ ] `search` tool — Tavily first, SerpAPI fallback; returns real URLs
- [ ] `github` tool — read repo/issue/commit via REST (token scoped, read-mostly first)
- [ ] `file` tool — sandboxed read/write within a workspace directory
- [ ] System prompt: tool-use policy (when to search, when to act, when to ask)

**Acceptance:** "search for X and summarize with sources" → resolves real URLs; "what's in my KX-AI repo?"
→ real file list from GitHub.

---

## Phase 4 — Media & voice out (kill the stub)

- [ ] **Delete the fake `/v1/media/video/image` behavior.** Re-verify every provider endpoint against
      official docs: Kling, Seedance (PiAPI), MiniMax Hailuo, Luma, HF FLUX, Imagen, Together
- [ ] Honest async job flow: create task → poll status → return real file URL (or the provider's real error)
- [ ] ElevenLabs TTS reply path (Telegram voice reply toggle; web playback)
- [ ] Web audio input: upload/record → same AudioService as Telegram

**Acceptance:** image and video requests return actual openable files. A failing provider produces its real
error message, not "success".

---

## Phase 5 — Knowledge: RAG + long-term memory

- [ ] Re-index `gkp/` + founder documents into a vector store (pgvector on the same Postgres, or Chroma)
- [ ] Retrieval into `ContextPackage.ragContext` (top-k, token-capped)
- [ ] Importance scoring: detect deadlines/appointments/tasks → `isImportant`/`category` automatically
- [ ] "What do you remember about GreenByte/AgroLingo?" answered from memory + corpus

**Acceptance:** ask about a fact stored weeks prior (via DB) and a fact from the corpus — both answered.

---

## Phase 6 — Omnichannel hardening

- [ ] WhatsApp: webhook verification (GET hub.challenge) + inbound→reply loop via the shared controller
- [ ] Discord: verify gateway end-to-end against live server; slash commands
- [ ] One identity, one memory: the same session continuity across channels (per-user mapping)

**Acceptance:** the same question asked on Telegram and WhatsApp gets consistent, memory-aware answers.

---

## Phase 7 — Deployment, security, operations

- [ ] Railway backend live (Prisma `migrate deploy` on boot, healthcheck, log drain)
- [ ] `API_AUTH_TOKEN` middleware; per-IP + per-key rate limiting; CORS locked to the Vercel origin
- [ ] Secret rotation completed (all previously exposed keys replaced)
- [ ] Uptime + error monitoring; `/v1/health` extended with provider reachability
- [ ] Backups: Railway Postgres daily snapshot verified by a restore test

**Acceptance:** public URLs work; unauthorized requests are rejected; a restore test passes.

---

## Phase 8 — Autonomy

- [ ] Reminders & scheduled checks (cron on Railway): deadlines, market/price checks, security advisories
- [ ] Proactive notifications (Telegram push) — the NOTIFY verb of the mentor matrix
- [ ] Daily brief: agenda, tasks, weather/agriculture signal for GreenByte

**Acceptance:** KX messages the founder first — with something true and useful — without being asked.

---

### Later / exploratory (no dates, no promises)

- Ollama self-hosted uncensored stack (the honest path to 90%+ compliance)
- VoIP calls (Twilio/Deepgram/11Labs realtime), mobile app, VSCode companion
- AgroLingo AI product integration (KX as research officer)
- Multi-user onboarding (only if the personal mission ever expands)