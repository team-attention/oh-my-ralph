# Task
실패하는 테스트를 통과시킨다.

# Context
- `npm test` 실행 시 `src/utils/date.test.ts` 안의 케이스 2개가 실패 중
- 나머지 테스트는 녹색
- 최근 변경 이력은 `git log -- src/utils/date.ts` 에서 확인

# Constraints
- 테스트 파일은 수정하지 않는다 (구현만 고친다).
- 기존에 통과하던 테스트를 깨뜨리지 않는다.
- 코드 스타일은 biome 설정을 따른다.

# Success Criteria
- `npm test` 전체 통과
- `git diff` 가 실제 버그 원인에 한정됨 (불필요한 리팩토링 금지)
