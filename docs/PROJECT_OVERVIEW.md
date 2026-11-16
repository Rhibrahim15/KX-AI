# KX Sanctuary OS — Project Overview

> The single authoritative description of the project: what it is, why it exists, what it must become, and how we
> will know it succeeded.
> **Version:** 1.0 · **Date:** 2026-06-30 · **Status:** Living document (updated as the build progresses)

---

## 1. Description — What is KX Sanctuary OS?

**KX Sanctuary OS (KX-AI)** is a personal, autonomous, agentic AI assistant. It is built by and for
**Halifa Rabiu Ibrahim**, founder of **GreenByte**, and it exists to be his lifelong intellectual partner —
not a product for a market, not a demo, not a wrapper around one LLM.

Concretely, KX Sanctuary OS is being built as a **hybrid system** closer to Jarvis/Siri/Friday than to a chatbot:

```
        YOU (voice / text / photo / file)
                     │
   ┌─────────────────▼──────────────────┐
   │  OMNICHANNEL FRONT DOORS           │
   │  Web PWA · Telegram · Discord ·    │
   │  WhatsApp (· VoIP, VSCode later)   │
   └─────────────────┬──────────────────┘
                     │
   ┌─────────────────▼──────────────────┐
   │  PERCEPTION LAYER                  │
   │  Whisper ASR (EN/HA/AR auto) ·     │
   │  image/file intake · language ID   │
   └─────────────────┬──────────────────┘
                     │
   ┌─────────────────▼──────────────────┐
   │  COGNITIVE CORE                    │
   │  ContextManager (memory window) ·  │
   │  LLM Router w/ failover ·          │
   │  system identity & judgment rules  │
   └─────────────────┬──────────────────┘
                     │
   ┌─────────────────▼──────────────────┐
   │  MEMORY & KNOWLEDGE                │
   │  PostgreSQL sessions (Prisma) ·    │
   │  RAG corpus · pinned facts ·       │
   │  tasks/deadlines/appointments      │
   └─────────────────┬──────────────────┘
                     │
   ┌─────────────────▼──────────────────┐
   │  HANDS (TOOLS / EXECUTION)         │
   │  Web search · GitHub · files ·     │
   │  media generation · automation     │
   └────────────────────────────────────┘
```

It runs on infrastructure chosen for durability and cost: **Next.js PWA (root `src/` app) on Vercel**, **Node.js + Express +
TypeScript on Railway**, **PostgreSQL (Prisma)** for memory, and a chain of **mostly-free LLM providers**
(Groq, Cerebras, Gemini, Mistral, OpenRouter, NVIDIA NIM, Ollama) so that no single rate-limit can take it down.

---

## 2. The founder context — Why this exists

Halifa Rabiu Ibrahim is a developer, systems architect, and ethical-hacking intern who runs **GreenByte**,
whose flagship project **AgroLingo AI** is a Hausa-first agricultural intelligence platform for Northern
Nigerian farmers (weather, pest/disease diagnosis, farm economics, market intelligence).

The working reality this project solves:

- **Too many brains, no coordinator.** Excellent free AI APIs (Groq, Cerebras, Gemini, Mistral, NVIDIA,
  OpenRouter) — each rate-limited, each forgetful, each in its own tab.
- **Tools without a mind.** Telegram/Discord/WhatsApp bots, ElevenLabs voices, video generators (Kling,
  Seedance, MiniMax, Luma), image models (FLUX, Imagen), search APIs (Tavily, SerpAPI) — all paid for or
  provisioned, all disconnected.
- **No memory, no continuity.** A personal advisor that forgets yesterday cannot mentor anyone for a lifetime.
- **No honesty layer.** Chatbots agree with everything. Halifa needs something that **criticizes his code,
  challenges his plans, and warns him of risks** — an advisor, not a yes-man.

KX Sanctuary OS is the unification: **one identity, one memory, many mouths (channels), many brains
(providers), and — as the build progresses — real hands (tools).**

---

## 3. Mission

> **Build one real, autonomous, omnichannel personal AI — with persistent memory, honest judgment, and
> working hands — that serves Halifa Rabiu Ibrahim daily across English, Hausa, and Arabic, and can be
> fully maintained and deployed by him alone, at near-zero recurring cost.**

What the mission means operationally:

| Pillar of the mission | Concrete commitment |
|---|---|
| **One identity** | The same system prompt, standards, and personality across every channel and provider. KX is the same entity on web, Telegram, Discord, and WhatsApp. |
| **Real memory** | Sessions and important facts persist in PostgreSQL. "Pinned" facts survive context-window trimming. Nothing is lost on restart. |
| **Honest judgment** | KX advises, criticizes, guides, improves, and notifies — it does not flatter. Brutal honesty toward the founder is a feature, not a failure mode. |
| **Working hands** | Every tool (search, GitHub, media, files) must perform a real API call with real results. An endpoint that cannot act returns an honest error (501/502), never a fake "success". |
| **Zero simulation** | No feature is reported as working until it has been executed against the live provider and observed working. |
| **Cost discipline** | Free tiers first, token frugality always (hybrid context windowing, capped history, no wasteful calls), paid fallbacks only where value is proven. |
| **Maintainability** | Clean layered architecture (types → context → adapters → router → repositories → controllers) so Halifa — a developer himself — can extend and repair it without archaeology. |

---

## 4. Vision

> **A Jarvis-class personal agent: it listens and speaks (EN/HA/AR), it executes, it lives everywhere Halifa
> is, it never goes down, and it remembers everything that matters — for years.**

The vision expresses itself through these long-term properties:

1. **Omniscience of context** — it knows the founder's projects (GreenByte, AgroLingo AI), his standards,
   his religion and culture, his goals. It never asks "who are you?" twice.
2. **Omnipresence** — WebApp/PWA, Telegram, Discord, WhatsApp today; VoIP calls, mobile, and a VSCode
   companion later. The channel is an interface detail, not a different assistant.
3. **True multilingualism** — English, Hausa, and Arabic in *both* directions (hearing via Whisper with
   automatic language detection; speaking via neural TTS). Code-switching (Hausa/English mix) is normal, not
   an edge case.
4. **Agency** — not just answering: running searches, managing GitHub repos, drafting documents, generating
   images/video for AgroLingo content, tracking deadlines, and proactively notifying the founder.
5. **Indestructible cognition** — a failover chain meant for the free-tier world: when Groq throttles,
   Cerebras answers; when hosted providers all fail, Ollama answers locally.
6. **Mentor matrix** — five verbs define its behavior: **ADVISE** (strategy), **CRITICIZE** (code/schema
   flaws, immediately and honestly), **GUIDE** (step-by-step breakdowns), **IMPROVE** (refactors, drafts),
   **NOTIFY** (vulnerabilities, deadlines, market shifts).

### The obedience question (answered honestly)

The founder asked for "80–90% obedience / uncensored behavior, with 100% accepted as impossible." The
engineering position, stated plainly:

- **Hosted providers (Groq, Gemini, Mistral, OpenRouter, NVIDIA, Cerebras) have hard content filters.** No
  system prompt removes them. We can maximize compliance through: a strong sovereign system prompt,
  choosing the least-restrictive *appropriate* models per task, temperature/structure choices, and routing
  policy — and we will be honest about the residual refusals.
- **True 90%+ uncensored operation requires self-hosted weights (Ollama with uncensored community models)
  on hardware we control.** That is a legitimate later phase, not a promise we make today.
- **Never claim 100%.** Any system that promises that is lying to its owner.

---

## 5. Design philosophy (the code of conduct of this repo)

1. **Real > impressive.** A working Telegram voice note beats ten fake dashboards.
2. **Stub means visible.** Unfinished endpoints return `501 Not Implemented` with a reason — never a
   success-shaped lie.
3. **Brutal honesty flows both ways.** The assistant tells the founder the truth; the codebase tells its
   readers the truth (see `docs/STATUS.md`).
4. **The house order: Foundation → Plumbing → Rooms.** Types first, then context/plumbing, then adapters,
   then the router with context handoff, then persistence, then controllers, then UI. No hacking the router
   before the data contracts exist.
5. **Token frugality.** Hybrid context windowing (~8k token target, 20-message cap, pinned facts preserved),
   `/4`-length token estimation, deduplicated history. Sufficiency, not extravagance.
6. **Every shared contract is typed.** TypeScript strict where it matters; interfaces before implementations.
7. **Restartable by design.** If Railway drops the container, memory lives in PostgreSQL — not in a Map.
8. **One source of truth.** This `docs/` folder is authoritative. Old Master/paper/phase documents are
   archived, not resurrected.

---

## 6. Capability pillars (target system)

| # | Pillar | Description | Current state |
|---|---|---|---|
| 1 | **Cognitive core** | Multi-provider LLM failover with context handoff; adjudicated by a clean typed router | Provider clients exist; clean router = Phase 0 |
| 2 | **Perception** | Groq Whisper ASR with auto language detection for Telegram/WhatsApp voice notes; image intake | Telegram voice = real; web audio = Phase 4 |
| 3 | **Memory** | PostgreSQL sessions via Prisma; pinned facts (`isImportant`); task/deadline/appointment categories; provider affinity remembered | Designed; Phase 0–1 |
| 4 | **Knowledge / RAG** | Curated corpus (GKP documents) embedded and retrieved into context | Corpus exists (`gkp/`); legacy indexer exists; requires re-wiring in Phase 5 |
| 5 | **Hands (tools)** | Web search (Tavily/SerpAPI), GitHub read/write, file operations, media generation | Client code partially exists; verification + wiring = Phase 3–4 |
| 6 | **Voice out** | ElevenLabs neural TTS replies | Client exists (`api/lib/voice/elevenlabs.ts`); wiring = Phase 4 |
| 7 | **Media studio** | Image (FLUX.1 / Imagen) and video (Kling, Seedance-PiAPI, MiniMax Hailuo, Luma) generation with honest task polling | Clients exist; endpoint verification = Phase 4 |
| 8 | **Omnichannel** | PWA (Vercel), Telegram, Discord, WhatsApp (Cloud API) | Telegram strongest; others partial |
| 9 | **AgroLingo intelligence** | KX serves as Chief Research Officer for GreenByte's AgroLingo AI (Hausa-first agronomy, pests, markets) | Knowledge-side = Phase 5; product it self |
| 10 | **Islamic & cultural fluency** | Qur'an/Tafsir/Hadith/Fiqh grounding, dignified cultural register in EN/AR/HA | System-prompt level now; corpus = Phase 5 |
| 11 | **Mentor matrix** | ADVISE · CRITICIZE · GUIDE · IMPROVE · NOTIFY behaviors | System-prompt level; proactive notifications = Phase 8 |
| 12 | **Autonomy** | Scheduled tasks, reminders, self-initiated alerts | Phase 8 |

---

## 7. Target deployment topology

| Concern | Decision | Why |
|---|---|---|
| Frontend | **Vercel** (Next.js + React + Tailwind, PWA) | Best DX for a developer who deploys themselves; edge network; free tier |
| Backend | **Railway** (Node.js + Express + TypeScript) | Long-running processes (bots, polling, cron) — serverless cannot hold Telegram long-polling; simple deploys; PostgreSQL plugin |
| Database | **PostgreSQL** via Railway (or Supabase) + **Prisma** | Lifelong memory must survive container restarts. SQLite/LibSQL only as a local dev convenience |
| Bots | Same Railway backend process family | One codebase, one memory contract |
| Not chosen | Hugging Face Spaces | Proven unreliable for this workload (stuck deployments, port/persistence constraints) — historical only |

Full instructions: [`DEPLOYMENT.md`](DEPLOYMENT.md).

---

## 8. What success looks like (acceptance criteria)

The system is considered *real* when — and only when — all of the following hold simultaneously:

1. A message sent from the **web PWA** gets a streamed, context-aware answer from the router, and both
   messages are found in PostgreSQL afterwards.
2. A **voice note in Hausa** sent to Telegram gets transcribed correctly and answered in text (and
   optionally voice) referencing yesterday's conversation.
3. Killing and redeploying the backend **loses nothing** the founder said that was marked important.
4. Asking KX to **search the web / inspect a GitHub repo** produces real, verifiable results (a URL that
   resolves, a commit that exists).
5. Asking for an **image** returns an actual image, or an honest error naming the failing provider — never a
   fake "success".
6. The founder reviews the code and finds **no simulated feature**: every "working" checkbox in
   `STATUS.md` has evidence.
7. Cost stays within free tiers under daily use (token frugality enforced by the ContextManager).

---

## 9. Non-goals (what this project is not)

- **Not a commercial SaaS (yet).** Multi-tenancy, billing, and marketing are explicitly out of scope for
  the personal-agent build. The architecture may allow it later; the mission does not require it now.
- **Not an "unchained Godmode" toy.** The earlier Godmode-era framing is retired: this is engineering, not
  bravado. Filters and refusals from hosted providers are acknowledged and routed around honestly.
- **Not a paper.** `docs/archive/PAPER.md` (85 KB) is historical; the system's truth is its code and
  `STATUS.md`.
- **Not married to one model.** No vendor worship: models are interchangeable organs in a router.

---

*This overview is versioned in git. If code and document disagree, code wins and the document gets fixed —
not the other way around.*