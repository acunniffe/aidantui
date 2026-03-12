#!/usr/bin/env bash
#
# Diagnostic script to verify git-ai hooks are firing in Cursor (Desktop + Cloud Agent).
#
# Usage: bash scripts/test-git-ai-hooks.sh
#
# Checks:
#   1. git-ai binary is installed and on PATH
#   2. hooks.json exists in all expected locations
#   3. git-ai checkpoint works (via mock_ai preset)
#   4. .git/ai/working_logs is being populated
#   5. Timing: hooks.json must predate daemon startup
#
# In Cloud Agent containers, the exec-daemon loads hooks once at boot via
# StaticHooksConfigLease. If hooks.json is created after the daemon starts,
# hooks won't fire until the next session.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

pass() { echo -e "${GREEN}✓ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
info() { echo -e "${CYAN}  $1${NC}"; }

ERRORS=0

echo "=== git-ai hooks diagnostic ==="
echo ""

# 1. Check git-ai binary
echo "1. git-ai binary"
if command -v git-ai >/dev/null 2>&1; then
    VERSION=$(git-ai --version 2>&1)
    pass "git-ai ${VERSION} at $(which git-ai)"
else
    fail "git-ai not found on PATH"
    info "Run: curl -sSL https://usegitai.com/install.sh | bash"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check hooks.json in all locations
echo ""
echo "2. hooks.json locations"

# 2a. Repo-level (canonical source, works on Cursor Desktop)
REPO_HOOKS=".cursor/hooks.json"
if [ -f "$REPO_HOOKS" ]; then
    if grep -q "afterFileEdit" "$REPO_HOOKS"; then
        pass "Repo:    ${REPO_HOOKS} (canonical source)"
    else
        warn "Repo:    ${REPO_HOOKS} exists but missing afterFileEdit"
    fi
else
    fail "Repo:    ${REPO_HOOKS} not found — commit .cursor/hooks.json to the repo"
    ERRORS=$((ERRORS + 1))
fi

# 2b. User-level (~/.cursor/hooks.json)
USER_HOOKS="$HOME/.cursor/hooks.json"
if [ -f "$USER_HOOKS" ]; then
    if grep -q "afterFileEdit" "$USER_HOOKS"; then
        pass "User:    ${USER_HOOKS}"
    else
        warn "User:    ${USER_HOOKS} exists but missing afterFileEdit"
    fi
else
    warn "User:    ${USER_HOOKS} not found"
    info "The update script should copy from .cursor/hooks.json"
fi

# 2c. Cloud Agent project-level (~/.cursor/projects/<slug>/.cursor/hooks.json)
SLUG=$(echo "/workspace" | sed 's/[^a-zA-Z0-9]/-/g; s/-\+/-/g; s/^-\+\|-\+$//g')
PROJECT_HOOKS="$HOME/.cursor/projects/$SLUG/.cursor/hooks.json"
if [ -f "$PROJECT_HOOKS" ]; then
    if grep -q "afterFileEdit" "$PROJECT_HOOKS"; then
        pass "Project: ${PROJECT_HOOKS}"
    else
        warn "Project: ${PROJECT_HOOKS} exists but missing afterFileEdit"
    fi
else
    warn "Project: ${PROJECT_HOOKS} not found"
    info "The update script should copy from .cursor/hooks.json"
fi

# 3. Check git-ai checkpoint works (mock_ai)
echo ""
echo "3. git-ai checkpoint (mock_ai)"
if command -v git-ai >/dev/null 2>&1; then
    PROBE_FILE=".git-ai-hook-test-probe"
    echo "hook test $(date +%s)" > "$PROBE_FILE"
    CHECKPOINT_OUTPUT=$(git-ai checkpoint mock_ai "$PROBE_FILE" 2>&1)
    rm -f "$PROBE_FILE"
    if echo "$CHECKPOINT_OUTPUT" | grep -q "Checkpoint completed"; then
        pass "mock_ai checkpoint works"
        info "$CHECKPOINT_OUTPUT"
    else
        fail "mock_ai checkpoint failed"
        info "$CHECKPOINT_OUTPUT"
        ERRORS=$((ERRORS + 1))
    fi
else
    fail "Skipped (git-ai not installed)"
    ERRORS=$((ERRORS + 1))
fi

# 4. Check working_logs for activity from real hooks (not mock_ai)
echo ""
echo "4. working_logs activity (from exec-daemon hooks)"
WORKING_LOGS_DIR=".git/ai/working_logs"
if [ -d "$WORKING_LOGS_DIR" ]; then
    # Look for checkpoints that are NOT from mock_ai
    FILE_COUNT=$(find "$WORKING_LOGS_DIR" -name "checkpoints.jsonl" 2>/dev/null | wc -l)
    if [ "$FILE_COUNT" -gt 0 ]; then
        if grep -rq '"cursor"' "$WORKING_LOGS_DIR" 2>/dev/null; then
            pass "Found cursor agent checkpoints in working_logs"
        else
            warn "working_logs has checkpoints but none from cursor agent"
            info "Checkpoints may be from mock_ai test runs only."
            info "Make a file edit through Cursor and check again."
        fi
    else
        warn "No checkpoint files found in working_logs"
        info "Hooks may not be firing. Check timing analysis below."
    fi
else
    warn "working_logs directory not found"
fi

# 5. Timing check
echo ""
echo "5. Timing analysis"
DAEMON_PID=$(pgrep -f "exec-daemon/node" | head -1 2>/dev/null || true)
if [ -n "$DAEMON_PID" ] && [ -f "$USER_HOOKS" ]; then
    DAEMON_START=$(stat -c %Y "/proc/$DAEMON_PID" 2>/dev/null || echo "0")
    HOOKS_MTIME=$(stat -c %Y "$USER_HOOKS" 2>/dev/null || echo "0")
    if [ "$DAEMON_START" != "0" ] && [ "$HOOKS_MTIME" != "0" ]; then
        DAEMON_TIME=$(date -d @"$DAEMON_START" +%H:%M:%S 2>/dev/null || echo "unknown")
        HOOKS_TIME=$(date -d @"$HOOKS_MTIME" +%H:%M:%S 2>/dev/null || echo "unknown")
        if [ "$HOOKS_MTIME" -le "$DAEMON_START" ]; then
            pass "hooks.json ($HOOKS_TIME) predates daemon start ($DAEMON_TIME)"
            info "Hooks should be loaded and firing."
        else
            warn "hooks.json ($HOOKS_TIME) was created AFTER daemon start ($DAEMON_TIME)"
            info "The daemon loaded empty hooks config at boot."
            info "Hooks will work in the next session (from VM snapshot)."
        fi
    fi
elif [ -z "$DAEMON_PID" ]; then
    info "No exec-daemon process found (not running in Cloud Agent?)"
fi

# Summary
echo ""
echo "=== Summary ==="
if [ "$ERRORS" -eq 0 ]; then
    pass "All checks passed"
else
    fail "${ERRORS} check(s) failed"
fi
echo ""
