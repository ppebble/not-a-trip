# Spec 46 Tasks - User Journey UX Hardening

## Requirements trace

- Requirement 1: 지도 탐색 전역 진입점 노출
- Requirement 2: 스팟 상세 복귀 경로 정확화
- Requirement 3: 갤러리 실제 통계와 실제 탭 컴포넌트 사용
- Requirement 4: 스팟 상세 제보 진입점 통합
- Requirement 5: 모바일 지도 필터 점유 면적 축소

## Task checklist

- [x] 1. 문서화
  - [x] 1.1 Add `.kiro/specs/46-user-journey-ux-hardening/requirements.md`
  - [x] 1.2 Add `.kiro/specs/46-user-journey-ux-hardening/tasks.md`

- [x] 2. 지도 탐색 전역 진입점 노출
  - [x] 2.1 Add `/map` item to desktop header navigation
  - [x] 2.2 Add `/map` item to mobile header navigation
  - [x] 2.3 Preserve existing navigation items
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3. 스팟 상세 복귀 경로 정확화
  - [x] 3.1 Change top `지도로 돌아가기` link from `/` to `/map`
  - [x] 3.2 Change spot detail error return CTA from `/` to `/map`
  - [x] 3.3 Change spot not-found return CTA from `/` to `/map`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 4. 갤러리 실제 통계와 실제 탭 컴포넌트 사용
  - [x] 4.1 Add React Query hook for `/api/checkins/stats`
  - [x] 4.2 Render `GalleryHeader` with actual stats/loading/error state
  - [x] 4.3 Replace placeholder tabs with `GalleryTabs`
  - [x] 4.4 Keep existing `GalleryContent` and floating check-in flow intact
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. 스팟 상세 제보 진입점 통합
  - [x] 5.1 Replace three separate report cards with one report hub card
  - [x] 5.2 Provide three clear report-type actions
  - [x] 5.3 Render existing forms inside the selected report hub panel
  - [x] 5.4 Keep login-required modal behavior and contributor list
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 6. 모바일 지도 필터 점유 면적 축소
  - [x] 6.1 Add mobile filter expand/collapse state
  - [x] 6.2 Show compact mobile `필터 열기/닫기` button
  - [x] 6.3 Keep desktop filter bar always visible
  - [x] 6.4 Preserve existing filter loading progress indicator
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Regression coverage and verification
  - [x] 7.1 Add/update focused tests for changed navigation/gallery behavior
  - [x] 7.2 Run targeted Jest suites
  - [x] 7.3 Run `npm run type-check`
  - [x] 7.4 Run `npm run build` if type-check and targeted tests pass


## Verification evidence

- `npx jest --runInBand --runTestsByPath src/lib/user-journey-ux.test.ts src/components/gallery/__tests__/GalleryContent.test.tsx` — passed, 2 suites / 7 tests.
- `npm run type-check` — passed.
- `npm run build` — passed. Existing repo-wide lint warnings remain; no build-blocking errors were introduced by this spec.
