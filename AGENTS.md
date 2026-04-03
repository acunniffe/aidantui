# AidanTUI

Terminal-based personal CRM and sales pipeline management tool built with Bun, React (via `@opentui/react`), and SQLite.

## Cursor Cloud specific instructions

### Runtime

- **Bun** is the required runtime (not Node.js). The app uses `bun:sqlite` and Bun-specific APIs.
- Bun is installed at `~/.bun/bin/bun`. Ensure `PATH` includes `$HOME/.bun/bin`.

### Key commands

All commands are in `package.json`:

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Run dev | `bun run dev` |
| Type check | `bun run tsc --noEmit` |
| Compile pipeline | `bun run compile-pipeline` |
| Setup Google auth | `bun run setup-auth` (interactive, requires OAuth credentials) |

### Startup notes

- The app works without Google OAuth credentials — sync is gracefully skipped when no auth is configured.
- Config lives at `~/.aidantui/config.toml` (optional; defaults are used if missing).
- SQLite database is auto-created at `~/.aidantui/data.db` on first run.
- Pipeline stages must be compiled from `pipeline.md` into the DB via `bun run compile-pipeline` before the Pipeline screen will show stages. This is idempotent.
- The TUI requires a terminal/TTY to render. When testing from a headless environment, use `timeout 5 bun run dev` to verify startup without blocking.
- Audio recording features require FFmpeg and PulseAudio (Linux) — optional for core CRM functionality.
