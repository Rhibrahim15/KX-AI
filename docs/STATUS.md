# KX Sanctuary OS — Verified status

**Audit date:** 16 November 2026  
**Repository:** `Rhibrahim15/KX-AI`  
**Main branch:** `6e2b527` — unchanged  
**Rebuild branch:** `rebuild/foundation`  
**Foundation baseline:** `9d9f650`  
**Hardening branch:** `hardening/login-and-deps` (PR #2)  
**Runtime verification snapshot:** `252bf98` — CI passed  
**Review:** [Draft PR #1](https://github.com/Rhibrahim15/KX-AI/pull/1)

This report supersedes the June 30, 2026 audit. A source file existing is not proof that its capability works end to end. CI confirms compilation and tests only; it does not prove live provider calls or deployment.

## Current findings

| Area | Status | Verified position |
|---|---|---|
| API server | Rebuilt; CI passed | Express uses the shared KX prompt, ContextManager and typed LLMRouter. Production startup requires `API_AUTH_TOKEN`. Helmet headers, explicit CORS and request bounds are enabled. |
| Provider routing | Implemented; unit tested | Groq, OpenRouter, Cerebras and Mistral adapters; configured failover order and per-provider timeout. HTTP 400 is fatal; provider outages may fail over. |
| Context manager | Implemented; unit tested | Approximate token budgeting, pinned messages, deduplication and chronological ordering. An oversized newest message now throws instead of silently disappearing. |
| Web application | Canonical root app | The Next.js application under `src/` is the only active frontend. The duplicate starter app and root HTML prototypes are archived. |
| Web chat | Implemented; CI passed | Chat composer uses the same-origin BFF, sends user/assistant turns only, and displays the actual provider/model. The backend supplies the authoritative identity prompt. |
| Visitor authentication | Implemented for private use | Single-password login, same-origin check, signed 12-hour HttpOnly/SameSite Strict cookie, middleware protection and production fail-closed configuration. |
| Browser credentials | Improved | Standard provider keys and backend token stay server-side. Legacy browser keys are cleared and excluded from persistence/backups. |
| Settings | Simplified | Active UI offers theme selection, privacy disclosures, local conversation backup import/export and local deletion. Unsupported legacy controls are archived. |
| Login throttling | Implemented; integration not yet verified | The login route includes an atomic Upstash Redis Lua counter: 5 attempts per client address per 15-minute window. It has not yet passed CI or a live Upstash abuse test. Production is designed to fail closed if Upstash credentials or a trusted client IP are unavailable.
| API/BFF rate limits | Not implemented | General chat request limits and provider usage budgets remain required before public exposure. |
| Persistent memory | Not active | Prisma schema and repository adapter boundary exist. Prisma package/client, migrations and live chat persistence are not wired. Browser conversations remain local. |
| Telegram | Legacy implementation retained | Existing polling/voice path remains separate and uses in-process history. It is not yet migrated to the shared prompt/router/repository. |
| Discord / WhatsApp | Unverified | Existing code requires end-to-end tests and shared-session integration. |
| Knowledge / RAG | Not connected | GKP/research materials are retained but are not retrieved by the rebuilt chat path. |
| Media generation | Explicitly unavailable | The rebuilt API returns HTTP 501; no simulated generation is reported as success. |
| Deployment | Not verified | No live Railway/Vercel deployment, database restart test, restore test or uptime monitoring is claimed. |

## Rebuild branch contents

- `api/types/core.ts`: shared message, session and context contracts.
- `api/services/ContextManager.ts`: history windowing, pinning, deduplication, ordering and over-sized newest-message rejection.
- `api/adapters/`: provider adapter contract and OpenAI-compatible implementation.
- `api/services/LLMRouter.ts`: ordered provider failover, per-attempt timeout, HTTP 400 fatal semantics.
- `api/agent/prompts.ts`: shared identity and conduct prompt.
- `api/repositories/SessionRepository.ts`: repository interface and Prisma adapter boundary.
- `prisma/schema.prisma`: PostgreSQL session/message schema (not migrated or wired).
- `api/services/audio.service.ts`: reusable Telegram voice-to-Whisper transcription service (not yet wired into the bot).
- `src/app/api/chat/route.ts`: same-origin BFF with request validation and backend token forwarding.
- `middleware.ts`, `src/app/login/`, `src/app/api/access/`: private access gate.
- Simplified `src/components/ChatInput.tsx` and `SettingsModal.tsx`; previous UI code preserved under `docs/archive/legacy-ui/`.
- Root Next.js and active API TypeScript checks, six core unit tests and production-build CI.
- Superseded root documentation, duplicate frontend scaffold and HTML prototypes preserved under `docs/archive/`.

## CI status

Commit `252bf98` passed the complete GitHub Actions pipeline: web TypeScript check, active API TypeScript check, core TypeScript check, six core tests and Next.js production build. The latest branch head `845780b` primarily reorganizes historical docs, the duplicate scaffold and old HTML prototypes; its CI run is separate.

CI also reports dependency advisories during `npm ci` (25 total in the observed install: 13 moderate, 10 high, 2 critical). The latest completed CI log captured 25 total advisories (13 moderate, 10 high, 2 critical), including 12 in production dependencies (5 moderate, 5 high, 2 critical). Dependency upgrades are not being applied blindly: the Next.js/React major-version compatibility impact and transitive dependency paths need a separate tested upgrade.

## Security and operational blockers

1. Add shared brute-force protection to the login endpoint.
2. Add distributed rate limits and provider usage budgets at the BFF and backend.
3. Rotate any provider, bot or GitHub credentials previously exposed in chats/screenshots.
4. Complete Prisma dependencies/migrations and persistent chat wiring.
5. Migrate Telegram and prove restart continuity.
6. Verify real provider calls and authenticated web-to-API operation.
7. Deploy privately, then test backups, restore, monitoring and rollback before considering public access.

## Next acceptance gates

1. Latest archive/documentation commit passes CI.
2. Dependency audit is captured and high/critical issues have reviewed remediation decisions.
3. Persistent conversations survive API restarts.
4. Telegram uses the same identity, context manager and repository.
5. Distributed rate limits and spend controls are implemented and tested.
6. Only then consider production deployment.
