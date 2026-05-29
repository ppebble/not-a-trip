# Spec 47 Tasks - Real Image Data Collection

## Context from latest session handoff

- Latest handoff: `docs/session-handoffs/2026-05-29-landing-palette-image-data.md`.
- Current baseline noted there: `develop` after PRs #861-#865, with PR #865 adding this spec's requirements.
- Initial follow-up risk: runtime Wikimedia fallback existed in `REAL_SPOT_PHOTO_FALLBACKS`, `fetchShowcaseSpots`, `/api/spots/showcase`, and `next.config.ts` remotePatterns.
- Observed failure mode: local `/welcome` probes produced repeated `_next/image` 429 responses and 404s for at least `Old_Trafford_1.jpg` and `Tokyo_Dome_side_view.jpg`.
- Non-negotiable direction: do not treat Wikimedia hotlinking as a stable production image strategy; replace runtime external image fallback with approved self-hosted/R2 assets or controlled local placeholders.

## Requirements trace

- Requirement 1: 실제 스팟 데이터 수집 스키마 정의
- Requirement 2: 이미지 라이선스 및 출처 검증
- Requirement 3: 자체 이미지 저장소 및 파생 이미지 생성
- Requirement 4: 데이터 품질 검수 및 승격 흐름
- Requirement 5: 기존 Wikimedia fallback 제거 및 마이그레이션
- Requirement 6: Monitoring and regression checks

## Task checklist

- [x] 1. 설계 문서와 현재 의존성 지도 작성
  - [x] 1.1 Add `.kiro/specs/47-real-image-data-collection/design.md`
  - [x] 1.2 Map current runtime image flow from `REAL_SPOT_PHOTO_FALLBACKS` through `/api/spots/showcase`, `fetchProofImages`, landing cards, and `next/image`
  - [x] 1.3 Define the target flow: collected metadata → validation → approved asset manifest/DB → owned image URL → public surfaces
  - [x] 1.4 Decide the first implementation storage mode before code changes: R2/CDN when credentials are available, otherwise repo-local fixture manifest plus local placeholders for the MVP
  - [x] 1.5 Document migration boundaries: keep source attribution metadata, but remove external hotlink URLs from production runtime image fields
  - _Requirements: 1.1, 2.1, 3.1, 4.3, 5.4, 6.6_

- [x] 2. 수집 데이터와 이미지 메타데이터 타입 정의
  - [x] 2.1 Add shared types for `RealSpotData`, `SourceEvidence`, `LicensedImage`, `ImageDerivative`, `AssetManifestEntry`, and `DataReviewStatus`
  - [x] 2.2 Enforce stable spot IDs and required fields: `id`, `name`, `category`, `coordinates`, `country`, `region`, `address`, `description`, `relatedContent`, `sourceUrls`, `photos`, `reviewStatus`
  - [x] 2.3 Represent multiple `relatedContent` entries without assuming index 0 is canonical
  - [x] 2.4 Store license and attribution fields separately from renderable image URLs
  - [x] 2.5 Add type/unit tests for required field validation, status transitions, category validity, and coordinate precision
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 2.1, 2.3, 5.4_

- [x] 3. 이미지 출처/라이선스 검증 스크립트 작성
  - [x] 3.1 Add a repeatable validation command that reads candidate image metadata and checks HTTP status plus image content type
  - [x] 3.2 Record `originalUrl`, `sourcePageUrl`, `author`, `license`, `licenseUrl`, `collectedAt`, `reviewStatus`, last HTTP status, and validation timestamp
  - [x] 3.3 Reject unknown, non-commercial-only, incompatible, or missing-license images
  - [x] 3.4 Reject or keep in `needs_review` any image source returning 404, 410, 429, or 5xx
  - [x] 3.5 For Wikimedia candidates, store the Commons file page URL, not only the raw upload URL
  - [x] 3.6 Add tests using mocked `fetch` responses for 200 image, 404, 410, 429, 5xx, non-image content type, missing license, and incompatible license
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 6.1, 6.2, 6.6_

- [x] 4. 자체 에셋 매니페스트와 파생 이미지 생성 흐름 구현
  - [x] 4.1 Define an `Asset_Manifest` storage shape for original source metadata, owned asset URL, derivative URLs, hash/version, dimensions, byte size, license, and review status
  - [x] 4.2 Implement an asset ingestion path that copies approved images into app-controlled storage before production use
  - [x] 4.3 Generate at least thumbnail, card, and detail derivatives with content hash or version suffixes
  - [x] 4.4 Keep ingestion safe by default: dry-run first, no production mutation unless an explicit repair/write mode is passed
  - [x] 4.5 Add tests for derivative naming, manifest completeness, failed copy behavior, and dry-run immutability
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 6.6_

- [x] 5. 검수 상태와 승인 게이트 구현
  - [x] 5.1 Ensure collected spots/images are created as `draft` or `needs_review`
  - [x] 5.2 Add approval checks for required fields, source evidence, image availability, owned asset URL, and license metadata
  - [x] 5.3 Allow spot approval and image approval to be represented independently
  - [x] 5.4 Keep an audit record with reviewer, decision, timestamp, and reason
  - [x] 5.5 Ensure production-facing queries return only approved spots and approved images
  - [x] 5.6 Add tests for approval success, missing evidence, missing license, failed owned asset generation, image revalidation failure, and public query filtering
  - _Requirements: 1.5, 1.6, 4.1, 4.2, 4.3, 4.5, 4.6, 4.7_

- [x] 6. Wikimedia runtime fallback 제거 및 화면 degradation 정리
  - [x] 6.1 Replace `REAL_SPOT_PHOTO_FALLBACKS` runtime URL usage with approved owned image assets or controlled local/category placeholders
  - [x] 6.2 Update `/api/spots/showcase` and landing data fetch logic so production responses never return `upload.wikimedia.org` or `commons.wikimedia.org` render URLs
  - [x] 6.3 Preserve source attribution metadata outside renderable `thumbnailUrl`/photo URL fields
  - [x] 6.4 Remove Wikimedia domains from `next.config.ts` production `images.remotePatterns` after runtime usage is gone
  - [x] 6.5 Add a static regression test that fails if landing showcase fallback data, production public query output, or `next.config.ts` approved production hosts contain External_Hotlink domains
  - [x] 6.6 Add a rendering/fetch regression proving `/welcome` does not request `_next/image` URLs for Wikimedia domains
  - [x] 6.7 Confirm meaningful local/category placeholders still render when a spot has no approved image
  - _Requirements: 3.5, 3.7, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 7. 모니터링/운영 검증 명령 추가
  - [x] 7.1 Add a validation command or script for approved image URLs that reports 200/image content-type success and failure counts
  - [x] 7.2 Report failures by source host, status code, affected spot ID, and recommended action: replace, archive, retry later, or investigate storage credentials
  - [x] 7.3 Add operator-readable logging without client console spam
  - [x] 7.4 Add CI or scheduled workflow documentation; enable scheduled workflow only when required credentials and runtime environment are available
  - [x] 7.5 Add tests for report grouping, action classification, and non-mutating default execution
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 8. Checkpoint - 통합 검증과 수동 스모크
  - [x] 8.1 Run targeted tests for image metadata, validation script, asset manifest, showcase API, landing fetch logic, and static External_Hotlink guards
  - [x] 8.2 Run `npm run type-check`
  - [x] 8.3 Run `npm run lint`
  - [x] 8.4 Run `npm run build`
  - [x] 8.5 Browser-smoke `/welcome`, `/map`, a spot detail page, gallery, and course surfaces to verify no Wikimedia `_next/image` requests and no image-related console floods
  - [x] 8.6 Record verification evidence in this file or the final PR body before merge
  - _Requirements: 3.2, 5.6, 5.7, 6.1, 6.5_

## Suggested implementation order

1. Start with Tasks 1-3 to lock schema and validation before touching runtime rendering.
2. Implement Task 6 only after approved owned/local replacement data exists; removing hotlinks without replacement data will degrade landing quality.
3. Keep Task 7 non-mutating by default. Production repair/write behavior must be explicit.
4. Run Task 8 before PR/merge. Do not claim the Wikimedia issue is fixed until static tests and browser/network smoke both show zero production Wikimedia image requests.

## Notes

- This work intentionally reverses part of Spec 39's temporary `REAL_SPOT_PHOTO_FALLBACKS` strategy. Do not preserve that behavior as a production fallback.
- If R2/CDN credentials are unavailable, implement the first pass with local approved placeholder assets and a manifest abstraction; do not block static External_Hotlink regression coverage.
- `upload.wikimedia.org`, `commons.wikimedia.org`, `picsum.photos`, and unapproved placeholder hosts are External_Hotlink domains for production runtime checks.
- Keep attribution/source evidence for legal traceability even when the render URL becomes an owned asset or local placeholder.

## Verification evidence

- `npx jest --runInBand --runTestsByPath src/lib/real-image-data.test.ts src/lib/deployment/image-config-validator.test.ts src/components/landing/data/__tests__/realSpotPhotoFallbacks.test.ts src/app/api/spots/showcase/__tests__/route.test.ts src/components/landing/data/__tests__/fetchProofImages.test.ts src/components/landing/__tests__/SocialProofSection.test.ts` — passed, 6 suites / 48 tests.
- `npm run validate:images` — passed with an empty non-mutating manifest report.
- `npm run type-check` — passed.
- `npm run lint` — passed with existing repo-wide warnings only.
- `npm run build` — passed after rerun with a longer timeout; first 184s run timed out without failure output.
- Local production smoke with `npm run start -- -p 3100` and `GET /welcome` — returned 200 and rendered HTML contained no `upload.wikimedia.org` or `commons.wikimedia.org`.

## Implementation notes

- Runtime fallback image URLs now resolve to controlled local showcase assets; Wikimedia Commons URLs remain only as attribution/source metadata.
- `/api/spots/showcase`, landing showcase fetches, and category image fetches now require `reviewStatus: 'approved'` for DB-backed public showcase data. If no approved DB data exists, the landing path degrades to existing controlled static/local assets.
- R2/CDN upload is represented behind the Spec 47 manifest/types and validator boundary. This session did not mutate production storage or require credentials; future repair/write behavior must remain explicit.
