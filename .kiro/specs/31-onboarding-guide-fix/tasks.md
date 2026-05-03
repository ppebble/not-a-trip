# 구현 계획: 온보딩 가이드 버그픽스

## 개요

온보딩 가이드 투어의 두 가지 버그를 수정한다:
1. **코스 상세페이지 가이드 미동작** — `RouteDetailContent.tsx`에 OnboardingTour 미연동
2. **가이드 표시 로직 반전** — "최초 1회 표시" → "매번 표시 + 다시 보지 않기" 방식으로 변경

수정 순서: useOnboarding 훅 로직 반전 → OnboardingTour "다시 보지 않기" 버튼 추가 → tour-config 코스 상세 스텝 추가 → RouteDetailContent 연동 → Header 키 변경 → 기존 페이지 onDismiss prop 추가

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** — 온보딩 가이드 표시 로직 버그
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: 두 가지 버그 조건을 구체적 케이스로 검증
  - `__tests__/onboarding-guide-fix/bug-condition.property.test.ts` 신규 생성
  - Bug 1: `useOnboarding` 훅에서 `skip()` 호출 후 재마운트 시 `isActive`가 `true`여야 하지만 현재 `false` 반환 확인 (localStorage에 completed=true 저장되어 재방문 시 가이드 미표시)
  - Bug 2: `useOnboarding` 훅에서 마지막 스텝 `next()` 호출 후 재마운트 시 `isActive`가 `true`여야 하지만 현재 `false` 반환 확인
  - 테스트 assertions: dismissed 상태가 아닌 경우 매번 `isActive=true` 반환해야 함 (Expected Behavior Properties from design)
  - fast-check 사용, 태그: `Feature: 31-onboarding-guide-fix, Property 1: Bug Condition`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.2, 1.3, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** — findNextValidStep 동작 및 기존 동작 보존
  - **IMPORTANT**: Follow observation-first methodology
  - `__tests__/onboarding-guide-fix/preservation.property.test.ts` 신규 생성
  - Observe: `findNextValidStep` 함수가 DOM 미존재 스텝을 건너뛰고 유효한 스텝 인덱스 반환하는 현재 동작 확인
  - Observe: 유효한 스텝이 없으면 -1 반환하는 현재 동작 확인
  - Observe: Escape 키 입력 시 `onSkip` 호출되는 현재 동작 확인
  - Write property-based test: 임의의 TourStep 배열과 fromIndex에 대해 `findNextValidStep`이 fromIndex 이상의 유효한 인덱스 또는 -1 반환 검증
  - Write property-based test: 반환된 인덱스가 -1이 아닌 경우 해당 스텝의 target이 DOM에 존재하는지 검증
  - fast-check 사용, 태그: `Feature: 31-onboarding-guide-fix, Property 2: Preservation`
  - Verify test passes on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.2, 3.5, 3.6_

- [x] 3. Fix for 온보딩 가이드 버그

  - [x] 3.1 useOnboarding 훅 localStorage 로직 반전
    - `src/hooks/useOnboarding.ts` 수정
    - localStorage 키 변경: `not-a-trip-onboarding-completed` → `not-a-trip-onboarding-dismissed`
    - `getStoredCompletion()` → `getStoredDismissed()` 함수명 변경 — dismissed=true이면 가이드 숨김
    - `setStoredCompletion()` → `setStoredDismissed()` 함수명 변경
    - 초기화 로직 반전: dismissed가 `true`일 때만 투어 비활성화, 그 외에는 매번 활성화
    - `skip()` 및 마지막 스텝 `next()` 에서 localStorage 저장 제거 — 단순히 `isActive=false`만 설정
    - `dismiss()` 콜백 추가: localStorage에 dismissed=true 저장 + isActive=false
    - `UseOnboardingReturn` 인터페이스에 `dismiss: () => void` 추가
    - `reset()` 함수 수정: `setStoredDismissed(false)` 호출로 dismissed 상태 초기화
    - 모든 스텝 대상 요소 미존재 시 `setStoredDismissed(true)` 호출 제거 — 단순히 `isActive=false`만 설정
    - _Bug_Condition: isBugCondition(input) where input.dismissed ≠ true → 매번 표시되어야 함_
    - _Expected_Behavior: dismissed=false일 때 isActive=true, dismissed=true일 때 isActive=false_
    - _Preservation: findNextValidStep 로직 변경 없음, localStorage 접근 실패 시 매번 표시_
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 2.4, 3.3_

  - [x] 3.2 OnboardingTour 컴포넌트에 "다시 보지 않기" 버튼 추가
    - `src/components/common/OnboardingTour.tsx` 수정
    - Props 인터페이스에 `onDismiss?: () => void` 추가 (optional로 하위 호환성 유지)
    - 툴팁 하단 "건너뛰기" 버튼 옆에 "다시 보지 않기" 버튼 렌더링
    - `onDismiss` prop이 없으면 "다시 보지 않기" 버튼 숨김
    - 기존 "건너뛰기", "다음"/"완료" 버튼은 그대로 유지
    - _Requirements: 1.5, 2.4, 2.5_

  - [x] 3.3 tour-config에 ROUTE_DETAIL_STEPS 추가
    - `src/lib/tour-config.ts` 수정
    - `ROUTE_DETAIL_STEPS` 배열 추가: 코스 상세페이지용 투어 스텝 정의
    - 스텝 1: 코스 지도 영역 안내 (`[data-tour="route-map"]`)
    - 스텝 2: 코스 시작 버튼 안내 (`[data-tour="start-route-btn"]`)
    - 스텝 3: 코스 순서 목록 안내 (`[data-tour="route-spots"]`)
    - _Requirements: 1.1, 2.1_

  - [x] 3.4 RouteDetailContent에 OnboardingTour 연동
    - `src/components/route/RouteDetailContent.tsx` 수정
    - `OnboardingTour`, `useOnboarding`, `ROUTE_DETAIL_STEPS` import 추가
    - `useOnboarding(ROUTE_DETAIL_STEPS)` 훅 호출 — isActive, currentStep, next, skip, dismiss 추출
    - JSX 하단에 `<OnboardingTour>` 컴포넌트 렌더링 (onDismiss={dismiss} prop 포함)
    - 가이드 대상 요소에 `data-tour` 속성 부여: 코스 지도 영역, 코스 시작 버튼, 코스 순서 목록
    - _Requirements: 1.1, 2.1_

  - [x] 3.5 Header localStorage 키 변경
    - `src/components/layout/Header.tsx` 수정
    - `handleResetTour` 함수에서 `localStorage.removeItem('not-a-trip-onboarding-completed')` → `localStorage.removeItem('not-a-trip-onboarding-dismissed')` 변경
    - _Requirements: 3.1_

  - [x] 3.6 기존 페이지 OnboardingTour에 onDismiss prop 추가
    - `src/app/(main)/map/page.tsx` 수정: `useOnboarding` 반환값에서 `dismiss` 추출, `OnboardingTour`에 `onDismiss={dismiss}` prop 추가
    - `src/app/routes/page.tsx` 수정: 동일하게 `dismiss` 추출 및 `onDismiss={dismiss}` prop 추가
    - `src/app/gallery/page.tsx` 수정: 동일하게 `dismiss` 추출 및 `onDismiss={dismiss}` prop 추가
    - _Requirements: 2.4, 2.5, 3.4_

  - [x] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** — 온보딩 가이드 표시 로직 수정 확인
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** — findNextValidStep 동작 보존 확인
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint — 전체 테스트 통과 및 기능 검증
  - Ensure all tests pass, ask the user if questions arise.
  - 코스 상세페이지에서 온보딩 가이드 표시 확인
  - 가이드 "건너뛰기" 후 재방문 시 가이드 재표시 확인
  - "다시 보지 않기" 클릭 후 재방문 시 가이드 미표시 확인
  - Header "가이드 다시 보기" 클릭 후 가이드 재표시 확인
  - 지도/코스 목록/갤러리 페이지에서 새 로직으로 가이드 정상 동작 확인

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 Requirements를 참조하여 추적 가능
- 체크포인트에서 사용자가 직접 앱을 실행하여 기능 테스트
- 속성 테스트는 설계 문서의 Correctness Properties를 검증
- 파일 경로에 괄호가 포함된 경우 (`src/app/(main)/map/page.tsx`) 쉘 명령어에서 반드시 따옴표로 감싸야 함
