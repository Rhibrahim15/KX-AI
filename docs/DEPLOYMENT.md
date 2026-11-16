# KX Sanctuary OS — Deployment Guide

> Target topology: **Vercel** (Next.js PWA) ↔ **Railway** (Node.js + Express + TypeScript) ↔ **PostgreSQL**
> (Railway plugin or Supabase) via **Prisma**. Bots run inside/next to the Railway backend.
>
> Hugging Face Spaces is **retired** for this project (stuck deployments, port/persistence constraints).
> This guide documents the intended setup; steps get executed in Phase 1/2/7 — nothing here is claimed as
> "already deployed".

---

## 1. Prerequisites

- GitHub repo: `https://github.com/Rhibrahim15/KX-AI`
- Accounts: Vercel, Railway, and the relevant provider consoles (Groq, OpenRouter, Cerebras, Mistral,
  Google AI Studio, etc.)
- **Rotate every API key that was ever pasted into a chat or screenshot BEFORE deploying** (see §6).

---

## 2. Railway — backend

1. **New Project → Deploy from GitHub repo** → select `Rhibrahim15/KX-AI`.
2. Service settings:
   - Build: `npm install && npx prisma generate`
   - Start: `npx prisma migrate deploy && npm run api`
   - Root directory: repository root
   - Healthcheck path: `/v1/health`
   - Port: use Railway's injected `PORT` (server already reads `process.env.PORT`)
3. **Add PostgreSQL**: Project → New → Database → PostgreSQL. Railway injects `DATABASE_URL` into the
   service (link variables if it doesn't).
4. Generate a public domain (Settings → Networking). Note it — the frontend needs it:
   `https://kx-api-production-xxxx.up.railway.app`
5. Set environment variables (Variables tab). Never commit them.

### Required variables (backend)

| Variable | Powers | Required |
|---|---|---|
| `DATABASE_URL` | Prisma → PostgreSQL | ✅ (Phase 1+) |
| `GROQ_API_KEY` | Primary LLM + **Whisper ASR** | ✅ |
| `OPENROUTER_API_KEY` | Failover LLM (100+ models) | ✅ |
| `CEREBRAS_API_KEY` | Failover LLM (very fast) | recommended |
| `MISTRAL_API_KEY` | Failover LLM (coding) | recommended |
| `GEMINI_API_KEY` | Fallback + Imagen images | recommended |
| `NVIDIA_NIM_API_KEY` | Failover LLM | optional |
| `TELEGRAM_BOT_TOKEN` | Telegram channel | for Telegram |
| `DISCORD_BOT_TOKEN` | Discord channel | for Discord |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_VERIFY_TOKEN` | WhatsApp Cloud API | for WhatsApp |
| `TAVILY_API_KEY` / `SERPAPI_KEY` | Web search tool (Phase 3) | Phase 3 |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` | TTS voice replies (Phase 4) | Phase 4 |
| `PIAPI_API_KEY`, `KLING_API_KEY`, `MINIMAX_API_KEY`, `LUMA_API_KEY` | Video generation (Phase 4) | Phase 4 |
| `HUGGINGFACE_API_KEY`, `REPLICATE_API_KEY` | Image/video aux (Phase 4) | Phase 4 |
| `API_AUTH_TOKEN` | Backend auth middleware (Phase 7) | ✅ before public |

> `DEEPGRAM_API_KEY` / `ASSEMBLYAI_API_KEY` are reserved for the future VoIP/realtime phase — not required now.

---

## 3. Vercel — frontend

1. **Add New Project → Import** the same GitHub repo.
2. **Root Directory: repository root (`.`).** The root `src/` app is the substantive UI; `frontend/` is a separate starter scaffold and is not the deployment target.
3. Environment variables:
   - `KX_AI_BACKEND_URL = https://<railway-domain>` (server-side only, used by `src/app/api/chat/route.ts`)
   - `KX_AI_AUTH_TOKEN` (once Phase 7 auth exists; forwarded server-side, never exposed to the browser)
4. Deploy. The planned BFF pattern (`src/app/api/chat/route.ts`) will proxy browser → Vercel function → Railway, so the
   backend origin/token never reach client code and CORS stays locked down.

### Auth & CORS policy (Phase 7)

- Railway backend: reject requests without `Authorization: Bearer <API_AUTH_TOKEN>` (bots and the Vercel
  BFF hold the token).
- CORS allowlist: only the Vercel production domain and `localhost` in dev.

---

## 4. Database workflow (Prisma)

```bash
# local dev
npx prisma migrate dev --name init      # creates migration + client
npx prisma studio                       # inspect sessions/messages

# production (Railway start command)
npx prisma migrate deploy               # applies pending migrations, no prompts
```

- Backups: Railway Postgres daily snapshots; **run a restore test** before trusting them.
- `CHROMA_DB_PATH` (from older env) is unnecessary if RAG moves to **pgvector on the same Postgres**
  (Phase 5 recommendation: one database, one backup story).

---

## 5. Bots

| Bot | Mode | Notes |
|---|---|---|
| Telegram | Long-polling inside the Railway backend (`bots/telegram.ts` or the new controller) | No public webhook needed; survives restarts; **requires Phase 1 to keep memory across restarts** |
| Discord | Gateway WebSocket inside the backend | Verify end-to-end in Phase 6 |
| WhatsApp | Webhook route mounted on the Express server (`/webhooks/whatsapp`) | Requires `WHATSAPP_VERIFY_TOKEN` handshake; HTTPS endpoint is Railway's public domain |

---

## 6. Security checklist (do not skip)

- [ ] **Rotate all exposed keys**: GitHub token, HF token, and every provider key pasted in earlier chats.
      Treat them as compromised. Regenerate → update Railway/Vercel env → revoke old ones.
- [ ] `.env` stays local; only `.env.example` lives in git (already enforced — verified).
- [ ] Enable `API_AUTH_TOKEN` middleware before making the Railway URL public.
- [ ] WhatsApp verify token: long random string, not the current placeholder-style value.
- [ ] Telegram: consider `setWebhook` with a secret path token instead of long-polling for production.
- [ ] Provider keys on Railway should be **project-level variables**, never in the Dockerfile or code.

---

## 7. Smoke test (run after every deploy)

1. `GET /v1/health` → `{"status":"ok"}`
2. `POST /v1/chat/completions` with a test message → real model answer naming the provider used
3. Telegram: text message answered; **voice note** in Hausa answered
4. Restart the Railway service → previous conversation still remembered (Phase 1+)
5. Vercel URL loads the PWA; a chat message round-trips through the BFF (Phase 2+)
6. Unauthorized `curl` without token → `401` (Phase 7+)

Only after all applicable tests pass may a channel be called "deployed".

---

## 8. Cost notes (free-tier discipline)

- LLM traffic order: **Groq (fastest free) → Cerebras → Mistral → OpenRouter (free models) → Gemini**;
  paid models only on explicit need.
- ContextManager caps history (~8k tokens) — no accidental 100k-token bills.
- Media generation is the most expensive capability: explicit user intent only, never automatic.
- Railway free/trial credit + Railway Postgres are sufficient for a personal system at daily-use volume;
  monitor the Railway usage dashboard.