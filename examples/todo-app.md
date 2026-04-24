# Task
간단한 Todo 앱을 만든다. 추가 / 완료 / 삭제가 가능한 로컬 전용 웹 페이지.

# Context
- **Stack:** 단일 HTML + vanilla JS 선호 (외부 빌드 도구 없이도 OK). Node 20+ 환경 가능.
- **Entrypoint / 핵심 파일:** `index.html`
- **Run / Test 명령:** `npx serve .` 또는 브라우저에서 `index.html` 직접 오픈.
- **Domain notes:** 외부 API/DB 없음. 모든 상태는 `localStorage` 에 저장.

# Constraints
- 외부 API / DB / 서버 사용 금지.
- 접근성: 키보드만으로 모든 동작 (추가 · 완료 · 삭제) 가능해야 함.
- 디펜던시 0개를 우선 시도, 정 필요하면 1개까지.

# Success Criteria
- [SC-1] 새 항목을 추가/삭제할 수 있다 | Verification: 브라우저에서 항목 1개 추가 → 새로고침 → 유지 확인.
- [SC-2] 체크박스로 완료 표시가 동작한다 | Verification: 완료 토글 → CSS 로 visibly strike-through 또는 dim.
- [SC-3] 키보드만으로 모든 조작 가능 | Verification: Tab/Enter/Space 만 사용해 항목 추가·완료·삭제 시연.

# Risks & Unknowns
- localStorage 용량 한계(보통 5MB). MVP 에선 무시.
- 브라우저 호환성: 최신 Chrome/Safari 만 타깃.

# Verification Commands
```bash
# 정적 서빙
npx serve .
# (브라우저에서 직접 확인 — 자동 테스트 없음)
```
