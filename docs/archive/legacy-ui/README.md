# Archived root-level UI duplicates

The original repository contained duplicate `ChatInput.tsx` and `SettingsModal.tsx` files at the repository root.

The active Next.js application is under `src/` and imports:
- `src/components/ChatInput.tsx`
- `src/components/SettingsModal.tsx`

The root-level copies were not part of the active page/component import path, but the broad TypeScript include pattern still compiled them. They have been moved here as `.legacy` source snapshots so they remain available for reference without being part of the TypeScript build.

Do not restore these files to the root. Update the active `src/components/` implementation instead.
