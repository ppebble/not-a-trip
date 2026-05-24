# Implementation Plan: Specs 41-44 Foundation

## Overview
- Specs 41~44 are too large to land safely in one pass.
- This plan narrows the first execution slice to shared operational foundations that unblock later work:
  - **Spec 43 / Observability & Ops Tools**
  - **Spec 44 / Deployment Readiness**
- The first implementation pass intentionally avoids the large storage migration and anti-abuse systems until the operational baseline is in place.

## Scope split

### Phase 1 - implement now
- [x] 1. Add application health endpoint (`43 - Requirement 6`)
- [x] 2. Add environment readiness validator (`44 - Requirement 7`)
- [x] 3. Persist session/workflow handoff docs for future Codex sessions
- [x] 4. Verify targeted tests and type safety

### Phase 2 - next recommended slice
- [ ] 5. Add upload/storage abstraction groundwork for R2 migration (`41 - Requirements 1, 5, 8`)
- [ ] 6. Add authenticated upload guards and quota/fingerprint model skeleton (`41 - Requirement 4`, `42 - Requirement 4`)
- [x] 7. Add audit log model and admin action logging hooks (`43 - Requirement 2`)

### Phase 3 - later
- [ ] 8. Add full image conversion + thumbnail pipeline (`41 - Requirements 2, 3, 6`)
- [ ] 9. Add storage migration tooling for legacy uploads (`41 - Requirement 7`)
- [ ] 10. Add API rate limiting, spam guard, input sanitization (`42 - Requirements 1, 2, 6`)
- [ ] 11. Add alerting, ops dashboard, backup/migration runbook (`43 - Requirements 1, 3, 4, 5`)
- [ ] 12. Add broader deployment validators for images, PWA, SEO, performance, error pages (`44 - Requirements 1-6, 8`)

## Detailed tasks

- [x] 1. Add GET `/api/health`
  - Return JSON with:
    - overall status
    - MongoDB status
    - response time in milliseconds
    - server timestamp
    - application version
  - Return HTTP `200` when DB check succeeds
  - Return HTTP `503` when DB check fails
  - Keep the response unauthenticated
  - _Requirements: 43.6.1, 43.6.2, 43.6.3, 43.6.4, 43.6.5, 43.6.7_

- [x] 2. Add env readiness validator
  - Centralize production-readiness checks for:
    - `MONGODB_URI`
    - `NEXTAUTH_URL`
    - `NEXTAUTH_SECRET`
    - optional OAuth provider pairs
    - optional Sentry group completeness
  - Report hard errors vs warnings separately
  - Flag placeholder/weak secrets
  - Enforce `mongodb://` or `mongodb+srv://`
  - Enforce `https://` for `NEXTAUTH_URL` in production mode
  - _Requirements: 44.7.1, 44.7.2, 44.7.3, 44.7.5, 44.7.6, 44.7.7_

- [x] 3. Add regression tests
  - Route tests for `/api/health`
  - Unit tests for env readiness validation

- [x] 4. Verification checkpoint
  - Run targeted Jest suites for new behavior
  - Run `npm run type-check`
  - Note any pre-existing unrelated red tests separately

## Notes
- This plan is the file future sessions should read first when continuing specs 41~44 work.
- If scope changes, update this file before implementing the next slice.
- 2026-05-24 Phase 1 completion evidence:
  - `npm test -- --runInBand src/app/api/health/__tests__/route.test.ts src/lib/env-check.test.ts`
  - `npm run type-check`
  - Full `npm test -- --runInBand` still has pre-existing unrelated map test failures in:
    - `src/components/map/__tests__/SpotPin.bug.test.tsx`
    - `src/components/map/__tests__/SpotPin.preservation.test.tsx`
    - `src/components/map/__tests__/spot-pin-coordinates.test.tsx`
    - `src/components/map/__tests__/PilgrimageMap.bug.test.tsx`
    - `src/components/map/__tests__/PilgrimageMap.preservation.test.tsx`
- 2026-05-24 Phase 2 partial completion:
  - added `audit_logs` collection groundwork
  - added `src/lib/audit-log.ts`
  - added `GET /api/admin/audit-logs`
  - attached non-blocking audit writes to:
    - `PUT /api/admin/reports/[id]/review`
    - `PUT /api/admin/status-reports/[id]/review`
    - `PUT /api/admin/spots/[id]/lifecycle`
  - verification:
    - `npm test -- src/lib/audit-log.test.ts src/app/api/admin/audit-logs/__tests__/route.test.ts src/app/api/health/__tests__/route.test.ts src/lib/env-check.test.ts`
    - `npm run type-check`
