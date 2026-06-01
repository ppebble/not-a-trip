# Spec 55 — Check-in Social Interactions Tasks

## Implementation

- [x] Inventory legacy `/community/*` references before changing profile/community behavior.
- [x] Add isolated check-in like persistence that does not reuse scene likes.
- [x] Add check-in like status/toggle API returning `liked` and `likeCount`.
- [x] Add isolated check-in comment persistence that does not overwrite `checkIn.comment` caption.
- [x] Add check-in comment list/create/delete API contracts.
- [x] Add like and comment controls to `CheckInDetailModal` with accessible states.
- [x] Keep gallery/modal counts consistent after successful interactions.

## Verification

- [x] Add targeted CheckIn like API tests.
- [x] Add targeted CheckIn comment API tests.
- [x] Add targeted CheckIn detail modal interaction tests.
- [x] Run targeted Jest tests.
- [x] Run `npm run type-check`.
- [x] Run `npm run lint` and record warning status.
- [x] Inventory `/community` references to prove no new public navigation entry was added.
