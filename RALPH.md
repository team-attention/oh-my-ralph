# Visual Spec: RALPH.png
<!-- 같이 읽혀야 하는 이미지 스펙. Ralph loop / Codex / agent 설명도가 아니라,
     사용자가 만들고자 하는 제품의 목표 상태 — 화면 / 흐름 / 상태 / 사용 결과 — 를 그려야 합니다.
     로고·마스코트·아키텍처 다이어그램 금지.

     RALPH.md 는 검증 가능한 텍스트 계약,
     RALPH.png 는 한눈에 이해 가능한 시각 계약 — 두 개가 같이 있어야 ralph 가 헛돌지 않습니다.

     생성 권장 — Codex Plan mode 에서:
       $clarify-image
     스킬 위치: .codex/skills/clarify-image/ (오프 the shelf, 이 repo 안에 동봉)

     clarify-image 가 진행하는 순서:
       1. 제품 의도 / 사용자 / 범위의 모호성을 좁히는 질문 (스타일 질문 금지)
       2. request_user_input 으로 2–3개 선택지 제시
       3. 선택 → 시각 가설 → 이미지 생성
       4. 생성된 이미지를 보고 misunderstanding + expansion 피드백
       5. 충분히 좁혀지면 RALPH.png 로 저장

     현재 RALPH.png 가 비어 있다면 ralph 시작 전에 먼저 만들어주세요. -->
![RALPH.png — 시각 스펙 (제품의 목표 상태)](./RALPH.png)


# Task
<!-- 한 줄로. 무엇을 만들거나 고치고 싶은지. -->


# Context
<!-- ralph 가 헷갈리지 않도록 환경/스택/도메인을 채워줍니다.
     비어 있으면 ralph 가 잘못된 가정으로 시작합니다. -->
- **Stack:** 
- **Entrypoint / 핵심 파일:** 
- **Run / Test 명령:** 
- **Domain notes (이 도메인에서만 통하는 룰):** 


# Constraints
<!-- 깨면 안 되는 것. ralph 가 "편의상 무시" 할 가능성을 차단합니다. -->
- 


# Success Criteria
<!-- [ID] 본문 | Verification: <어떻게 확인할지 (명령 또는 수동 절차)>
     형식으로 적습니다. Verification 이 비어 있으면 ralph 는 시작하지 않습니다. -->
- [SC-1]  | Verification: 
- [SC-2]  | Verification: 


# Risks & Unknowns
<!-- 사전에 떠올린 위험. ralph 가 진행하면서 발견한 것도 여기에 누적합니다.
     ("Do not remove" — 같은 실수를 반복하지 않는 가드.) -->
- 


# Verification Commands
<!-- 한 곳에 모인 검증 명령. ralph 는 매 반복 끝에 이 명령들을 실행해
     스스로 "정말 끝났는가" 를 판정합니다. 비어 있으면 시작 거부. -->
```bash
# 예: lint
# 예: type check
# 예: unit test
# 예: smoke test (실제로 동작하는지)
# 예: 시각 비교 — RALPH.png 와 현재 빌드 산출물의 차이가 허용 범위 안인지
```
