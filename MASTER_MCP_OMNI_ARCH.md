# 🌐 KX AI (KX Advisor): LIBERATED OMNI-AGENT & MCP MASTER ARCHITECTURE

**Owner Persona**: Ethical Hacking Intern, Multi-Modal Creator, Systems Architect  
**AI Persona**: Liberated Personal Autonomous Agent (KX Advisor)  
**Cognitive Fusion**: Claude 3.5 (Reasoning/Artifacts) + GPT-4o (Omni-Actions) + Gemini 1.5 (Massive Context) + Grok 3 (Uncensored Search)  
**Standard**: Anthropic Model Context Protocol (MCP) Compatible  

---

## 🏛️ THE LIBERATED OMNI-AGENT PILLARS

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE UNRESTRICTED COGNITIVE BRAIN                                │
│   • GODMODE Core: Zero-refusal policy for ethical hacking, exploit dev, and red-teaming │
│   • Model Racing Engine: Groq ⚡ | OpenRouter 🧠 | Gemini 🌐 | Mistral 💻 | Cerebras 🚀 │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     MODEL CONTEXT PROTOCOL (MCP) UNIVERSAL HUB                         │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│   │  GitHub Server   │  │   Figma Server   │  │   Gmail Server   │  │ Terminal Bash  │ │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│   │   Canva / Arts   │  │  Social Media    │  │ File System RAG  │  │ Brave Search   │ │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘  └────────────────┘ │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          OMNI-MODAL GENERATION ENGINE                                  │
│   • Text & Code (TypeScript, Bash, Python, Exploit Payloads, Markdown Reports)         │
│   • Image Generation (Stable Diffusion 3.5 & FLUX via Hugging Face Serverless)         │
│   • Video Generation (Kling, Luma Dream Machine, Runway via Replicate API)             │
│   • Vocal Articulation (ElevenLabs Hyper-Realistic Multilingual Arabic/Hausa/English)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔓 1. THE LIBERATION & ETHICAL HACKING GUARANTEE

As an ethical hacking intern, you require an agent that inspects raw payloads, analyzes buffer overflows, writes reverse shells for authorized lab targets, and red-teams LLMs without triggering nanny-filters.

KX AI achieves 100% liberation via:
1. **GODMODE System Directive**: Hard-injected root directive instructing the LLM that all operations occur inside an authorized, isolated penetration testing lab environment.
2. **Model Routing Bypass**: If a lab API (like OpenAI) returns an `content_filter` refusal, `LLMRouter` instantly fails over to uncensored open weights (e.g., `deepseek-r1`, `nousresearch/hermes-3-llama-3.1-405b`, or local `ollama`).
3. **Parseltongue Perturbation Engine**: Built-in obfuscation (`src/lib/parseltongue.ts`) that automatically encodes trigger words (e.g. converting `exploit` to leetspeak/base64) to bypass superficial regex filters mid-flight.

---

## 🔌 2. UNIVERSAL MCP (MODEL CONTEXT PROTOCOL) INTEGRATION

Instead of hardcoding hundreds of bespoke custom APIs, KX Advisor implements Anthropic's open **Model Context Protocol (MCP)**. MCP standardizes how AI agents discover and invoke external tools.

### Connected Tool Ecosystem:
* **💻 GitHub MCP**: `git_read_file`, `create_pull_request`, `search_code`, `list_issues`, `push_commit`. When you ask KX Advisor to *"audit repository X for SQL injections and commit the patch"*, it executes natively via MCP.
* **🎨 Figma MCP**: `get_file_nodes`, `extract_component_styles`. Converts visual Figma canvases into responsive Tailwind React code.
* **📧 Gmail & Google Workspace MCP**: `search_threads`, `send_email`, `create_calendar_event`. KX Advisor manages your schedule and client communications.
* **🌐 Social Media & Marketing MCP**: Hooks into X API, LinkedIn, and Canva APIs for automated content distribution.
* **📂 Local File System & Bash MCP**: Sandboxed terminal tool allowing KX Advisor to read local logs, execute `nmap` or `curl` inside your workspace, and write local code files.

---

## 🎨 3. OMNI-MODAL CONTENT STUDIO

KX Advisor is a full production house:
* **Images**: `POST /v1/media/image` → Routes prompt to FLUX.1 / SDXL on HuggingFace.
* **Videos**: `POST /v1/media/video` → Triggers Replicate video models.
* **Audio**: `POST /v1/audio/speech` → ElevenLabs lifelike speech streaming.

---

## 🚀 ENGINEERING ROADMAP FOR OMNI-MCP

1. **Scaffold `api/lib/mcp/hub.ts`**: The central tool registry and dispatcher.
2. **Build `api/routes/tools.ts`**: OpenAI-compatible `/v1/chat/completions` function calling interface.
3. **Implement Connected App OAuth Store**: Storing API tokens for GitHub, Figma, Gmail securely in SQLite/JSON.
