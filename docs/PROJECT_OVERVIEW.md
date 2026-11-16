# KX Sanctuary OS — Project overview

**Version:** 2.0  
**Updated:** 16 November 2026  
**Status:** Private development rebuild; not production deployed.

## 1. What KX is

KX Sanctuary OS (KX-AI) is a personal, multilingual AI assistant for Halifa Rabiu Ibrahim and his work across software engineering, GreenByte and AgroLingo AI.

The intended role is a dependable intellectual partner: it should advise, critique, guide, improve and notify. It should not flatter, invent actions, fabricate evidence or claim a tool succeeded when it did not.

KX is intended to become one assistant identity across a web workspace and messaging channels, supported by persistent memory, dependable provider routing and carefully permissioned tools. That is the product vision, not a claim that every capability is already operational.

## 2. Mission

Build a practical personal AI system that can be maintained by its founder, works naturally in English, Hausa and Arabic, remembers information that the user has chosen to retain, and performs useful actions through verified tools.

The engineering priorities are:

1. **Honesty:** distinguish completed work, planned work, assumptions and limitations.
2. **Continuity:** one identity and context model across channels.
3. **Memory:** durable, user-reviewable session and long-term memory.
4. **Agency with permission:** real tools, explicit authorization and confirmation for consequential actions.
5. **Maintainability:** one active frontend, one API, typed boundaries and reproducible builds.
6. **Cost discipline:** use a small provider set and bounded context; avoid unnecessary external services.

## 3. Current implementation

As of 16 November 2026, the rebuild branch contains:

- A root Next.js application under `src/`.
- A same-origin chat BFF that forwards to the backend with a server-side bearer token.
- A private password gate using a signed 12-hour HttpOnly session cookie.
- An Express API that applies the shared KX prompt and ContextManager.
- A typed provider router for Groq, OpenRouter, Cerebras and Mistral.
- HTTP 400 fatal semantics, provider failover and bounded request sizes.
- A simplified composer and settings interface.
- A Prisma schema and repository boundary prepared for future persistence.
- A reusable Telegram voice-note transcription service not yet wired into the bot.

The core TypeScript checks, six unit tests and Next.js production build passed in CI on commit `252bf98`. The latest branch also archives the duplicate frontend scaffold, old HTML prototypes and superseded root-level project documents. `main` remains untouched while the draft pull request is reviewed.

## 4. What is not yet working

The current rebuild must not be described as a complete autonomous or omnichannel assistant.

- **Server-side memory:** not wired. Conversations are currently stored in the browser; PostgreSQL persistence is a future milestone.
- **Telegram:** the existing bot remains on a legacy router and in-memory Map; it has not been migrated to the shared runtime.
- **Discord and WhatsApp:** existing source code is unverified/incomplete.
- **RAG:** retained research/GKP files are not connected to the new chat path.
- **Tools:** search, GitHub actions, file operations and MCP are not exposed as working tools in the new runtime.
- **Voice output and media:** not implemented in the rebuilt path. Media routes return HTTP 501.
- **Autonomy:** no scheduled tasks or proactive notifications are active.
- **Public operations:** distributed rate limits, provider usage budgets, monitoring, backups and recovery procedures are outstanding. The deployment must remain private.

The exact status and next acceptance criteria live in [STATUS.md](STATUS.md) and [ROADMAP.md](ROADMAP.md).

## 5. Product principles

- Real results over impressive claims.
- One source of truth for identity and current capability.
- User messages must never silently disappear from model context.
- HTTP 400 from a provider is treated as a request defect, not an outage.
- Unsupported features return explicit errors.
- Memory and sensitive context require review, access control and deletion paths.
- Every capability needs an observable acceptance test before it is called complete.

## 6. Target capability areas

| Area | Long-term direction |
|---|---|
| Cognitive core | Typed multi-provider routing with explicit error semantics |
| Perception | Voice, image and document intake; English/Hausa/Arabic support |
| Memory | PostgreSQL sessions, pinned facts, tasks and user-controlled long-term memory |
| Knowledge | Curated project corpus and retrieval with source attribution |
| Tools | Search, GitHub, files and integrations with authorization and audit logs |
| Voice | Optional multilingual transcription and speech output |
| Omnichannel | Web, Telegram, Discord and WhatsApp using one identity/repository |
| Autonomy | Scheduled reminders and user-approved proactive notifications |

These are target capabilities. See the verified status before relying on any of them.

## 7. Deployment direction

The preferred future topology is:
- Vercel for the root Next.js web app.
- Railway for the long-running Express API and messaging processes.
- PostgreSQL with Prisma for durable session storage.
- Provider credentials stored only in backend environment variables.

No live deployment is claimed. The current system is a private development build.

## 8. Non-goals

- No unconditional-obedience or “uncensored 100%” promise. Hosted models have provider policies and limits.
- No simulated tools, fake media jobs or fabricated success.
- No commercial multi-user SaaS, billing or tenant architecture until the personal system is reliable.
- No unnecessary provider/database/tool sprawl before the core restart and recovery tests pass.

---

If the code disagrees with this overview, update the document to match the code and observed behavior.
