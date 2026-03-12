#!/usr/bin/env bash
set -euo pipefail

log_file="/workspace/hook_log"

{
  echo "---"
  date -Iseconds
  echo "pwd=${PWD}"
  echo "args=$*"
  echo "cursor_hook_event=${CURSOR_HOOK_EVENT:-}"
} >> "${log_file}"

# Persist any hook stdin payload so we can prove invocation.
cat >> "${log_file}" || true
echo >> "${log_file}"
