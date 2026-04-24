#!/usr/bin/env bash
# Ralph Starter — native backend installer
# Usage: bash .ralph/bootstrap.sh <omc|omx|omo|ouroboros>

set -euo pipefail

BACKEND="${1:-}"

if [[ -z "$BACKEND" ]]; then
  echo "Usage: $0 <omc|omx|omo|ouroboros>" >&2
  exit 1
fi

have() { command -v "$1" >/dev/null 2>&1; }

install_via_npm() {
  local pkg="$1"
  if ! have npm; then
    echo "✗ npm not found. Install Node.js first: https://nodejs.org" >&2
    return 1
  fi
  npm i -g "$pkg"
}

run_if_available() {
  local tool="$1"
  shift
  if have "$tool"; then
    "$tool" "$@"
  fi
}

case "$BACKEND" in
  omc)
    if have omc; then
      echo "✓ omc already installed"
    else
      echo "→ Installing OMC CLI fallback package..."
      echo "  Preferred Claude Code path is plugin install:"
      echo "  /plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode"
      echo "  /plugin install oh-my-claudecode"
      install_via_npm oh-my-claude-sisyphus@latest
    fi
    echo "→ Run setup inside Claude Code with /omc-setup, or run: omc setup"
    ;;
  omx)
    if have omx; then
      echo "✓ omx already installed"
    else
      echo "→ Installing Codex CLI + oh-my-codex (omx)..."
      install_via_npm @openai/codex
      install_via_npm oh-my-codex
    fi
    echo "→ Refreshing OMX setup..."
    run_if_available omx setup || true
    echo "→ Verifying OMX..."
    run_if_available omx doctor || true
    ;;
  omo)
    # Published bins are `oh-my-opencode` / `oh-my-openagent`.
    # `ultrawork` / `ulw` are in-session OpenCode keywords, not PATH binaries.
    if have oh-my-opencode || have oh-my-openagent; then
      echo "✓ oh-my-opencode (omo) already installed"
    else
      echo "→ Installing oh-my-opencode using the published package..."
      echo "  Upstream agent guide:"
      echo "  https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/refs/heads/dev/docs/guide/installation.md"
      install_via_npm oh-my-opencode@latest
    fi
    # Version gate: oh-my-opencode 3.17+ requires opencode >= 1.4.0.
    # An older opencode silently crashes the plugin with `fn3 is not a function`.
    if have opencode; then
      OC_VER="$(opencode --version 2>/dev/null | awk 'NR==1{print $NF}')"
      OC_MIN="1.4.0"
      if [[ -n "$OC_VER" ]]; then
        # Compare via sort -V; if the minimum sorts after installed, warn.
        if [[ "$(printf '%s\n%s\n' "$OC_MIN" "$OC_VER" | sort -V | head -n1)" != "$OC_MIN" ]]; then
          echo "  ⚠ opencode $OC_VER detected; oh-my-opencode requires >= $OC_MIN." >&2
          echo "    Upgrade: 'brew upgrade opencode' or re-run opencode's installer." >&2
        fi
      fi
    fi
    echo "→ Next: run 'oh-my-opencode install' inside your project to register the plugin in opencode.json"
    run_if_available oh-my-opencode doctor || true
    ;;
  ouroboros)
    # Upstream is PyPI package `ouroboros-ai` (Q00/ouroboros).
    # Do NOT use npm — `ouroboros-cli` doesn't exist; npm `ouroboros` is an
    # unrelated pybee package with no CLI.
    if have ouroboros || have ooo; then
      echo "✓ ouroboros already installed"
      exit 0
    fi
    echo "→ Installing ouroboros (PyPI: ouroboros-ai)..."
    if have pipx; then
      pipx install ouroboros-ai
      # ouroboros-ai ships without the Claude adapter runtime dep; inject it
      # so `ouroboros run` can call the Claude Agent SDK. See:
      # https://github.com/Q00/ouroboros (adapters/claude_code_adapter.py)
      pipx inject ouroboros-ai claude-agent-sdk || \
        echo "  ⚠ failed to inject claude-agent-sdk — run 'pipx inject ouroboros-ai claude-agent-sdk' manually" >&2
    elif have uv; then
      uv tool install ouroboros-ai --with claude-agent-sdk
    elif have python3; then
      python3 -m pip install --user ouroboros-ai claude-agent-sdk \
        || python3 -m pip install --user --break-system-packages ouroboros-ai claude-agent-sdk
    elif have pip; then
      pip install --user ouroboros-ai claude-agent-sdk
    else
      echo "→ Falling back to upstream install script..."
      curl -fsSL https://raw.githubusercontent.com/Q00/ouroboros/main/scripts/install.sh | bash
    fi
    if ! have ouroboros && ! have ooo; then
      echo "✗ ouroboros install reported success but binary not on PATH" >&2
      echo "  Try: pipx install ouroboros-ai && pipx inject ouroboros-ai claude-agent-sdk" >&2
      exit 1
    fi
    ;;
  *)
    echo "Unknown backend: $BACKEND (expected: omc | omx | omo | ouroboros)" >&2
    exit 1
    ;;
esac

echo ""
echo "✓ Backend ready: $BACKEND"
echo "Next: fill in RALPH.md, then use the native handoff command shown in README.md."
