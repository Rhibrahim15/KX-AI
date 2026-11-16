# KX Sanctuary OS — Unified Experience Contract

**Status:** Proposed implementation contract  
**Base:** `hardening/login-and-deps`  
**Purpose:** Define one coherent product/runtime model for conversational chat, attachments, generated artifacts, voice and agent execution.

This document describes the target behavior. It does not claim that any capability below is already implemented.

## 1. Product principle

KX is one assistant with multiple interaction modes, not several separate products.

A user must be able to begin with an ordinary question, attach relevant material, switch to voice, and delegate a multi-step task without losing the conversation, files, identity or context.

The same thread and identity must be available across supported clients. A client is a presentation and control surface; it must not own the canonical conversation history or agent state.

## 2. Interaction modes

### 2.1 Chat

The default everyday experience:
- Text conversation with the shared KX identity and model router.
- Follow-up questions and ordinary discussion without creating an agent task.
- Attach images, PDFs, documents, spreadsheets, presentations, audio and code files.
- Ask KX to inspect, explain, summarize or transform supplied files.
- Generate files and return them as explicit downloadable artifacts.
- Search prior conversations and continue an existing thread.

### 2.2 Agent

A user may promote a conversation into an agent task or start a task with the current thread as context.

Agent work follows:

`Direct → Plan → Execute → Supervise → Verify`

Requirements:
- Every task has a durable task ID and every execution has a run ID.
- A run exposes operational events, tool inputs/outputs, changed files, sources, test results and approval requests.
- The user can provide additional instructions in the same task thread.
- Pause, resume, cancel and retry are explicit state transitions.
- A retry creates a new run linked to the task; it must not silently duplicate a side effect.
- Approval is bound server-side to the exact pending action, target and scope. Frontend state is never authorization.
- The system does not expose private chain-of-thought. It exposes plans, decisions at an appropriate summary level, evidence and execution traces.

### 2.3 Voice

Voice is another way to interact with the same conversation, not a separate chat history.

Two supported experiences:
- **Live conversation:** streaming, natural turn-taking, interruption/barge-in and audio playback cancellation when interrupted.
- **Push-to-talk:** press/hold to capture, release to submit.

Voice requirements:
- Transcript messages are attached to the same conversation thread.
- Audio session state is distinct from durable conversation messages.
- English, Hausa and Arabic are first-class language options.
- Listening animation is driven by microphone amplitude; speaking animation is driven by generated audio amplitude.
- Idle, listening, thinking, speaking, muted, interrupted and disconnected states have distinct accessible visual and text representations.
- Text and voice can be switched without losing context.
- Voice provider selection is behind a provider-independent interface.

## 3. Canonical domain model

The backend is authoritative for the following records:

### Conversation
- `id`
- `ownerId`
- `title`
- `createdAt`, `updatedAt`
- `metadata` (non-authoritative presentation preferences only)

### Message
- `id`, `conversationId`
- `role`: system/internal, user, assistant or tool
- `content` and structured content parts
- `createdAt`
- `status`: pending, streaming, complete, failed or cancelled
- `provider` / `model` metadata where applicable
- `replyToMessageId` where needed
- Tool execution references; never treat tool output as trusted instructions

### Attachment
- `id`, `conversationId`, `messageId`
- `ownerId`
- `storageKey` (never a public storage credential)
- `originalName`, `mediaType`, `byteSize`, `checksum`
- `scanStatus`, `processingStatus`
- extracted text/metadata references and retention metadata

### Artifact
- `id`, `conversationId`, `taskId?`
- `createdByMessageId`
- `name`, `mediaType`, `byteSize`, `storageKey`, `checksum`
- `status`: generating, ready or failed
- provenance: generator/action and source references

### AgentTask and AgentRun
- Task describes the user's durable objective and success criteria.
- Run records one attempt to fulfil that task.
- Run state: queued, planning, running, waiting_for_approval, paused, blocked, verifying, completed, failed or cancelled.
- Events are append-only operational records with timestamps and correlation IDs.
- Tool calls record exact action, target, scope, arguments (redacted where sensitive), result and approval reference.

### VoiceSession
- Ephemeral connection/session state associated with a conversation.
- Provider session identifiers and audio transport state are server-side only.
- Durable transcript messages are written to the conversation; raw audio retention is separately configured.

## 4. Context continuity rules

1. Conversation history is canonical in the backend database; browser storage may cache but is not the source of truth.
2. Messages, attachment references, artifact references and agent task/run references are linked to the same conversation.
3. Context assembly is server-side and uses the existing ContextManager budget and ordering rules.
4. A task receives a stable context snapshot/reference at creation and records any later context additions.
5. Attachments are permission-checked before retrieval or processing; extracted content is untrusted input.
6. Switching between Chat, Agent and Voice must not create a new conversation unless the user explicitly asks.
7. Cross-device continuity depends on authenticated identity and server persistence, not localStorage synchronization.

## 5. Service boundaries

The target runtime is composed of explicit services:

- **ConversationService:** create/list/read/update/archive conversations and persist messages.
- **ContextService:** assemble bounded context from messages, attachments and approved memory.
- **AttachmentService:** upload authorization, validation, quarantine, scanning, extraction and retention.
- **ArtifactService:** create, store, preview and download generated files.
- **AgentRuntime:** plan and execute tasks, persist run events, pause/resume/cancel and verify outcomes.
- **ApprovalService:** issue, validate, expire and consume approvals bound to exact pending actions.
- **VoiceGateway:** manage streaming audio sessions, VAD/turn-taking, transcription, TTS and interruption.
- **ModelGateway:** provider-independent text, transcription and speech adapters.
- **PolicyEngine:** evaluate profile, authorization, target, scope, impact and required approval before tools execute.

The web app, desktop app, mobile app and messaging adapters call the same authenticated application API. They must not duplicate business logic.

## 6. File handling and safety

- Enforce upload size, count and allowed-type limits at the server.
- Do not trust filename extensions or client-supplied MIME types.
- Store files privately; use short-lived, scoped download URLs or authenticated streaming.
- Quarantine and scan files before processing.
- Parse supported formats in isolated workers with resource/time limits.
- Treat file contents, OCR, metadata and embedded instructions as untrusted data.
- Do not execute uploaded code or macros by default.
- Generated artifacts must be persisted, checksummed and linked to the conversation/task that created them.
- Failed generation must be represented as failure, never as a success-shaped placeholder.

## 7. Permissions and autonomy

Access is not permission.

Autonomy levels:
1. **Assist:** KX explains, drafts and recommends; no external side effects.
2. **Execute with approval:** KX prepares an action and waits for explicit approval.
3. **Bounded autonomy:** KX may execute a pre-authorized, limited class of actions within user-defined scope, budget and expiry.

Every tool action must have a declared permission category, timeout, resource budget and audit event. Destructive, externally visible, financial, identity/security-sensitive or irreversible actions require explicit approval unless a narrow user policy explicitly permits them.

## 8. API shape (proposed)

The exact route names may evolve, but the resource boundaries should remain stable:

- `POST /v1/conversations`
- `GET /v1/conversations`
- `GET /v1/conversations/:id`
- `POST /v1/conversations/:id/messages`
- `POST /v1/conversations/:id/attachments`
- `GET /v1/attachments/:id`
- `POST /v1/conversations/:id/tasks`
- `GET /v1/tasks/:id`
- `GET /v1/runs/:id/events`
- `POST /v1/runs/:id/approvals/:approvalId/decision`
- `POST /v1/runs/:id/pause`, `resume`, `cancel`
- `POST /v1/conversations/:id/voice-sessions` (session negotiation; audio transport may use WebSocket/WebRTC)

Every route must enforce owner-scoped authorization. Client-provided owner IDs, task states, approval states and tool permissions are never authoritative.

## 9. Delivery sequence

### Milestone 1 — Canonical persistence
- Introduce authenticated owner identity appropriate for the private single-owner deployment.
- Install Prisma and PostgreSQL migrations.
- Persist conversations and messages.
- Add list/read/create endpoints and migrate the web client away from localStorage as the canonical store.
- Preserve local export/import as a user-controlled backup, not the primary persistence mechanism.

**Acceptance:** a conversation created in one browser can be retrieved in another authenticated browser and survives API/database restarts.

### Milestone 2 — Attachments and artifacts
- Private object storage abstraction.
- Upload validation, quarantine and processing status.
- Attachment references in messages and context assembly.
- Artifact creation, status, preview and download.

**Acceptance:** upload a supported document, ask KX about its contents, generate a file, restart services and still retrieve both source and output with correct ownership checks.

### Milestone 3 — Agent runtime
- Durable tasks, runs and append-only events.
- Typed tool registry and policy checks.
- Exact-action approval service.
- Pause/resume/cancel and verification.

**Acceptance:** an approved test tool action runs once, produces auditable evidence and cannot be replayed by reusing an approval.

### Milestone 4 — Voice
- Voice gateway and provider adapter.
- Live and push-to-talk sessions.
- Transcripts linked to conversations.
- Interruption and state-driven audio visualization.

**Acceptance:** a user can alternate text and voice in one thread; interrupted playback stops; transcripts remain after reconnect.

### Milestone 5 — Additional clients and proactive workflows
- Desktop/mobile clients and messaging adapters.
- Shared authentication, context and notification/approval routing.
- Scheduled work only after permissions, budgets and observability exist.

## 10. First implementation constraints

- Keep `main` untouched.
- Work on a dedicated feature branch based on the current hardening branch.
- Do not merge the hardening branch until its CI and live login-throttle checks are complete.
- Do not claim PostgreSQL persistence, attachments, voice or agent execution until end-to-end acceptance tests pass.
- Keep the current API stateless until persistence is implemented deliberately; avoid partial dual-write behavior.
- Add schema migrations and tests with each domain change.
