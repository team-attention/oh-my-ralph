# Pattern · 스펙 동결형 (frozen spec)

> **언제 쓰나?** 도메인이 명확하고, 사람이 ralph 옆에서 계속 봐주기 어려운 작업.
> Socratic 인터뷰로 ambiguity 를 충분히 깎은 뒤 스펙을 동결 → ralph 가 자율 실행.
>
> **실제 사례 기반:** Ralphthon · `houseops` (1등팀, Q00, Ouroboros).
> **133+ 라운드 인터뷰** 로 `ambiguity_score: 0.05` 까지 떨어뜨린 후, **스펙은 한 줄도 수정하지 않고** 4세대 자동 실행으로 ~10만 줄 생성.
> 핵심 학습: **사전에 충분히 깎으면, 사람이 옆에 없어도 작동한다.**

---

# Task
2인 가구의 가사 노동을 자동 분배하는 Discord 봇 + 고정 카메라 + GPT-4o Vision 시스템을 만든다.

# Context
- **Stack:** Python 3.14+, macOS native (no Docker). discord.py 2.x + opencv-python + SQLite + OpenAI API.
- **Entrypoint / 핵심 파일:** `src/houseops/__main__.py`, `src/houseops/bot/`, `config.yaml`, `.env`
- **Run / Test 명령:** `python -m houseops`, `pytest`
- **Domain notes:**
  - macOS 카메라 인덱스는 USB 연결 순서로 바뀜 — `system_profiler` 로 사전 검증.
  - `cv2.VideoCapture` 는 10-frame warmup 필요.
  - JPEG quality 95 / 1920×1080 (Logitech StreamCam, MacBook FaceTime 검증됨).
  - VLM 점수 매칭: 0=clean, 100=dirty. 3-call median 사용.
  - 7-day rolling points 기반 자동 재배분 (낮은 누적 → 높은 점수 zone 배정).

# Constraints
- 2인 가구 한정 (MVP). 멀티 가구 추후.
- 모든 영구 상태는 단일 SQLite 파일. config 는 `config.yaml`, secrets 는 `.env`.
- Discord 봇이 유일한 사용자 인터페이스 (공용 채널 + DM).
- 패키지 네이밍: `src/houseops/bot/` (NOT `discord/` — import 충돌).
- 한국어/영어는 사용자 입력 언어를 자동 감지.

# Success Criteria
<!-- 카테고리 prefix 로 도메인 영역을 분리. 누락 영역 시각 감지. -->

**Observation (관찰)**
- [OBS-1] opencv-python 으로 카메라 캡처 | Verification: Unit test (mock CameraProvider) + 실제 카메라로 1장 저장.
- [OBS-2] 매시간 스냅샷 + catch-up 스케줄러 | Verification: 4시간 시뮬레이션에서 정확히 4장 캡처.
- [OBS-3] VLM 3-call median 점수 | Verification: Integration test — 동일 이미지 ±15점 재현성.
- [OBS-4] Zone 별 VLM 프롬프트 (kitchen / living_room / generic) | Verification: 6-tier calibration (15-point intervals) 통과.

**Plan (분배)**
- [PLAN-1] threshold ≥ 50 일 때 plan trigger | Verification: 점수 49/50 경계 테스트.
- [PLAN-2] 7-day rolling points 자동 재배분 | Verification: 시뮬 데이터로 낮은 누적 사용자에게 높은 점수 zone 배정 확인.
- [PLAN-3] Deferred task 우선 | Verification: deferred 큐 우선 평가.

**Buttons (협상)**
- [BTN-1~6] Agree / Exchange / Defer / Survival Mode 버튼 | Verification: discord.ui.View 응답 + DB 트랜잭션 통합 테스트.

**Completion**
- [COMP-1] Done ping + on-demand verification | Verification: VLM 재호출 → 점수 변화 로깅.
- [COMP-2] 자정 패널티 -30 | Verification: 미완료 시 ledger 에 `-30` 항목.

**Dashboard / System**
- [DASH-1] 일요일 21:00 주간 요약 | Verification: 스케줄러 단위 테스트.
- [SYS-1~4] Soft restart, full reset, crash recovery, startup sequence | Verification: kill -9 후 재시작 시 미완료 plan 복구.

# Risks & Unknowns
- VLM 정확도 ±15점 미만으로 떨어지면 자동 분배가 무의미해짐 — fallback: 라운드로빈.
- Discord rate limit (5 msg/5s/channel) — 다수 ping 시 backoff 필요.
- macOS 카메라 권한 prompt 가 startup 을 blocking 할 가능성.
- DASHSCOPE 키 부재 시 TTS 비활성화 모드로 graceful fallback.

# Verification Commands
```bash
# 자동
pytest -v
python -m houseops --health-check

# 카테고리별 smoke
pytest tests/test_observation.py
pytest tests/test_plan.py
pytest tests/test_buttons.py

# 수동 (private Discord server)
# 1. python -m houseops 시작
# 2. 봇이 #houseops 채널에 join 메시지 전송 확인
# 3. 카메라 연결 + /snapshot 슬래시 명령 → 점수 출력
# 4. 가짜 dirty 이미지 → plan trigger → 버튼 응답 → ledger 기록 확인
```

---

## 동결형의 핵심 운영 룰

1. **충분히 깎기 전엔 ralph 를 시작하지 않는다.** Socratic 인터뷰 (또는 동등한 자문) 로 ambiguity 를 사전에 제거.
   - 휴리스틱: 스펙을 다른 사람에게 보여주고 "이거 보고 같은 결과 만들 수 있겠어?" 라고 물었을 때 "네, 어디부터 시작하면 되나요?" 가 즉시 나오면 OK.
2. **Acceptance criteria 는 카테고리 prefix** ([OBS-], [PLAN-], [BTN-], …) 로 그룹화. 누락 영역을 시각적으로 감지.
3. **AC 한 줄 포맷**: `[ID-N] 본문 | Verification: <명령 또는 절차>`. Verification 이 비어 있으면 ralph 시작 거부.
4. **Exit conditions 명시**: 어떤 상태가 "끝" 인지 코드 한 줄 수준으로 정의 (예: 모든 SC `passes: true`).
5. 스펙이 동결되면 **사람은 코드를 안 본다.** ralph 가 끝났다고 보고할 때까지 기다린다.
