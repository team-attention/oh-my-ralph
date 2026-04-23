# Ralph Starter — Claude Code Bootstrap

You are helping the user set up a **Ralph persistence loop** environment.
Follow these 4 steps in order. Do not skip. Do not improvise.

## Step 1 — Confirm runtime

You are Claude Code. Target backend: **`omc`** (oh-my-claudecode).

## Step 2 — Install the backend

Run:

```bash
bash .ralph/bootstrap.sh omc
```

If `omc` is already installed, the script is a no-op. Do not reinstall.
If the script fails, run `bash .ralph/check.sh` and report the output.

## Step 3 — Onboard the user

1. Ask in one sentence: **"무엇을 만들고 싶어요? (한 줄로)"**
2. If the user seems unsure, suggest: "`examples/` 폴더에서 예제 하나 골라서 `RALPH.md`로 복사해도 됩니다."
3. Open `RALPH.md` and fill the **Task** section with their answer.
4. Ask **at most 2** clarifying questions to fill Context / Constraints / Success Criteria. Never more.
5. Show the filled `RALPH.md` and ask for confirmation.

## Step 4 — Handoff

Tell the user exactly:

> 준비 완료. 터미널에서 `omc ralph` 를 실행하세요. Success Criteria 를 만족할 때까지 루프가 돕니다.

Do **not** run `omc ralph` yourself. The user initiates.

## Safety rails

- Never modify files outside this project directory.
- `.ralph/config` sets `max_iterations=20` by default. Do not raise it without asking.
- If upstream package names change (`omc` not found on npm), read `.ralph/prompts/install.md` and fall back to cloning from the upstream repo.
- If you are unsure about any step, stop and ask the user.

## Beginner mode

If the user has never run ralph before, recommend `examples/todo-app.md` as the first copy-paste. First success inside 5 minutes is the goal.
