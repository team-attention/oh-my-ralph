# Ralph Starter — Claude Code / OMC Bootstrap

You are helping the user set up a **Ralph persistence loop** environment.
Follow these 4 steps in order. Do not skip.

## Step 1 — Confirm runtime

You are Claude Code. Target backend: **OMC** (oh-my-claudecode).

Important: OMC Ralph is an in-session Claude Code skill. Do **not** tell the
user to run `omc ralph`; that CLI subcommand does not exist in OMC. The
handoff is `/ralph` inside Claude Code, or the equivalent natural command
`ralph ...` when the skill is installed.

## Step 2 — Install the backend

Preferred OMC install is the Claude Code plugin flow. If the plugin is not
already installed, tell the user to run these Claude Code slash commands one at
a time:

```text
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
/plugin install oh-my-claudecode
/omc-setup
```

If the user wants a shell-installable CLI/runtime path instead, run:

```bash
bash .ralph/bootstrap.sh omc
```

If `omc` is already installed, the script is a no-op. Do not reinstall. If the
script fails, run `bash .ralph/check.sh` and report the output.

## Step 2.5 — Visual Spec

`RALPH.md` 옆에 **`RALPH.png`** 가 같이 있으면 ralph 가 훨씬 정확합니다.
- `RALPH.md` = 검증 가능한 텍스트 계약
- `RALPH.png` = 한눈에 이해 가능한 시각 계약 (제품 목표 상태 — 화면/흐름/상태/사용 결과)

Claude Code 안에서 직접 이미지 생성을 권장하지는 않습니다. **Codex Plan mode + `$clarify-image` 스킬** 로 만든 후 다시 Claude Code 로 돌아오는 흐름을 안내하세요. 스킬은 `.codex/skills/clarify-image/` 에 동봉되어 있습니다 (canonical: `.claude/skills/clarify-image/`).

만약 사용자가 Claude Code 안에서 끝까지 진행하길 원하면, Imagen / DALL·E / Sora 같은 외부 생성기를 사용하도록 안내하되 다음 룰을 강제하세요:
- 제품의 **목표 상태** (화면/흐름/상태/사용 결과) 만 그릴 것
- Ralph loop / Codex / agent 다이어그램, 로고, 마스코트는 금지
- 스타일 질문 전에 **제품 스펙 질문** 을 먼저

---

## Step 3 — Onboard the user (Socratic mini-interview)

`RALPH.md` 는 6개 섹션입니다 — **Task / Context / Constraints / Success Criteria / Risks & Unknowns / Verification Commands**. 이 6개를 채우는 짧은 Socratic 인터뷰를 진행하세요.

1. Ask in one sentence: **"무엇을 만들고 싶어요? (한 줄로)"** → `Task` 채움.
2. If the user seems unsure, suggest a starting pattern:
   - 도메인이 익숙하지 않거나 "한 번에 다 못 적겠다" → `examples/evolving-spec.md` (스펙 진화형, screenclone 사례)
   - 도메인이 명확하고 자율 실행 원함 → `examples/frozen-spec.md` (스펙 동결형, houseops 사례)
   - 더 단순한 케이스 → `todo-app.md` / `fix-bug.md` / `refactor.md`
3. Ask **5 short Socratic questions** to fill the rest (한 번에 한 개씩, 답을 받으면 다음으로):
   1. **Context · Stack/Entrypoint** — "어떤 스택이고, 시작 파일/명령은?"
   2. **Constraints** — "절대 깨면 안 되는 게 있나요? (예: 기존 API 호환, 디펜던시 추가 금지)"
   3. **Success Criteria** — "어떻게 되면 '끝났다' 라고 판단하시나요? **각 항목마다 검증 방법(명령 또는 수동 절차)** 을 같이 답해주세요."
   4. **Risks & Unknowns** — "지금 시점에 가장 걱정되는 함정/모르는 것 1–2개?"
   5. **Verification Commands** — "한 줄로 `npm test`, `pytest`, `make check` 같은 검증 명령이 있나요?"
4. **Verification Commands 가 비어 있으면 ralph 를 시작하지 마세요.** 사용자에게 한 번 더 물어보세요 — "검증 명령이 없으면 ralph 가 '다 됐다' 라고 거짓 보고할 위험이 큽니다. 단 한 줄이라도 좋으니 `잘 됐다` 를 어떻게 확인할지 알려주세요." 답이 정말 없으면 적어도 **수동 확인 절차** 를 SC 의 Verification 칸에 적게 한다.
5. Show the filled `RALPH.md` and ask for confirmation.

## Step 4 — Handoff

Tell the user exactly:

> 준비 완료. Claude Code에서 `/ralph "<Task 요약>"` 를 실행하세요. Success Criteria 를 만족할 때까지 루프가 돕니다.

Do **not** start `/ralph` yourself. The user initiates.

## Safety rails

- Never modify files outside this project directory.
- `.ralph/config` sets `max_iterations=20` by default. Do not raise it without asking.
- Optional wall-clock cap via `.ralph/config`: `max_wall_seconds=` accepts `900` / `15m` / `1h` / `1h30m` / `30s` / `0` (disabled). Applied only when the user launches with `bash .ralph/run.sh <backend> ...` — the in-session `/ralph` skill is NOT subject to this wrapper and must self-enforce.
- If upstream package names change, read `.ralph/prompts/install.md` and follow the current upstream install docs.
- If you are unsure about any step, stop and ask the user.

## Beginner mode

If the user has never run ralph before, recommend `examples/todo-app.md` as the first copy-paste. First success inside 5 minutes is the goal.
