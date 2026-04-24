<div align="center">

# oh-my-ralph

### Paste the URL. Start ralphing.

A self-bootstrapping starter repo for **ralph persistence loops** — works with Claude Code, Codex, OpenCode, and Ouroboros. No wrapper CLI to learn. Your agent reads this repo, installs the native backend, fills `RALPH.md`, and hands you off to that backend's own Ralph surface.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?labelColor=black&style=flat-square)](LICENSE)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?labelColor=black&style=flat-square&logo=discord&logoColor=white)](https://discord.gg/oh-my-ralph)

</div>

---

## 30-second start

Open your agent (Claude Code / Codex / OpenCode / Ouroboros) and paste:

> `https://github.com/team-attention/oh-my-ralph 이 repo 읽고 나한테 ralph loop 셋업해줘`

Your agent will:

1. **Detect** which runtime it is (OMC / OMX / OmO / Ouroboros)
2. **Install and verify** the matching backend if needed
3. **Onboard** — ask what you want to build, fill `RALPH.md`
4. **Hand off natively** — tell you the exact command or in-session skill to start the loop

That's it. No meta CLI. No invented syntax. Your existing tool, ralphified.

## Why this exists

Ralph is a simple idea — a persistence loop that `verify → fix → verify → fix → done`. Every major coding agent has its own ralph flavor:

- **Codex** → [oh-my-codex (omx)](https://github.com/Yeachan-Heo/oh-my-codex)
- **Claude Code** → [oh-my-claudecode (omc)](https://github.com/Yeachan-Heo/oh-my-claudecode)
- **OpenCode** → [oh-my-opencode (omo)](https://github.com/code-yeongyu/oh-my-openagent)
- **Spec-first** → [ouroboros](https://github.com/Q00/ouroboros)

Instead of building yet another wrapper on top, this repo is **a README your agent reads**. `CLAUDE.md` / `AGENTS.md` contain runtime-specific bootstrap instructions. The agent does the work, then hands off to the backend's native workflow.

## Native handoff map

| Runtime | Setup path | Ralph handoff |
|---------|------------|---------------|
| Claude Code + OMC | Claude Code plugin install, then `/omc-setup`; shell fallback: `bash .ralph/bootstrap.sh omc` | Claude Code in-session: `/ralph "<task>"` |
| Codex + OMX | `bash .ralph/bootstrap.sh omx`, then `omx setup` / `omx doctor` | `omx ralph "<task>"` (free-text), or `omx ralph --prd` (requires pre-authored `.omx/prd.json`), or inside OMX: `$ralph "<task>"`. **Requires interactive TTY** — Codex shows a one-time "Star on GitHub?" prompt on first run that aborts in headless mode. |
| OpenCode + OmO | `bash .ralph/bootstrap.sh omo`, then `oh-my-opencode install` in your project to register the plugin; verify with `oh-my-opencode doctor` (`ultrawork`/`ulw` are in-session keywords, not binaries). Requires `opencode` ≥ 1.4.0. | OpenCode in-session: `/ralph-loop "<task>"`; use `/ulw-loop "<task>"` for ultrawork mode. Headless: `opencode run --command ralph-loop "<task>"` or `oh-my-opencode run "<task>"`. |
| Ouroboros | `bash .ralph/bootstrap.sh ouroboros` (installs PyPI `ouroboros-ai` via pipx/uv) | `ouroboros init` → `ouroboros run <seed>.yaml` (Ouroboros takes a YAML seed, not `RALPH.md` — use RALPH.md as your interview script) |

`omc ralph` is intentionally not listed: OMC Ralph is an in-session Claude Code skill, not an OMC CLI subcommand.

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
    ├── evolving-spec.md   # spec-evolves-with-ralph pattern (screenclone)
    ├── frozen-spec.md     # sharpen-then-freeze pattern (houseops)
    ├── todo-app.md
    ├── fix-bug.md
    └── refactor.md
```

## Spec format (RALPH.md)

`RALPH.md` has **6 sections**. The two on the right are what stops ralph from
lying about completion — don't skip them.

```markdown
# Task
Refactor the payment module to use Stripe instead of PayPal.

# Context
- **Stack:** Express + TypeScript
- **Entrypoint / 핵심 파일:** src/payments/, src/routes/checkout.ts
- **Run / Test 명령:** npm test, npm run dev
- **Domain notes:** Stripe keys in .env (STRIPE_SECRET_KEY).

# Constraints
- Don't break existing integration tests.
- Remove all @paypal/* deps from package.json.
- Migration must be revertible in a single commit.

# Success Criteria
- [SC-1] API response schema preserved | Verification: `npm run test:contract` green.
- [SC-2] PayPal removed | Verification: `grep -ri paypal src/ package.json` returns 0.
- [SC-3] Card + webhook flow works | Verification: manual — Stripe test card 4242…, observe `payment_intent.succeeded` in logs.

# Risks & Unknowns
- Webhook signature verification — missing STRIPE_WEBHOOK_SECRET breaks prod silently.
- Idempotency-key header: PayPal didn't need it, Stripe recommends it.

# Verification Commands
\`\`\`bash
npm test
npm run test:contract
grep -ri paypal src/ package.json
\`\`\`
```

Each Success Criterion uses `[ID] body | Verification: <command or manual procedure>`.
**If `Verification Commands` is empty, ralph won't start** — that's the rule that
keeps "looks done" from passing as "is done."

### Two starter patterns

| Pattern | When | Example |
|---------|------|---------|
| **Evolving spec** | Domain unfamiliar, can't write it all at once. Patch the spec as ralph hits surprises. | [`examples/evolving-spec.md`](./examples/evolving-spec.md) — based on Ralphthon `cyberthug-screenclone` |
| **Frozen spec** | Domain clear, want autonomous execution. Sharpen first (Socratic interview), then freeze. | [`examples/frozen-spec.md`](./examples/frozen-spec.md) — based on Ralphthon `houseops` (1st place, ~100k LOC autonomous) |

Browse [`examples/`](./examples/) for the full set, including simpler `todo-app.md` / `fix-bug.md` / `refactor.md`.

## Use as a GitHub Template

Click **"Use this template"** at the top of this repo → new repo with everything preinstalled. Then open your agent inside the clone and paste the prompt above.

## Timeboxed launcher (optional)

For headless / automated ralph loops, use `.ralph/run.sh` to wrap the native
handoff with a wall-clock cap:

```bash
# set the cap in .ralph/config (accepts 900, 15m, 1h, 1h30m, 30s, or 0 to disable)
echo 'max_wall_seconds=15m' >> .ralph/config

# launch any of the headless backends
bash .ralph/run.sh omx "Build rustsidian per RALPH.md"
bash .ralph/run.sh omo "Build rustsidian per RALPH.md"
bash .ralph/run.sh ouroboros rustsidian.seed.yaml
```

The wrapper picks `gtimeout` → `timeout` → `perl alarm` (first available).
GNU `timeout`/`gtimeout` exits 124 on expiry; the perl fallback exits 142.
Install coreutils (`brew install coreutils` on macOS) for GNU exit-code semantics.

**Not applicable to in-session handoffs** — `omc /ralph` and OpenCode's
in-TUI `/ralph-loop` cannot be wrapped from a parent shell. `bash .ralph/run.sh omc`
prints the correct manual handoff and exits.

## Troubleshooting

```bash
bash .ralph/check.sh
```

Tells you which runtimes and backends are present. If something is missing, the agent reinstalls or re-verifies via `.ralph/bootstrap.sh`.

If a backend's package name or setup flow has changed, the agent follows the current upstream instructions listed in `.ralph/prompts/install.md`.

## Powered by

- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) — [@Yeachan-Heo](https://github.com/Yeachan-Heo)
- [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) — [@Yeachan-Heo](https://github.com/Yeachan-Heo)
- [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) — [@code-yeongyu](https://github.com/code-yeongyu)
- [ouroboros](https://github.com/Q00/ouroboros) — [@Q00](https://github.com/Q00)

## Why "Ralph"?

Ralph is the persistence loop pattern — an autonomous execution loop that keeps working until verification confirms the task is complete. Ralph doesn't give up. Ralph doesn't sleep. Ralph ships.

## License

MIT
