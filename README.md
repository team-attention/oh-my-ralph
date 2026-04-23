<div align="center">

# oh-my-ralph

### Paste the URL. Start ralphing.

A self-bootstrapping starter repo for **ralph persistence loops** — works with Claude Code, Codex, OpenCode, and Ouroboros. No wrapper CLI to learn. Your agent reads this repo and sets everything up.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?labelColor=black&style=flat-square)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?labelColor=black&style=flat-square&logo=discord&logoColor=white)](https://discord.gg/oh-my-ralph)

</div>

---

## 30-second start

Open your agent (Claude Code / Codex / OpenCode / Ouroboros) and paste:

> `https://github.com/team-attention/oh-my-ralph 이 repo 읽고 나한테 ralph loop 셋업해줘`

Your agent will:

1. **Detect** which runtime it is (omc / omx / omo / ouroboros)
2. **Install** the matching backend if needed
3. **Onboard** — ask what you want to build, fill `RALPH.md`
4. **Hand off** — tell you the exact command to start the loop

That's it. No meta CLI. No new syntax. Your existing tool, ralphified.

## Why this exists

Ralph is a simple idea — a persistence loop that `verify → fix → verify → fix → done`. Every major coding agent has its own ralph flavor:

- **Codex** → [oh-my-codex (omx)](https://github.com/Yeachan-Heo/oh-my-codex)
- **Claude Code** → [oh-my-claudecode (omc)](https://github.com/Yeachan-Heo/oh-my-claudecode)
- **OpenCode** → [oh-my-opencode (omo)](https://github.com/code-yeongyu/oh-my-openagent)
- **Spec-first** → [ouroboros](https://github.com/Q00/ouroboros)

Instead of building yet another wrapper on top, this repo is **a README your agent reads**. `CLAUDE.md` / `AGENTS.md` contain runtime-specific bootstrap instructions. The agent does the work. Zero abstraction drift.

## What you get

```
oh-my-ralph/
├── CLAUDE.md              # Bootstrap for Claude Code
├── AGENTS.md              # Bootstrap for Codex / OpenCode
├── RALPH.md               # Your spec (fill this in)
├── .ralph/
│   ├── bootstrap.sh       # Backend installer
│   ├── check.sh           # Environment diagnostic
│   ├── config             # max_iterations, etc.
│   └── prompts/           # Fallback guidance for the agent
└── examples/              # Copy-paste starter specs
    ├── todo-app.md
    ├── fix-bug.md
    └── refactor.md
```

## Spec format (RALPH.md)

```markdown
# Task
Refactor the payment module to use Stripe instead of PayPal.

# Context
Express + TypeScript. Stripe keys in .env.

# Constraints
- Don't break existing tests.
- Keep the API backwards compatible.

# Success Criteria
- All tests pass.
- Manual checkout flow works end-to-end.
```

Browse [`examples/`](./examples/) for ready-to-copy specs.

## Use as a GitHub Template

Click **"Use this template"** at the top of this repo → new repo with everything preinstalled. Then open your agent inside the clone and paste the prompt above.

## Troubleshooting

```bash
bash .ralph/check.sh
```

Tells you which runtimes and backends are present. If something is missing, the agent reinstalls via `.ralph/bootstrap.sh`.

If a backend's npm name has changed, the agent falls back to cloning from the upstream repos listed in `.ralph/prompts/install.md`.

## Powered by

- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) — [@Yeachan-Heo](https://github.com/Yeachan-Heo)
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) — [@Yeachan-Heo](https://github.com/Yeachan-Heo)
- [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — [@code-yeongyu](https://github.com/code-yeongyu)
- [ouroboros](https://github.com/Q00/ouroboros) — [@Q00](https://github.com/Q00)

## Why "Ralph"?

Ralph is the persistence loop pattern — an autonomous execution loop that keeps working until verification confirms the task is complete. Ralph doesn't give up. Ralph doesn't sleep. Ralph ships.

## License

MIT
