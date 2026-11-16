# Archive — historical documents (not authoritative)

These files are kept for project history only. **They do not describe the current system.**
They were produced during earlier iterations (Hugging Face era, "Godmode" era, research-paper era) and
contain claims, plans, and states that have since been superseded by the real architecture.

The authoritative documents live in [`../`](../) — start with:

1. [`../PROJECT_OVERVIEW.md`](../PROJECT_OVERVIEW.md) — description, mission, vision, everything
2. [`../STATUS.md`](../STATUS.md) — verified, honest, file-level status
3. [`../ARCHITECTURE.md`](../ARCHITECTURE.md) — as-built vs. target design
4. [`../ROADMAP.md`](../ROADMAP.md) — phased plan with acceptance criteria
5. [`../DEPLOYMENT.md`](../DEPLOYMENT.md) — Vercel + Railway + PostgreSQL guide

**Rule:** if an archived document contradicts `STATUS.md` or the code, the archive is wrong.

| File | Era | Why archived |
|---|---|---|
| `MASTER_*.md` (8 files) | Godmode/HF era | Contained aspirational claims (MCP hub, 7-provider super stack as if live, HF publishing) that never matched the running code |
| `PAPER.md` (85 KB) | Research era | Paper-style narrative; not engineering truth |
| `API.md` | Old API surface | Described routes that were never mounted on the live server |
| `EXECUTION_LOG.md`, `README_EXECUTION.md` | HF deployment logs | Deployment diaries from the retired HF Space |
| `PHASE_A_STATUS.md`, `PHASE_A_STEP1_REPORT.md` | Old phase tracking | Superseded by `../ROADMAP.md` |
| `QUICKSTART.md` | Old setup | Superseded by root `README.md` + `../DEPLOYMENT.md` |
| `VSCODE_EXTENSION_PLAN.md` | Future exploration | Deferred; kept for later reference |