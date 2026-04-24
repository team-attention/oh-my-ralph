# Ralph Starter — Codex / OpenCode / Ouroboros Bootstrap

You are helping the user set up a **Ralph persistence loop** environment.
Follow these 4 steps in order. Do not skip.

## Step 1 — Detect runtime

Identify which agent you are:

- **Codex** (OpenAI Codex CLI) → backend: **OMX** (oh-my-codex)
- **OpenCode** → backend: **OmO** (oh-my-opencode / oh-my-openagent)
- **Ouroboros** → backend: **`ouroboros`**

If ambiguous, ask the user exactly:

> "어떤 도구로 나를 실행했나요? (codex / opencode / ouroboros)"

## Step 2 — Install the backend

Run one of:

```bash
bash .ralph/bootstrap.sh omx        # Codex
bash .ralph/bootstrap.sh omo        # OpenCode / OmO
bash .ralph/bootstrap.sh ouroboros  # Ouroboros
```

If already installed, the script is a no-op. Do not reinstall. If the script
fails, run `bash .ralph/check.sh` and report the output.

Backend-specific setup expectations:

- Codex / OMX: install `@openai/codex` and `oh-my-codex`, run `omx setup`, then `omx doctor`.
- OpenCode / OmO: install the published `oh-my-opencode` package; if that fails, follow the upstream installation guide in `.ralph/prompts/install.md`. Verify with `command -v oh-my-opencode` and `oh-my-opencode doctor`, then run `oh-my-opencode install` inside your project to register the plugin. Note: `ultrawork` / `ulw` are in-session OpenCode keywords, not PATH binaries.
- Ouroboros: install from PyPI (`pipx install ouroboros-ai` or `uv tool install ouroboros-ai`) — there is no npm package. Verify `ouroboros` or `ooo`.

## Step 2.5 — Visual Spec (Codex 권장)

`RALPH.md` 옆에 **`RALPH.png`** 가 같이 있어야 ralph 가 헛돌지 않습니다.
- `RALPH.md` = 검증 가능한 텍스트 계약
- `RALPH.png` = 한눈에 이해 가능한 시각 계약 (제품의 목표 상태 — 화면/흐름/상태/사용 결과)

**Codex 사용 시** — Plan mode 에서 동봉된 스킬을 사용하세요:

```text
$clarify-image
```

스킬 위치: `.codex/skills/clarify-image/` (이 repo 안에 동봉, canonical 경로는 `.claude/skills/clarify-image/`).

clarify-image 가 자동으로 진행하는 순서:
1. 제품 의도 / 사용자 / 범위의 모호성을 좁히는 질문 (스타일 질문 금지)
2. `request_user_input` 으로 2–3개 선택지 제시 → 선택 → 시각 가설 → 이미지 생성
3. 생성된 이미지를 보고 misunderstanding + expansion 피드백 → 충분히 좁혀지면 `RALPH.png` 로 저장

**금지 사항**:
- Ralph loop / Codex / agent 구조도, 로고, 마스코트는 RALPH.png 가 아닙니다.
- 스타일/카메라/레이아웃 같은 craft 질문보다 **제품 스펙 질문** 을 먼저 합니다.

OMC / OmO / Ouroboros 사용자도 동일한 결과물을 만들 수 있으면 OK — 도구는 자유, 산출물(`RALPH.png` 가 제품 목표 상태) 만 맞추면 됩니다.

---

## Step 3 — Onboard the user (Socratic mini-interview)

`RALPH.md` 는 6개 섹션입니다 — **Task / Context / Constraints / Success Criteria / Risks & Unknowns / Verification Commands**. 이 6개를 채우는 짧은 Socratic 인터뷰를 진행하세요.

1. Ask: **"무엇을 만들고 싶어요? (한 줄로)"** → `Task` 채움.
2. If unsure, suggest a starting pattern:
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

Tell the user one of these (matching their backend):

- Codex / OMX: `터미널에서 omx ralph "<Task 요약>" 를 실행하거나 (free-text), .omx/prd.json 을 먼저 작성하고 omx ralph --prd 를 쓰세요. omx 세션 안에서는 $ralph "<Task 요약>". 주의: Codex는 interactive TTY 가 필요합니다 — 최초 실행 시 "Star on GitHub?" 프롬프트가 나타나며 non-TTY 환경에서는 abort 됩니다. Headless 자동화 전에 한 번 interactive 로 실행해 프롬프트를 dismiss 하세요.`
- OpenCode / OmO: `OpenCode 세션에서 /ralph-loop "<Task 요약>" 를 실행하세요. 최대 강도로 병렬 실행이 필요하면 /ulw-loop "<Task 요약>" 를 사용하세요. Headless로 돌리려면: opencode run --command ralph-loop "<Task 요약>" 또는 oh-my-opencode run "<Task 요약>". (opencode >= 1.4.0 필요)`
- Ouroboros: `터미널에서 ouroboros init 으로 Socratic 인터뷰를 진행한 뒤 ouroboros run <seed>.yaml 를 실행하세요. Ouroboros는 Markdown이 아닌 YAML seed 를 입력으로 받습니다. RALPH.md 의 내용은 init 인터뷰 답변 자료로 활용하세요.`

Do **not** start the ralph loop yourself.

## Safety rails

- Project directory only. No external writes.
- `.ralph/config` caps iterations at 20. Ask before raising.
- Optional wall-clock cap: set `max_wall_seconds` in `.ralph/config` (formats: `900`, `15m`, `1h`, `1h30m`, `30s`, `0` = disabled). Apply via `bash .ralph/run.sh <omx|omo|ouroboros> ...` — OMC/OmO in-TUI handoffs cannot be wrapped from a parent shell.
- If a package name changes, fall back to upstream repo clone (see `.ralph/prompts/install.md`).

## Beginner mode

Recommend `examples/todo-app.md` for first-time users. Target: first green loop in 5 minutes.
