# KX Sanctuary OS — Architecture

> **Status:** specification + as-built record. Part A describes what runs today (commit `6e2b527`).
> Part B is the approved target architecture ("Foundation → Plumbing → Rooms") that Phase 0/1 will commit.

---

# PART A — As-built (today)

```
                       ┌──────────────────────────────┐
   Telegram bot ──────▶│ bots/telegram.ts             │──▶ api/lib/llm_router.ts ──▶ providers/* (fetch)
   (long-polling)      │  • in-memory history Map     │──▶ api/lib/media/video.ts (kling/seedance/minimax/luma)
                       │  • Groq Whisper voice notes  │
                       └──────────────────────────────┘
                       ┌──────────────────────────────┐
   Discord bot ───────▶│ bots/discord.ts (gateway WS) │──▶ api/lib/llm_router.ts
                       └──────────────────────────────┘
                       ┌──────────────────────────────┐
   WhatsApp Cloud ────▶│ bots/whatsapp.ts             │──▶ graph.facebook.com/v19.0 (send only)
                       └──────────────────────────────┘
                       ┌──────────────────────────────┐
   HTTP ──────────────▶│ api/server.ts (Express)      │──▶ Groq ─▶ OpenRouter ─▶ static fallback string
                       │  /v1/health                  │    (only last message sent; no history/system prompt)
                       │  /v1/chat/completions        │
                       │  /v1/media/video/image 🔴stub │
                       └──────────────────────────────┘
   api/routes/* (17 files) — NOT mounted; dead code
   api/lib/{connectors,mcp,consortium,ultrapinian,tiers,gkp,…} — legacy, unwired
```

**Pain points this state creates (and the reasons for the restructure):**
1. **No shared data contract.** Every channel builds prompts ad-hoc; history means different things in
   different files.
2. **No memory.** Process restart = total amnesia.
3. **No context management.** The server sends only the last message; the bots send raw unbounded arrays
   until they blow the token limit.
4. **Simulation risk.** The media route fakes success; a router without strict error semantics can mask
   provider auth failures.

---

# PART B — Target architecture (approved)

The build order follows the house analogy agreed with the founder:

> **Foundation** (data types) → **Plumbing** (context manager, adapters) → **Rooms** (router, session repo,
> controllers) → **Furniture** (frontend, tools, media).

## B.1 Layered map

```
┌────────────────────────────── FRONT DOORS ──────────────────────────────┐
│  Next.js PWA at repository root (Vercel)          Telegram webhook/controller        WhatsApp webhook │
│  src/app/api/chat/route.ts (BFF)   api/controllers/*.controller.ts          │
└───────────────┬──────────────────────────────┬──────────────────────────┘
                ▼                              ▼
        ┌────────────────────────────────────────────┐
        │ CONTROLLERS: persist-inbound → context →   │
        │ router → persist-outbound → channel reply  │
        └───────────────┬────────────────────────────┘
                        ▼
   ┌──────────────────────────────────────────────────────────┐
   │ ContextManager.buildContext(session, systemPrompt, rag)  │  ← hybrid windowing
   └───────────────┬──────────────────────────────────────────┘
                   ▼
   ┌──────────────────────────────────────────────────────────┐
   │ LLMRouter.executeCall(ContextPackage)                    │  ← failover chain
   │   groq → openrouter → cerebras → mistral → (gemini/ollama)│
   │   400 = fatal (no failover) · timeout 15s per attempt    │
   └───────────────┬──────────────────────────────────────────┘
                   ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Adaptaters: OpenAICompatibleAdapter (groq/openrouter/    │
   │ cerebras/mistral) · GeminiAdapter · OllamaAdapter        │
   └───────────────┬──────────────────────────────────────────┘
                   ▼
   ┌──────────────────────────────────────────────────────────┐
   │ SessionRepository (Prisma)  →  PostgreSQL                │
   │ Sessions (provider affinity) · Messages (pinned, tools)  │
   └──────────────────────────────────────────────────────────┘
                        Tools (Phase 3+): search · github · files · media · voice
```

## B.2 Foundation — core data types (`api/types/core.ts`)

```ts
export type MessageRole = 'user' | 'assistant' | 'system' | 'function' | 'tool';

export interface Message {
  id?: string;
  role: MessageRole;
  content: string;
  timestamp: string;                    // ISO string
  isImportant?: boolean;                // pinned → survives windowing
  category?: 'task' | 'deadline' | 'appointment' | 'general';
  toolCalls?: any[];                    // future MCP/tool calling
  toolCallId?: string;                  // links tool response → tool call
  metadata?: Record<string, any>;
}

export interface SessionState {
  sessionId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  lastSuccessfulProvider?: ModelProvider;   // provider affinity / debugging
  metadata?: Record<string, any>;
}

export interface ContextPackage {
  sessionId: string;
  history: Message[];                   // already windowed + deduped + ordered
  systemPrompt: string;
  ragContext?: string;
  tokenEstimate: number;
}

export type ModelProvider =
  | 'groq' | 'openrouter' | 'cerebras' | 'mistral' | 'gemini' | 'ollama';
```

**Why these shapes:** every channel produces `Message[]`; every persistence layer stores `SessionState`;
every adapter consumes `ContextPackage`. One vocabulary, zero ad-hoc prompt assembly.

## B.3 Plumbing — ContextManager (`api/services/ContextManager.ts`)

Hybrid windowing, agreed strategy:

- **Primary: token budget.** `estimateTokens = ceil(len/4)` (cheap, good enough); default target
  **8,000 history tokens**, hard cap **20 messages**.
- **Pinned messages (`isImportant`) are always included** — they are the user's lifeline facts.
- Walk general history **newest → oldest**, stop at the first message that would exceed budget or count.
- **Deduplicate** by `id` (fallback: `timestamp + first 20 chars`), then sort chronologically.
- Throw a hard error if `systemPrompt + ragContext` alone exceed the budget (config error, not a trim).

Full implementation is the version agreed in chat (pinned + windowed + dedupe + chronological sort).
Properties: O(n), no tokenizer dependency, deterministic.

## B.4 Plumbing — Adapter pattern (`api/adapters/`)

```ts
// api/adapters/types.ts
export interface ProviderPayload {
  endpoint: string;
  headers: Record<string, string>;
  body: any;
}
export interface ModelAdapter {
  providerName: string;
  formatPayload(context: ContextPackage, modelOverride?: string): ProviderPayload;
  parseResponse(rawResponse: any): string;
}
```

- `OpenAICompatibleAdapter` — groq, openrouter (+ HTTP-Referer/X-Title headers), cerebras, mistral.
  Merges `ragContext` into the system message (`[CONTEXTUAL KNOWLEDGE]` block); maps tool calls.
- Later: `GeminiAdapter` (Google format), `OllamaAdapter` (local `/api/generate`).
- **Adding a provider = writing one adapter file + one registry line.** Nothing else changes.

## B.5 Rooms — LLMRouter (`api/services/LLMRouter.ts`)

Contract:

```
executeCall(context: ContextPackage) → { text: string; provider: ModelProvider }
```

- Default failover chain: `groq → openrouter → cerebras → mistral` (configurable per environment).
- Per-attempt `AbortSignal.timeout(15s)`.
- **HTTP 400 = fatal, no failover** — a 400 means *our payload is wrong*; retrying it on five providers
  just burns five quotas and hides the bug. 401/403 = provider misconfigured (log loudly, continue is
  allowed but must be visible). 429/5xx/network = failover normally.
- Every attempt logged: `[Router] attempting groq → ok|fail(reason)`.
- Returns which provider actually answered → stored as `Session.lastSuccessfulProvider`.

## B.6 Rooms — Persistence (`prisma/schema.prisma`)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"  url = env("DATABASE_URL") }

model Session {
  id                     String    @id @default(cuid())
  userId                 String?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
  lastSuccessfulProvider String?
  metadata               Json?
  messages               Message[]
  @@index([userId])
  @@index([updatedAt])
}

model Message {
  id          Int      @id @default(autoincrement())
  sessionId   String
  session     Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  role        String
  content     String   @db.Text
  timestamp   DateTime @default(now())
  isImportant Boolean  @default(false)
  category    String?
  toolCalls   Json?
  toolCallId  String?
  metadata    Json?
  @@index([sessionId])
  @@index([isImportant])
  @@index([category])
  @@index([timestamp])
}
```

Repository contract (`api/repositories/SessionRepository.ts`):

```ts
export interface ISessionRepository {
  getSession(sessionId: string): Promise<SessionState | null>;
  createSession(sessionId: string, initialMetadata?: Record<string, any>): Promise<SessionState>;
  addMessages(sessionId: string, messages: Message[]): Promise<void>;
  updateProvider(sessionId: string, provider: string): Promise<void>;
}
```

`PrismaSessionRepository implements ISessionRepository` — the interface keeps tests (and a future
Supabase/SQLite swap) honest without touching controllers.

## B.7 Rooms — Controllers and data flows

### Web message flow (Phase 1–2)

```
PWA → POST src/app/api/chat (Vercel BFF, adds KX_AI_BACKEND_URL)
    → POST {RAILWAY}/v1/chat/completions {sessionId, message}
    → controller: createSession? → addMessages(user)          (persist FIRST — never lose the ask)
    → repo.getSession → ContextManager.buildContext
    → LLMRouter.executeCall → {text, provider}
    → addMessages(assistant) + updateProvider   (transaction)
    → respond; UI renders
```

### Telegram voice-note flow (Phase 0 extraction)

```
webhook/polling: message.voice {file_id}
 → AudioService.transcribeTelegramVoiceNote(file_id):
     getFile → download .ogg buffer → Blob → FormData
     → Groq POST /openai/v1/audio/transcriptions  (whisper-large-v3, NO forced language)
 → transcript becomes the user Message (persisted like text)
 → ContextManager → Router → reply
```

(The same logic already runs inside `bots/telegram.ts`; Phase 0 extracts it into
`api/services/audio.service.ts` so the web and WhatsApp channels share it. No temp files on disk.)

## B.8 Non-negotiable code rules

1. **No simulated success.** Unfinished or unavailable capability ⇒ `501`/explicit error with reason.
2. **Persist before you think.** User messages are saved before the LLM call; assistant messages in a
   transaction with provider update.
3. **The router never silently swallows provider errors** — it logs, classifies, and either fails over
   (429/5xx/network) or fails hard (400 = our bug).
4. **One identity prompt** lives in one file (`api/agent/prompts.ts` target) — never duplicated per channel.
5. **Cleanup is part of the feature.** Every phase archives or deletes superseded code; no two systems
   answering "what is the router?" at once.

## B.9 Deployment topology

```
┌─────────────┐   HTTPS    ┌──────────────────────┐   TCP/SSL   ┌──────────────┐
│   Vercel    │───────────▶│      Railway          │────────────▶│  PostgreSQL   │
│ Next.js PWA │  /api/chat │  Node/Express/Prisma  │   Prisma    │  (Railway)   │
│  (frontend) │◀───────────│  + bots + controllers │◀────────────│  sessions/   │
└─────────────┘  stream    └──────┬───────────────┘             │  messages    │
                                  │ https                        └──────────────┘
                     LLM/voice/media providers (Groq, OpenRouter,
                     Cerebras, Mistral, Gemini, ElevenLabs,
                     Kling/PiAPI/MiniMax/Luma, Tavily/SerpAPI…)
```

Environment contract, secrets policy, and step-by-step deployment: [`DEPLOYMENT.md`](DEPLOYMENT.md).