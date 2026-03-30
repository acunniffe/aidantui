#!/usr/bin/env bash
set -euo pipefail

EVENT_NAME="${1:-unknown}"
STATE_DIR=".cursor/hooks/state"
LOG_FILE="${STATE_DIR}/events.log"

mkdir -p "${STATE_DIR}"

# Read hook payload from stdin (Cursor sends JSON for all hook events).
if ! PAYLOAD="$(cat)"; then
  PAYLOAD="{}"
fi

if [ -z "${PAYLOAD}" ]; then
  PAYLOAD="{}"
fi

TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

printf '%s\t%s\t%s\n' "${TIMESTAMP}" "${EVENT_NAME}" "${PAYLOAD}" >> "${LOG_FILE}"

case "${EVENT_NAME}" in
  preToolUse|subagentStart|beforeShellExecution|beforeMCPExecution|beforeReadFile|beforeSubmitPrompt|beforeTabFileRead)
    # Gateable events must return permission when handled by command hooks.
    printf '{"permission":"allow"}\n'
    ;;
  *)
    # Non-gate events may return an empty object.
    printf '{}\n'
    ;;
esac
