#!/usr/bin/env bash
# Ralph Starter — timeboxed launcher for headless backends
# Usage:
#   bash .ralph/run.sh omx "<task text>"
#   bash .ralph/run.sh omo "<task text>"
#   bash .ralph/run.sh ouroboros <seed.yaml>
#
# Reads `max_wall_seconds` from .ralph/config (seconds or 15m / 1h / 1h30m / 30s).
# Wraps the backend's native CLI handoff with gtimeout / timeout / perl-alarm
# (first one available).
# Exit codes on timeout:
#   - gtimeout / timeout (GNU coreutils): 124
#   - perl alarm fallback: 142 (128 + SIGALRM 14)
# Install `coreutils` (`brew install coreutils`) for GNU-style exit codes.
#
# In-session handoffs (OMC /ralph, OmO /ralph-loop inside TUI) cannot be
# wrapped from a parent shell — `omc` is rejected with a clear message.

set -euo pipefail

CONFIG_FILE=".ralph/config"
MAX_WALL=0

parse_duration() {
  # Echoes seconds integer, or empty on parse error.
  local raw="$1"
  raw="${raw// /}"
  if [[ -z "$raw" || "$raw" == "0" ]]; then
    echo 0; return 0
  fi
  local total=0 rest="$raw" n=""
  # Handle pure integer
  if [[ "$rest" =~ ^[0-9]+$ ]]; then
    echo "$rest"; return 0
  fi
  # Parse (<int>h)?(<int>m)?(<int>s)? greedily
  while [[ -n "$rest" ]]; do
    if [[ "$rest" =~ ^([0-9]+)h(.*)$ ]]; then
      total=$(( total + ${BASH_REMATCH[1]} * 3600 ))
      rest="${BASH_REMATCH[2]}"
    elif [[ "$rest" =~ ^([0-9]+)m(.*)$ ]]; then
      total=$(( total + ${BASH_REMATCH[1]} * 60 ))
      rest="${BASH_REMATCH[2]}"
    elif [[ "$rest" =~ ^([0-9]+)s(.*)$ ]]; then
      total=$(( total + ${BASH_REMATCH[1]} ))
      rest="${BASH_REMATCH[2]}"
    else
      return 1
    fi
  done
  echo "$total"
}

if [[ -f "$CONFIG_FILE" ]]; then
  raw_val="$(grep -E '^[[:space:]]*max_wall_seconds=' "$CONFIG_FILE" \
             | head -n1 | sed -E 's/^[[:space:]]*max_wall_seconds=[[:space:]]*//' \
             | tr -d '\r' || true)"
  if [[ -n "${raw_val:-}" ]]; then
    if parsed="$(parse_duration "$raw_val")"; then
      MAX_WALL="$parsed"
    else
      echo "✗ Invalid max_wall_seconds in $CONFIG_FILE: '$raw_val'" >&2
      echo "  Use seconds (900) or suffixes: 30s, 15m, 1h, 1h30m, 0 to disable." >&2
      exit 2
    fi
  fi
fi

BACKEND="${1:-}"
if [[ -z "$BACKEND" ]]; then
  echo "Usage: $0 <omx|omo|ouroboros> [args...]" >&2
  echo "Note:  omc is in-session only and cannot be timeboxed by a parent shell." >&2
  exit 1
fi
shift

# Build the target CMD array per backend.
CMD=()
case "$BACKEND" in
  omx)
    # omx ralph accepts free-text task; users who want PRD mode should run
    # `omx ralph --prd` directly (that path has its own prd.json gate).
    if [[ $# -eq 0 ]]; then
      echo "Usage: $0 omx \"<task text>\"" >&2
      exit 1
    fi
    CMD=(omx ralph "$@")
    ;;
  omo)
    if [[ $# -eq 0 ]]; then
      echo "Usage: $0 omo \"<task text>\"" >&2
      exit 1
    fi
    # Prefer `opencode run --command ralph-loop <msg>` when opencode >= 1.4.0
    # (that's the stable headless slash-command invoker). Otherwise fall back to
    # `oh-my-opencode run` which was working earlier but requires the plugin
    # already registered via `oh-my-opencode install`.
    use_opencode=0
    if command -v opencode >/dev/null 2>&1; then
      oc_ver="$(opencode --version 2>/dev/null | awk 'NR==1{print $NF}')"
      if [[ -n "$oc_ver" ]] \
         && [[ "$(printf '1.4.0\n%s\n' "$oc_ver" | sort -V | head -n1)" == "1.4.0" ]]; then
        use_opencode=1
      fi
    fi
    if (( use_opencode )); then
      # Join remaining args into a single message string.
      msg="$*"
      CMD=(opencode run --command ralph-loop "$msg")
    elif command -v oh-my-opencode >/dev/null 2>&1; then
      msg="$*"
      CMD=(oh-my-opencode run "$msg")
    else
      echo "✗ Neither 'opencode >= 1.4.0' nor 'oh-my-opencode' is on PATH." >&2
      echo "  Run: bash .ralph/bootstrap.sh omo" >&2
      exit 4
    fi
    ;;
  ouroboros)
    if [[ $# -eq 0 ]]; then
      echo "Usage: $0 ouroboros <seed.yaml>" >&2
      exit 1
    fi
    CMD=(ouroboros run workflow "$@")
    ;;
  omc)
    cat >&2 <<'EOF'
✗ OMC Ralph is an in-session Claude Code skill and cannot be wrapped by .ralph/run.sh.
  Inside Claude Code: /ralph "<task>"
  For timeboxed automation, pick OMX, OmO (headless), or Ouroboros.
EOF
    exit 3
    ;;
  *)
    echo "Unknown backend: $BACKEND (expected: omx | omo | ouroboros)" >&2
    echo "(omc is in-session only and not handled here.)" >&2
    exit 1
    ;;
esac

# Pick a timeout wrapper. Order: gtimeout (coreutils on macOS), timeout (GNU),
# perl alarm (universal fallback — SIGALRM only, no SIGKILL grace).
WRAPPER=()
if (( MAX_WALL > 0 )); then
  if command -v gtimeout >/dev/null 2>&1; then
    WRAPPER=(gtimeout --preserve-status "$MAX_WALL")
  elif command -v timeout >/dev/null 2>&1; then
    WRAPPER=(timeout --preserve-status "$MAX_WALL")
  elif command -v perl >/dev/null 2>&1; then
    WRAPPER=(perl -e 'alarm shift; exec @ARGV' "$MAX_WALL")
  else
    echo "⚠ No timeout mechanism available (install coreutils or perl)." >&2
    echo "  Running without timebox." >&2
  fi
fi

echo "→ backend: $BACKEND"
echo "→ command: ${CMD[*]}"
if (( ${#WRAPPER[@]} > 0 )); then
  echo "→ timebox: ${MAX_WALL}s (exit 124 on expiry)"
else
  echo "→ timebox: disabled"
fi

exec "${WRAPPER[@]}" "${CMD[@]}"
