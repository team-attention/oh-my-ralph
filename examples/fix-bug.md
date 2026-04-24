# Task
실패하는 테스트 2개를 통과시킨다 (테스트 파일은 건드리지 말고 구현만 고친다).

# Context
- **Stack:** TypeScript + Vitest (또는 Jest)
- **Entrypoint / 핵심 파일:** `src/utils/date.ts` (구현), `src/utils/date.test.ts` (테스트 — 수정 금지)
- **Run / Test 명령:** `npm test`
- **Domain notes:** 최근 변경 이력은 `git log -- src/utils/date.ts` 로 확인. 회귀일 가능성 우선 검토.

# Constraints
- 테스트 파일(`*.test.ts`)은 수정 금지 — 구현 코드만 고친다.
- 기존에 통과하던 테스트를 깨뜨리지 않는다.
- 코드 스타일은 `biome` 설정을 따른다.

# Success Criteria
- [SC-1] 실패하던 테스트 2개가 통과 | Verification: `npm test` 종료코드 0.
- [SC-2] 회귀 없음 (기존 통과 테스트 유지) | Verification: `npm test` 전체 그린.
- [SC-3] 변경 범위가 버그 원인에 한정됨 | Verification: `git diff --stat src/` 가 `date.ts` 외 파일을 거의 안 건드림.

# Risks & Unknowns
- 타임존/DST 관련 버그면 CI 환경의 TZ 설정도 확인 필요할 수 있음.
- 의도치 않게 `Date.now()` 모킹이 다른 테스트에 영향을 줄 가능성.

# Verification Commands
```bash
npm test
npm run lint
git diff --stat src/
```
