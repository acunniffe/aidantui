# AidanTUI

A terminal-first personal CRM and activity tracker built with Bun, React, and OpenTUI.

## Languages

- English (this file)
- [中文（简体）](./README.zh-CN.md)
- [हिन्दी](./README.hi.md)
- [Español](./README.es.md)
- [العربية](./README.ar.md)
- [Francais](./README.fr.md)

Documentation note: community translation improvements are welcome.

## What it does

- Tracks sales pipeline stages.
- Syncs communication context from Gmail and Slack.
- Supports local recording settings and local data storage.
- Runs as a terminal UI app.

## Requirements

- Bun 1.3+
- Google OAuth credentials (for Gmail sync)
- Optional Slack bot token (for Slack sync)

## Quick start

1. Install dependencies:
   - `bun install`
2. Create local config:
   - `mkdir -p ~/.aidantui`
   - `cp config.example.toml ~/.aidantui/config.toml`
3. Set up Google OAuth refresh token:
   - `bun run setup-auth`
4. (Optional) Compile the pipeline markdown into triggers:
   - `bun run compile-pipeline`
5. Start the app:
   - `bun run dev`

## Scripts

- `bun run dev` — start the TUI app
- `bun run setup-auth` — generate OAuth refresh token
- `bun run compile-pipeline` — compile pipeline rules

## Configuration

Use `config.example.toml` as a template. Main sections:

- `[google]` OAuth credentials
- `[gmail]` query and domains filter
- `[slack]` bot token and channels
- `[recording]` audio preferences
- `[general]` data directory and sync behavior
