# 2026-05-26 .kiro specs audit

## Scope
- 기준: `.kiro/specs/*/tasks.md`
- 원칙: task 문서가 없으면 구현 대상으로 잡지 않고 번호만 기록
- 주의: 일부 오래된 task 문서는 후속 spec에서 경로/구조가 바뀌어 그대로는 현재 코드와 1:1 대응되지 않음

## Task 문서가 없는 spec
- 40-spot-quality-workflow
- 41-upload-storage-migration
- 42-security-abuse-prevention
- 43-observability-ops-tools
- 44-deployment-readiness
- checkin-detail-interaction

## 이번 턴에 검증/정리한 spec

### 38-checkin-content-progress
판정: **구현 완료, task 문서 stale 상태였음**

검증 근거:
- 구현 파일 존재
  - `src/lib/progress-utils.ts`
  - `src/app/api/checkins/route.ts`
  - `src/app/api/users/[id]/progress/route.ts`
- 테스트 통과
  - `__tests__/checkin-content-progress/progress-utils.property.test.ts`
  - `__tests__/checkin-content-progress/progress-api.unit.test.ts`
- `npm run type-check` 통과

조치:
- `.kiro/specs/38-checkin-content-progress/tasks.md` 체크 상태를 실제 구현도에 맞게 동기화

### 39-landing-social-proof-real-data
판정: **대부분 구현되어 있었으나 실제 누락 1건 존재 → 수정 완료**

실제 누락:
- `src/app/api/spots/showcase/helpers.ts`의 `resolveThumbnailUrl()`이
  `REAL_SPOT_PHOTO_FALLBACKS` 우선순위를 완전히 반영하지 못하고 있었음
- placeholder 외부 URL(`picsum`)과 `null` 입력에서 fallback 기대값과 불일치

수정:
- `src/app/api/spots/showcase/helpers.ts`
  - `null/undefined` 입력 시 fallback 우선 적용
  - placeholder 판정을 `http/https` 판정보다 먼저 수행
  - placeholder면 `REAL_SPOT_PHOTO_FALLBACKS` 사용, 없으면 `null`

검증 근거:
- 테스트 통과
  - `src/app/api/spots/showcase/__tests__/route.test.ts`
  - `src/components/landing/data/__tests__/fetchProofImages.test.ts`
  - `src/components/landing/__tests__/SocialProofSection.test.ts`
- `npm run type-check` 통과

조치:
- `.kiro/specs/39-landing-social-proof-real-data/tasks.md` 체크 상태를 실제 구현도에 맞게 동기화

### 21-pwa-setup
판정: **기능 구현은 존재, 일부 task 경로명은 현재 구조와 불일치**

현재 대응 구현:
- `src/components/pwa/SerwistRegistration.tsx`
- `src/components/pwa/InstallPromptListener.tsx`
- `src/components/pwa/InstallBottomSheet.tsx`
- `src/components/pwa/InstallToast.tsx`
- `src/components/pwa/IosPwaGuide.tsx`
- `src/app/offline/page.tsx`
- `src/stores/pwaStore.ts`
- `src/lib/deployment/pwa-cache-validator.test.ts`
- `src/lib/__tests__/ios-safari-detection.test.ts`

메모:
- task 문서의 `src/components/mobile/IosPwaPrompt.tsx`, `ServiceWorkerRegistrar.tsx`, `public/offline.html`는 현재 구조에선 제거/대체됨

### 22-landing-page / 23-landing-page-polish
판정: **초기 Globe 기반 task 중 일부는 후속 spec 32에 의해 superseded**

근거:
- spec 32 task에 `Globe3D.tsx`, `GlobeFallback2D.tsx`, `data/globeData.ts` 삭제가 명시됨
- 현재 Hero는 floating cards 기반 구현으로 전환됨

메모:
- 22/23의 일부 미체크 항목은 “현재도 미구현”이 아니라 “후속 spec에서 대체/삭제됨”으로 봐야 함

### 35-course-inline-checkin
판정: **핵심 기능 구현 존재, 남은 항목은 주로 테스트**

현재 대응 구현:
- `src/components/course/CourseProgressBanner.tsx`
- `src/components/route/InlineCheckInSheet.tsx`
- `src/components/app/AppChromeDeferred.tsx`에서 배너 로드

메모:
- task 문서의 일부 경로명과 현재 파일 위치가 다름 (`course` → `route` 분리)

### 37-profile-user-info / 45-profile-complete
판정: **핵심 기능 구현 존재, 미체크 대부분 optional property test**

현재 대응 구현 예시:
- `src/app/api/users/[id]/route.ts`
- `src/app/profile/[id]/page.tsx`
- `src/components/profile/ProfileHeader.tsx`
- `src/components/profile/SectionNavigation.tsx`
- 다수 section 컴포넌트 및 user query hook

메모:
- 현재 미체크는 대체로 `*` optional property test 성격

## 현재 실제 추가 구현/판단이 필요한 항목

### 20-mascot-design-system
이슈 성격: **일부는 코드 누락이라기보다 결정/의존성 보류**

이미 문서화된 보류:
- `docs/2026-05-22-task20-followups.md`
- `docs/2026-05-22-task20-mascot-followup.md`

남은 포인트:
- 9.x 팔레트 최종 확정: 제품/디자인 결정 필요
- 11.x Lottie 전용 로더: 새 dependency 결정 필요
- 12.3 current location marker 자산화: 실제 렌더 지점 특정 필요

## 정리
- 이번 턴 기준 확정된 실제 수정 사항은 **spec 39 showcase fallback 로직 누락 보완**
- spec 38, 39는 **task 문서 stale** 문제까지 정리함
- task 문서가 없는 spec은 이번 구현 범위에서 제외하고 번호를 기록함
- 남은 큰 덩어리는
  1. task 문서 stale/superseded 정리
  2. optional property test 보강
  3. 외부 결정이 필요한 spec 20 / task 미작성 spec 40~44 계열
