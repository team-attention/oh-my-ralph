# Task
`src/` 의 결제 모듈을 PayPal → Stripe 로 교체한다.

# Context
- **Stack:** Express + TypeScript
- **Entrypoint / 핵심 파일:** `src/payments/`, `src/routes/checkout.ts`
- **Run / Test 명령:** `npm test`, 로컬 실행은 `npm run dev`
- **Domain notes:** Stripe secret key 는 `.env` 의 `STRIPE_SECRET_KEY`. 기존 엔드포인트 경로/응답 스키마는 외부 consumer 가 사용 중이므로 유지 필수.

# Constraints
- 기존 통합 테스트가 계속 통과해야 함.
- `package.json` 에서 PayPal SDK(`@paypal/*`) 를 완전히 제거한다.
- 마이그레이션은 단일 커밋으로 롤백 가능해야 한다.

# Success Criteria
- [SC-1] 결제 API 응답 스키마 호환 | Verification: 기존 contract test (`npm run test:contract`) 그린.
- [SC-2] PayPal 코드/디펜던시 제거 | Verification: `grep -ri paypal src/ package.json` 결과 0건.
- [SC-3] 카드 결제 + webhook 수신 동작 | Verification: 수동 — Stripe test 카드 4242…로 checkout → webhook 콘솔 로그에 `payment_intent.succeeded` 확인.

# Risks & Unknowns
- Webhook 시그니처 검증 (`STRIPE_WEBHOOK_SECRET`) 누락 시 prod 에서 401 무한 루프.
- PayPal 의 비동기 환불 흐름과 Stripe 의 동기 환불 차이 — 환불 엔드포인트는 별도 검토 필요.
- 멱등키(idempotency-key) 헤더 처리: PayPal 엔 없었지만 Stripe 권장.

# Verification Commands
```bash
npm test
npm run test:contract
grep -ri paypal src/ package.json
# 수동: Stripe test 카드 4242 4242 4242 4242 로 결제 → webhook 로그 확인
```
