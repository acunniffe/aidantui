## Cursor hooks for background agents

This repository uses project-level Cursor hooks via `.cursor/hooks.json`.

All configured hook events call `.cursor/hooks/dispatch.sh` so hooks work in
non-interactive/background agent runs and produce a local audit trail.

### Files

- `.cursor/hooks.json` - hook event configuration
- `.cursor/hooks/dispatch.sh` - shared hook command handler
- `.cursor/hooks/state/events.log` - runtime event log (gitignored)

### Behavior

- Reads JSON payload from `stdin`
- Appends one line per event to `.cursor/hooks/state/events.log`
- Returns valid JSON output for Cursor:
  - Gate events return `{"permission":"allow"}`
  - Non-gate events return `{}`

### Quick local verification

Run from repository root:

```bash
echo '{"tool_name":"Shell","tool_input":{"command":"echo hi"}}' | .cursor/hooks/dispatch.sh preToolUse
echo '{"command":"bun run dev"}' | .cursor/hooks/dispatch.sh beforeShellExecution
echo '{"status":"completed"}' | .cursor/hooks/dispatch.sh stop
```

Expected:

- First two commands print `{"permission":"allow"}`
- Last command prints `{}`
- `.cursor/hooks/state/events.log` contains all events
