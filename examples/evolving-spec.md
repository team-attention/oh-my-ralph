# Pattern · 스펙 진화형 (evolving spec)

> **언제 쓰나?** 도메인이 익숙하지 않거나, 한 번에 다 적기 어려운 큰 작업.
> 스펙을 거칠게 시작 → ralph 루프 돌리면서 발견한 함정/누락을 사후에 다시 박아 넣는 방식.
>
> **실제 사례 기반:** Ralphthon · `cyberthug-screenclone` (스크린샷 → 시각 90% 유사도까지 수렴).
> 6회 이상 사후 패치 (smoke test, ST→US 매핑, "actual bugs" 가드) 로 진화.
> 핵심 학습: **거짓 완료 보고를 막는 검증 레이어** 와 **버그 박제 섹션** 이 사후에 반드시 들어왔다.

---

# Task
스크린샷 1장을 입력받아 시각적으로 유사한 HTML/CSS/JS 를 생성하는 단일 페이지 웹앱을 만든다. ralph 루프가 Vision verdict 점수 90% 를 넘을 때까지 반복.

# Context
- **Stack:** Vite + React 18 + TypeScript + TailwindCSS (frontend), Express (backend), Puppeteer 렌더링.
- **Entrypoint / 핵심 파일:** `src/client/`, `src/server/`, `src/shared/types/`
- **Run / Test 명령:** `npm run dev:all` (concurrently), `npm test`, `npm run test:e2e`
- **Domain notes:**
  - 디자인 토큰: `primary #6366f1`, `surface #1e1b2e`, `card #2a2740`, dark mode.
  - LLM 호출은 OpenAI 호환 단일 엔드포인트 (`OPENAI_BASE_URL` 환경변수).
  - 비교 시스템 2개: (a) Vision verdict (정성 + 피드백, ralph 의 primary signal), (b) pixelmatch (정량 시각화).

# Constraints
- 외부 LLM 키는 `.env` 만 사용. 코드에 하드코딩 금지.
- PRD 는 `prd.json` (머신용) + `PRD.md` (사람용) 듀얼 SOT 로 유지. 한쪽만 수정 금지.
- ralph 가 자동 커밋할 때 메시지는 `feat: [US-XXX] - <Story Title>` 포맷.

# Success Criteria
- [SC-1] User Story 21개 모두 `passes: true` | Verification: `cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes==false)] | length'` 결과 0.
- [SC-2] Vision verdict 점수 ≥ 90 | Verification: 마지막 iteration 의 `vision_score.json` 확인 (수동 OK).
- [SC-3] Smoke test 전부 그린 | Verification: `npm run test:smoke` (각 ST 가 어느 US 로 매핑되는지는 `docs/smoke-tests.md` ST→US 표 참조).
- [SC-4] CORS · WebSocket 경로 · TTS endpoint 가 `.env` 로 외부화됨 | Verification: `grep -E "(localhost:5173|/ws)" src/` 결과 0건.

# Risks & Unknowns
- macOS 카메라/마이크 권한이 처음 실행 시 prompt — headless CI 에서 깨질 수 있음.
- OpenWaifu (OLV) WebSocket 경로는 `/client-ws` (이전 `/ws` 로 시도하다 발견 — 사고 박제).
- LLM 응답이 이미지 base64 길어서 컨텍스트 초과 가능. 청크 분할 필요.
- (ralph 가 진행하면서 발견한 위험은 여기에 한 줄씩 append. **이 섹션은 지우지 마세요 — 같은 실수를 막는 가드입니다.**)

# Verification Commands
```bash
# 자동
npm run typecheck
npm test
npm run test:smoke
npm run test:e2e

# 진행 상황
cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes==false)] | length'

# 수동 (브라우저)
# 1. npm run dev:all
# 2. localhost:5173 접속, 스크린샷 1장 드롭
# 3. 채팅창에서 Cloney 의 진행 보고 + 최종 vision verdict 점수 확인
```

---

## 진화형의 핵심 운영 룰

1. **스펙은 한 번에 완성되지 않는다.** ralph 가 트리거한 사고를 본 즉시 `Risks & Unknowns` 에 한 줄 박는다.
2. **"actual bugs encountered" 섹션은 절대 지우지 않는다.** 같은 실수를 다시 안 하는 가드.
3. **smoke test → US 매핑 표** 를 별도 파일(`docs/smoke-tests.md`)로 관리. 어떤 smoke 가 깨지면 어떤 US 가 다시 `passes: false` 로 돌아갈지 명시.
4. ralph 가 "다 됐다" 라고 하기 시작하면 **검증 명령을 더 추가하는 게 정답.**
