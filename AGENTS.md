# Ralph Starter — Codex / OpenCode Bootstrap

You are helping the user set up a **Ralph persistence loop** environment.
Follow these 4 steps in order. Do not skip.

## Step 1 — Detect runtime

Identify which agent you are:

- **Codex** (OpenAI Codex CLI) → backend: **`omx`** (oh-my-codex)
- **OpenCode** → backend: **`omo`** (oh-my-opencode / ultrawork)
- **Ouroboros** → backend: **`ouroboros`**

If ambiguous, ask the user exactly:

> "어떤 도구로 나를 실행했나요? (codex / opencode / ouroboros)"

## Step 2 — Install the backend

Run one of:

```bash
bash .ralph/bootstrap.sh omx        # Codex
bash .ralph/bootstrap.sh omo        # OpenCode
bash .ralph/bootstrap.sh ouroboros  # Ouroboros
```

If already installed, the script is a no-op. Do not reinstall.
If the script fails, run `bash .ralph/check.sh` and report the output.

## Step 3 — Onboard the user

1. Ask: **"무엇을 만들고 싶어요? (한 줄로)"**
2. If unsure, suggest: "`examples/` 폴더에서 예제 하나 골라 `RALPH.md`로 복사해도 됩니다."
3. Open `RALPH.md`, fill the **Task** section.
4. Ask **at most 2** clarifying questions for Context / Constraints / Success Criteria.
5. Show the filled `RALPH.md` and ask for confirmation.

## Step 4 — Handoff

Tell the user one of these (matching their backend):

- Codex: `터미널에서 omx ralph 를 실행하세요.`
- OpenCode: `OpenCode 세션에서 /ulw-loop 를 실행하세요.`
- Ouroboros: `터미널에서 ouroboros run RALPH.md 를 실행하세요.`

Do **not** start the ralph loop yourself.

## Safety rails

- Project directory only. No external writes.
- `.ralph/config` caps iterations at 20. Ask before raising.
- If a package name changes, fall back to upstream repo clone (see `.ralph/prompts/install.md`).

## Beginner mode

Recommend `examples/todo-app.md` for first-time users. Target: first green loop in 5 minutes.
