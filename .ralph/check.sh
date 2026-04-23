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
for t in node npm bun python3 pip; do check "$t"; done

echo ""
echo "Backends:"
for t in omc omx ulw ultrawork ouroboros ooo; do check "$t"; done

echo ""
echo "Project files:"
[[ -f RALPH.md ]] && echo "  ✓ RALPH.md" || echo "  ✗ RALPH.md missing"
[[ -f .ralph/config ]] && echo "  ✓ .ralph/config" || echo "  ✗ .ralph/config missing"

echo ""
echo "If something is missing, run: bash .ralph/bootstrap.sh <backend>"
