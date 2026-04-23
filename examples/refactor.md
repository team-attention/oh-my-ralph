# Task
`src/` 의 결제 모듈을 PayPal → Stripe 로 교체한다.

# Context
- Express + TypeScript
- Stripe secret key 는 `.env` 의 `STRIPE_SECRET_KEY`
- 기존 엔드포인트 경로와 응답 스키마는 유지해야 함 (API consumer 가 있음)

# Constraints
- 기존 통합 테스트가 계속 통과해야 함
- PayPal SDK 는 package.json 에서 제거
- 마이그레이션 코드는 단일 커밋으로 롤백 가능해야 함

# Success Criteria
- `npm test` 전체 통과
- 수동 checkout flow: 카드 → 결제 성공 → webhook 수신까지 동작
- `grep -r paypal src/` 결과 0건
