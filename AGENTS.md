# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
AidanTUI is a personal CRM terminal user interface (TUI) built with **Bun**, **React 19**, and **@opentui/react**. It uses an embedded **SQLite** database (`~/.aidantui/data.db`) and has no external service dependencies for core operation. Google Calendar/Gmail and Slack integrations degrade gracefully when credentials are absent.

### Running the app
- **Dev:** `bun run dev` — requires a TTY (use `script -qc "bun run dev" /dev/null` if no TTY is available)
- **Type check:** `npx tsc --noEmit`
- **Compile pipeline stages:** `bun run compile-pipeline` — parses `pipeline.md` and upserts stages into SQLite. Must be re-run after editing `pipeline.md`.

### git-ai
This project uses [git-ai](https://github.com/acunniffe/git-ai) to track AI-generated code attribution. The update script installs it automatically. After installation, `git` is wrapped by `git-ai` via `~/.git-ai/bin/git` on PATH. Use `git-ai stats` to see AI authorship breakdown and `git-ai blame <file>` for per-line attribution.

### Key caveats
- Bun must be on `$PATH`. The update script ensures `~/.bun/bin` is exported, but new shell sessions may need `export PATH="$HOME/.bun/bin:$PATH"`.
- git-ai must be on `$PATH`. The update script ensures `~/.git-ai/bin` is exported. The git-ai installer also writes this to `~/.bashrc`.
- The app creates `~/.aidantui/` on first run for its config and database. No config file is required — defaults are used when `~/.aidantui/config.toml` is missing.
- There are no automated tests in this repository. Validation is done via type checking (`tsc --noEmit`) and manual TUI interaction.
- The TUI renders via `@opentui/core` which writes ANSI escape sequences. Running in a non-TTY will fail. Use `script` to wrap if needed.
- Google OAuth setup (`bun run setup-auth`) is interactive and requires browser access — not needed for local dev without calendar/email sync.
