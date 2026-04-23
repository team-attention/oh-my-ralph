#!/usr/bin/env bash
# Ralph Starter — backend installer
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

case "$BACKEND" in
  omc)
    if have omc; then
      echo "✓ omc already installed"
      exit 0
    fi
    echo "→ Installing oh-my-claudecode (omc)..."
    install_via_npm oh-my-claudecode
    ;;
  omx)
    if have omx; then
      echo "✓ omx already installed"
      exit 0
    fi
    echo "→ Installing oh-my-codex (omx)..."
    install_via_npm oh-my-codex
    ;;
  omo)
    if have ulw || have ultrawork; then
      echo "✓ ultrawork (omo) already installed"
      exit 0
    fi
    echo "→ Installing oh-my-opencode..."
    install_via_npm oh-my-opencode
    ;;
  ouroboros)
    if have ouroboros || have ooo; then
      echo "✓ ouroboros already installed"
      exit 0
    fi
    echo "→ Installing ouroboros..."
    if have npm; then
      install_via_npm ouroboros-cli || install_via_npm ouroboros
    elif have pip; then
      pip install ouroboros
    else
      echo "✗ Need npm or pip to install ouroboros" >&2
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
echo "Next: fill in RALPH.md, then run the loop command shown by your agent."
