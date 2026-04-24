#!/usr/bin/env bash
# Ralph Starter — environment diagnostic
# Usage: bash .ralph/check.sh

set -u

echo "Ralph environment check"
echo "======================="

check() {
  local tool="$1"
  if command -v "$tool" >/dev/null 2>&1; then
    echo "  ✓ $tool"
  else
    echo "  ✗ $tool (not installed)"
  fi
}

echo ""
echo "Runtimes:"
for t in node npm bun python3 pipx uv; do check "$t"; done
if python3 -m pip --version >/dev/null 2>&1; then
  echo "  ✓ pip (via python3 -m pip)"
else
  echo "  ✗ pip"
fi

echo ""
echo "Backends:"
# Note: OmO bins are `oh-my-opencode` / `oh-my-openagent`.
# `ulw` / `ultrawork` are in-session OpenCode keywords, not PATH binaries.
for t in omc omx oh-my-opencode oh-my-openagent ouroboros ooo; do check "$t"; done

echo ""
echo "Backend diagnostics:"
if command -v omx >/dev/null 2>&1; then
  echo "  ℹ omx present; run 'omx doctor' for full OMX verification"
fi
if command -v omc >/dev/null 2>&1; then
  echo "  ℹ omc present; OMC Ralph is in-session: /ralph, not 'omc ralph'"
fi
if command -v oh-my-opencode >/dev/null 2>&1 || command -v oh-my-openagent >/dev/null 2>&1; then
  echo "  ℹ OmO present; use /ralph-loop or /ulw-loop inside OpenCode"
  echo "  ℹ Run 'oh-my-opencode install' in your project to register the plugin"
fi
if command -v ouroboros >/dev/null 2>&1 || command -v ooo >/dev/null 2>&1; then
  echo "  ℹ ouroboros present; workflow is 'ouroboros init' → 'ouroboros run <seed>.yaml'"
fi

echo ""
echo "Project files:"
[[ -f RALPH.md ]] && echo "  ✓ RALPH.md" || echo "  ✗ RALPH.md missing"
[[ -f .ralph/config ]] && echo "  ✓ .ralph/config" || echo "  ✗ .ralph/config missing"
[[ -x .ralph/run.sh ]] && echo "  ✓ .ralph/run.sh (timeboxed launcher)" || echo "  ✗ .ralph/run.sh missing or not executable"

echo ""
echo "Timebox:"
if [[ -f .ralph/config ]]; then
  mw_raw="$(grep -E '^[[:space:]]*max_wall_seconds=' .ralph/config | head -n1 \
            | sed -E 's/^[[:space:]]*max_wall_seconds=[[:space:]]*//' | tr -d '\r' || true)"
  if [[ -z "${mw_raw:-}" || "${mw_raw}" == "0" ]]; then
    echo "  ℹ max_wall_seconds=0 (disabled) — run.sh runs without wall-clock cap"
  else
    echo "  ℹ max_wall_seconds=${mw_raw}"
  fi
fi
if command -v gtimeout >/dev/null 2>&1; then
  echo "  ✓ gtimeout available (preferred on macOS)"
elif command -v timeout >/dev/null 2>&1; then
  echo "  ✓ timeout available (GNU coreutils)"
elif command -v perl >/dev/null 2>&1; then
  echo "  ✓ perl alarm fallback available"
else
  echo "  ✗ no timeout mechanism — install coreutils or perl for timebox support"
fi

echo ""
echo "If something is missing, run: bash .ralph/bootstrap.sh <backend>"
