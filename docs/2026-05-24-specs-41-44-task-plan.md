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
- [x] 5. Add upload/storage abstraction groundwork for R2 migration (`41 - Requirements 1, 5, 8`)
- [x] 6. Add authenticated upload guards and quota/fingerprint model skeleton (`41 - Requirement 4`, `42 - Requirement 4`)
- [x] 7. Add audit log model and admin action logging hooks (`43 - Requirement 2`)

### Phase 3 - later
- [x] 8. Add full image conversion + thumbnail pipeline (`41 - Requirements 2, 3, 6`)
- [x] 9. Add storage migration tooling for legacy uploads (`41 - Requirement 7`)
- [x] 10. Add API rate limiting, spam guard, input sanitization (`42 - Requirements 1, 2, 6`)
- [x] 11. Add alerting, ops dashboard, backup/migration runbook (`43 - Requirements 1, 3, 4, 5`)
- [x] 12. Add broader deployment validators for images, PWA, SEO, performance, error pages (`44 - Requirements 1-6, 8`)

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
- 2026-05-24 spec 41 upload/R2 checkpoint:
  - replaced local `public/uploads` persistence in `POST /api/upload` with authenticated R2 upload flow
  - added MIME + magic-byte validation for JPEG/PNG/GIF/WebP
  - raised server upload limit to 10MB and added per-user daily 50MB quota tracking in MongoDB (`upload_daily_usage`)
  - added WebP conversion for original uploads plus `pin` 64x64 and `card` 256x256 thumbnails
  - kept backward compatibility by still returning legacy `imageUrl` alias alongside `{ original, pin, card }`
  - added `replaceLegacyUploadPathWithCdnUrl()` utility for `/uploads/...` migration
  - added `scripts/migrate-local-uploads-to-r2.mjs` for legacy upload migration and spot photo rewriting
  - verification:
    - `npm test -- src/lib/upload/validation.test.ts src/lib/upload/quota.test.ts src/app/api/upload/__tests__/route.test.ts`
    - `npm run build`
    - `npm run type-check` (after `.next/types` regeneration)
- 2026-05-24 spec 42 checkpoint:
  - added shared security helpers under `src/lib/security/` for:
    - sliding-window rate limiting
    - security logging
    - input sanitization
    - spam guard thresholds
    - upload abuse fingerprinting/hourly limits
    - optional NSFW moderation handoff
    - login lockout tracking
  - applied API/IP throttling in `src/middleware.ts`
  - applied write throttles + spam guards to:
    - `POST /api/checkins`
    - `POST /api/posts`
    - `POST /api/posts/[id]/comments`
    - `POST /api/reports`
  - applied sanitization to:
    - register name/nickname
    - checkin comment
    - post title/content
    - comment content
    - report text and URL fields
  - hardened auth/session behavior:
    - credentials email normalization
    - failed-login lockout tracking
    - successful login security logging
    - 24h JWT/session max age
  - extended upload route with:
    - hourly upload limit
    - duplicate fingerprint reuse
    - NSFW moderation hook
    - fingerprint metadata persistence
  - verification:
    - `npm test -- src/lib/security/rate-limit.test.ts src/lib/security/input-sanitizer.test.ts`
    - `npm test -- src/app/api/upload/__tests__/route.test.ts`
    - `npm run type-check`
    - `npm run build`
- 2026-05-25 spec 43 checkpoint:
  - added `src/lib/ops/alerting.ts` with Slack/Discord webhook delivery, 3 retries, and repeated-error escalation tracking
  - added `POST /api/ops/sentry-alert` for Sentry webhook forwarding into configured alert channels
  - expanded admin dashboard summary with:
    - today DAU
    - today check-in count
    - tracked 24h 5xx ratio
    - today new users
    - today new spots
    - 7-day DAU trend
    - 7-day check-in trend
  - updated admin page UI to display the expanded operations metrics
  - added middleware-driven request metric ingestion via `/api/internal/ops/request`
  - added MongoDB operations tooling:
    - `scripts/backup-mongodb.mjs`
    - `scripts/restore-mongodb.mjs`
    - upgraded `scripts/run-migration.mjs` with dry-run/history support
    - `docs/2026-05-25-spec43-ops-runbook.md`
  - verification:
    - `npm test -- src/lib/ops/alerting.test.ts src/lib/security/rate-limit.test.ts src/lib/security/input-sanitizer.test.ts`
    - `npm run type-check`
    - `npm run build`
- 2026-05-25 spec 44 checkpoint:
  - added deployment-readiness validator suite under `src/lib/deployment/` for:
    - build/bundle analysis
    - image remotePatterns review
    - PWA cache/offline validation
    - SSR/CSR boundary analysis
    - SEO metadata/robots/sitemap validation
    - performance heuristics
    - error page validation
  - added regression coverage:
    - `src/lib/deployment/build-analyzer.test.ts`
    - `src/lib/deployment/error-page-validator.test.ts`
    - `src/lib/deployment/image-config-validator.test.ts`
    - `src/lib/deployment/performance-auditor.test.ts`
    - `src/lib/deployment/pwa-cache-validator.test.ts`
    - `src/lib/deployment/seo-validator.test.ts`
    - `src/lib/deployment/ssr-csr-boundary-checker.test.ts`
  - strengthened production UX/config:
    - added `src/app/not-found.tsx`
    - expanded `src/app/global-error.tsx` with Sentry URL context + home navigation
    - added canonical metadata to app shell + shared metadata helpers
    - cleaned `next.config.ts` export chain while preserving dynamic R2 image allowlisting
  - verification:
    - `npm test -- src/lib/deployment/build-analyzer.test.ts src/lib/deployment/error-page-validator.test.ts src/lib/deployment/image-config-validator.test.ts src/lib/deployment/performance-auditor.test.ts src/lib/deployment/pwa-cache-validator.test.ts src/lib/deployment/seo-validator.test.ts src/lib/deployment/ssr-csr-boundary-checker.test.ts`
    - `npm run type-check`
    - `npm run build`
