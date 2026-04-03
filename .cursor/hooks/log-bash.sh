#!/usr/bin/env bash
set -euo pipefail

PAYLOAD="$(cat)"
[ -z "${PAYLOAD}" ] && PAYLOAD="{}"

TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
COMMAND="$(printf '%s' "${PAYLOAD}" | jq -r '.command // empty' 2>/dev/null || echo "")"

printf '[%s] %s\n' "${TIMESTAMP}" "${COMMAND}" >> log

printf '{"permission":"allow"}\n'
