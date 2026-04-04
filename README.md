# oh-my-ralph

Meta CLI for running **ralph persistence loops** across coding agents. Write a spec once, run it through any supported backend.

## Install

```bash
npm i -g oh-my-ralph
```

## Quick Start

```bash
# Initialize a spec file
omr init

# Edit spec.md, then run with your preferred backend
omr ralph --backend claude

# Or pass a task directly
omr ralph "refactor the auth module to use JWT"
```

## Backends

| Name | Binary | GitHub |
|------|--------|--------|
| `codex` | `codex` | [openai/codex](https://github.com/openai/codex) |
| `claude` | `claude` | [anthropics/claude-code](https://github.com/anthropics/claude-code) |
| `openagent` | `crush` or `opencode` | [opencode-ai/opencode](https://github.com/opencode-ai/opencode) |
| `ouroboros` | `ouroboros` | [ouroboros-ai/ouroboros](https://github.com/ouroboros-ai/ouroboros) |

Check which backends are installed:

```bash
omr doctor
```

## Commands

| Command | Description |
|---------|-------------|
| `omr ralph [task]` | Run ralph loop. Pass a task string or read from spec file. |
| `omr ralph --backend <name>` | Use a specific backend. |
| `omr ralph --spec <path>` | Use a specific spec file. |
| `omr init` | Create `spec.md` in current directory. |
| `omr init --format yaml` | Create `spec.yaml` instead. |
| `omr doctor` | Show which backends are available. |
| `omr config set default-backend <name>` | Set default backend. |
| `omr config set spec-format <md\|yaml>` | Set default spec format. |
| `omr config get default-backend` | Get current default backend. |

## Spec File

`spec.md` example:

```markdown
# Task
Refactor the payment module to use Stripe instead of PayPal.

# Context
The codebase uses Express + TypeScript. Stripe keys are in .env.

# Constraints
- Do not break existing tests
- Keep backwards compatibility for the API

# Success Criteria
- All tests pass
- Manual checkout flow works end-to-end
```

YAML format (`spec.yaml`) is also supported.
