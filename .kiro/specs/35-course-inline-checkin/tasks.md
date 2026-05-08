# Implementation Plan: 코스 인라인 체크인

## Overview

코스 진행 중 인증 시 페이지 이탈 없이 바텀시트에서 인증을 완료하고, 자동으로 다음 스팟으로 진행하는 기능을 구현한다. CourseProgressStore 확장 → API → 컴포넌트 → 통합 순서로 진행한다.

## Tasks

- [x] 1. CourseProgressStore 확장 (persist 미들웨어 + advanceToNextUnchecked + 배너 상태)
  - [x] 1.1 CourseProgressStore에 persist 미들웨어 추가
    - `zustand/middleware`의 `persist` + `createJSONStorage` 적용
    - `checkedSpotIds` Set ↔ Array 직렬화/역직렬화 구현
    - `startedAt` Date ↔ ISO string 변환 구현
    - localStorage key: `'course-progress'`
    - _Requirements: 3.5_

  - [x] 1.2 advanceToNextUnchecked 액션 구현
    - 현재 인덱스 이후부터 순환 탐색하여 다음 미인증 유효 스팟 찾기
    - 모든 스팟 인증 완료 시 인덱스 유지 (완주 상태)
    - `checkInSpot` 내부에서 자동 호출되도록 연결
    - _Requirements: 2.1, 2.3_

  - [x] 1.3 배너 관련 상태 및 액션 추가
    - `isBannerDismissed` 상태 추가
    - `dismissBanner()` / `showBanner()` 액션 추가
    - persist 대상에 `isBannerDismissed` 포함
    - _Requirements: 3.1, 3.4_

- [x] 2. InlineCheckInSheet 컴포넌트 구현
  - [x] 2.1 InlineCheckInSheet 기본 UI 구현
    - CSS `fixed` 포지셔닝 + backdrop (`bg-black/50`) 오버레이
    - 헤더에 스팟 이름 + 순서 번호 표시
    - 배경 클릭 또는 X 버튼으로 닫기
    - 인증 진행 중에는 닫기 비활성화 (isSubmitting 상태)
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 2.2 InlineCheckInSheet 내부에 QuickCheckIn 연결
    - QuickCheckIn 컴포넌트를 시트 내부에 렌더링
    - `onSuccess` 콜백에서 `onComplete(spotId)` 호출
    - 완료 애니메이션 표시 후 1.5초 딜레이 → `onClose()` 호출
    - 에러 발생 시 에러 메시지 + 재시도 옵션 표시
    - _Requirements: 1.3, 1.6, 2.2, 2.5_

- [x] 3. RouteDetailContent 수정 (handleCheckIn → InlineCheckInSheet 열기)
  - [x] 3.1 handleCheckIn 로직 변경
    - 기존 `router.push('/spots/${spotId}')` 제거
    - `inlineCheckIn` 상태 추가 (`spotId`, `spotName`, `spotIndex`)
    - GuidePanel의 "여기서 인증하기" 클릭 시 InlineCheckInSheet 열기
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 인증 완료 콜백 연결
    - `handleCheckInComplete`에서 `store.checkInSpot(spotId)` 호출
    - Store 내부에서 `advanceToNextUnchecked()` 자동 실행
    - 모든 유효 스팟 인증 완료 시 완주 상태 표시
    - _Requirements: 2.1, 2.3, 2.4_

- [x] 4. Checkpoint — 인라인 체크인 기본 플로우 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. CourseProgressBanner 컴포넌트 구현
  - [x] 5.1 CourseProgressBanner UI 구현
    - 하단 고정 플로팅 바 (z-30, bottom-safe)
    - 코스명 (truncate) + 진행률 % + "코스로 돌아가기" 버튼 + X 닫기 버튼
    - "코스로 돌아가기" 클릭 시 `/routes/{activeRouteId}`로 이동
    - X 클릭 시 `dismissBanner()` 호출 (코스 진행 상태 유지)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 5.2 Layout에 CourseProgressBanner 배치
    - `src/app/layout.tsx`의 `<Providers>` 내부에 배치
    - 표시 조건: `isNavigating === true` AND 현재 경로 ≠ `/routes/{activeRouteId}` AND `isBannerDismissed === false`
    - `usePathname()` 훅으로 현재 경로 판별
    - 코스 종료(endRoute) 시 즉시 사라짐
    - _Requirements: 3.1, 3.6_

- [x] 6. GET /api/spots/[id]/courses API 구현
  - [x] 6.1 API Route 생성
    - `src/app/api/spots/[id]/courses/route.ts` 생성
    - MongoDB 쿼리: `routes.find({ "spots.spotId": spotId, isPublic: true }, { _id: 1, name: 1 })`
    - 응답: `{ courses: Array<{ id: string; name: string }> }`
    - 에러 처리: spotId 유효성 검증, DB 에러 시 500 응답
    - _Requirements: 4.3_

- [x] 7. Gallery CheckIn Card 연결 강화 (스팟/작품/코스 칩)
  - [x] 7.1 CheckInDetailModal에 관련 정보 칩 추가
    - 스팟 이름 칩 + 스팟 상세 페이지 링크 (`/spots/{spotId}`)
    - 작품명 칩 + 작품 허브 페이지 링크 (relatedContent 존재 시)
    - "이 스팟이 포함된 코스" 섹션 + 코스 상세 페이지 링크 (`/routes/{routeId}`)
    - GET /api/spots/[id]/courses API 호출하여 코스 목록 표시
    - API 실패 시 칩 영역 숨김 (graceful degradation)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 8. Checkpoint — 전체 기능 통합 검증
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 9. Property-Based Tests 작성 (fast-check)
  - [ ]* 9.1 Property 1: 체크인 후 자동 진행 불변식 테스트
    - **Property 1: 체크인 후 자동 진행 불변식**
    - 임의의 코스 상태(N개 유효 스팟, 임의 체크인 부분집합)에서 checkInSpot + advanceToNextUnchecked 후 불변식 검증
    - checkedSpotIds에 해당 spotId 포함 확인
    - currentSpotIndex가 다음 미인증 유효 스팟을 가리키는지 확인
    - 모든 스팟 인증 시 인덱스 불변 확인
    - **Validates: Requirements 2.1, 2.3**

  - [ ]* 9.2 Property 2: 배너 표시 조건 정합성 테스트
    - **Property 2: 배너 표시 조건 정합성**
    - 임의의 pathname + store 상태 조합에서 shouldShowBanner 결과 검증
    - isNavigating=false → 항상 false
    - 코스 상세 페이지 경로 → 항상 false
    - isBannerDismissed=true → 항상 false
    - **Validates: Requirements 3.1**

  - [ ]* 9.3 Property 3: 코스 진행 상태 직렬화 라운드트립 테스트
    - **Property 3: 코스 진행 상태 직렬화 라운드트립**
    - 임의의 유효한 CourseProgressStore 상태 생성
    - serialize → deserialize 후 원본과 동등성 검증
    - Set ↔ Array, Date ↔ ISO string 변환 정확성 확인
    - **Validates: Requirements 3.5**

  - [ ]* 9.4 Property 4: 진행률 계산 정확성 테스트
    - **Property 4: 진행률 계산 정확성**
    - 임의의 spots 배열 + checkedSpotIds 조합에서 progress 계산
    - progress === (checkedAvailableCount / totalAvailableCount) * 100 검증
    - 유효 스팟 0개 시 progress === 0 확인
    - **Validates: Requirements 2.1, 3.2**

- [ ]* 10. 단위 테스트 작성
  - [ ]* 10.1 InlineCheckInSheet 단위 테스트
    - 시트 열기/닫기 동작 테스트
    - 배경 클릭 시 닫힘 테스트
    - 인증 진행 중 닫기 버튼 비활성화 테스트
    - 완료 애니메이션 후 1.5초 자동 닫힘 테스트 (타이머 mock)
    - _Requirements: 1.1, 1.2, 1.4, 2.2_

  - [ ]* 10.2 CourseProgressBanner 단위 테스트
    - 렌더링 조건 테스트 (isNavigating, pathname, isBannerDismissed)
    - "돌아가기" 버튼 클릭 시 올바른 경로 이동 테스트
    - X 버튼 클릭 시 dismissBanner 호출 테스트
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 10.3 Gallery 칩 렌더링 단위 테스트
    - 스팟/작품/코스 칩 렌더링 테스트
    - courses API 응답에 따른 칩 표시/숨김 테스트
    - API 실패 시 graceful degradation 테스트
    - _Requirements: 4.1, 4.2, 4.3, 4.6_

- [x] 11. Final Checkpoint — 통합 검증
  - Ensure all tests pass, ask the user if questions arise.
  - 인라인 체크인 → 자동 진행 → 배너 표시 → 갤러리 칩 전체 플로우 확인

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 각 Task는 specific Requirements를 참조하여 추적 가능
- Checkpoint에서 사용자가 직접 앱을 실행하여 기능 검증
- Property tests는 fast-check 라이브러리 사용 (프로젝트 기존 설정)
- Store → API → Components → Integration 순서로 점진적 구현
