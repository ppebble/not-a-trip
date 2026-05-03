# 온보딩 가이드 버그픽스 설계

## Overview

온보딩 가이드 투어에 두 가지 버그가 있다:

1. **코스 상세페이지 가이드 미동작**: `RouteDetailContent.tsx`에 `OnboardingTour` 컴포넌트가 연동되지 않아 코스 상세페이지에서 가이드가 표시되지 않는다.
2. **가이드 표시 로직 반전**: 현재 "최초 1회 표시 후 완료 저장" 방식을 "매번 표시 + 다시 보지 않기" 방식으로 변경해야 한다.

수정 범위는 최소화하며, `useOnboarding` 훅의 localStorage 로직 반전, `OnboardingTour` 컴포넌트에 "다시 보지 않기" 버튼 추가, `RouteDetailContent`에 투어 연동, `tour-config.ts`에 코스 상세 스텝 추가, `Header`의 초기화 키 변경으로 해결한다.

## Glossary

- **Bug_Condition (C)**: 온보딩 가이드가 올바르게 동작하지 않는 조건 — (1) 코스 상세페이지에서 가이드 미표시, (2) 가이드 표시 로직이 사용자 기대와 반대
- **Property (P)**: 올바른 동작 — (1) 코스 상세페이지에서 가이드 표시, (2) dismissed 상태가 아니면 매번 가이드 표시
- **Preservation**: 기존 동작 중 변경되지 않아야 하는 것 — DOM 미존재 스텝 건너뛰기, Escape 키 종료, 하이라이트 오버레이, localStorage 접근 실패 시 graceful degradation
- **useOnboarding**: `src/hooks/useOnboarding.ts`의 커스텀 훅. 온보딩 투어 상태(isActive, currentStep)를 관리하고 localStorage로 표시 여부를 결정
- **OnboardingTour**: `src/components/common/OnboardingTour.tsx`의 오버레이 컴포넌트. 대상 요소 하이라이트 + 툴팁 표시
- **dismissed**: 새로운 localStorage 상태. `true`이면 가이드를 영구적으로 숨김 (기존 `completed`의 반전 개념)

## Bug Details

### Bug Condition

버그는 두 가지 독립적인 조건에서 발생한다:

1. **코스 상세페이지 가이드 미연동**: `RouteDetailContent.tsx`에 `OnboardingTour` 컴포넌트와 `useOnboarding` 훅이 연동되지 않아, 코스 상세페이지 방문 시 가이드가 전혀 표시되지 않는다.

2. **가이드 표시 로직 반전**: `useOnboarding` 훅이 "completed가 아닐 때만 1회 표시" 로직을 사용하여, 최초 방문 후에는 가이드가 다시 표시되지 않는다. 사용자가 원하는 동작은 "dismissed가 아닌 한 매번 표시"이다.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { page: string, dismissed: boolean | null }
  OUTPUT: boolean

  // Bug 1: 코스 상세페이지에서 가이드 미표시
  IF input.page = "/routes/[id]" THEN
    RETURN true  // OnboardingTour 컴포넌트 자체가 없음
  END IF

  // Bug 2: 가이드 표시 로직 반전
  // 현재: completed=false일 때만 최초 1회 표시
  // 기대: dismissed=false일 때 매번 표시
  IF input.dismissed ≠ true THEN
    RETURN true  // 매번 표시되어야 하지만 최초 1회만 표시됨
  END IF

  RETURN false
END FUNCTION
```

### Examples

- **코스 상세페이지 방문** → 기대: 온보딩 가이드 표시 / 실제: 가이드 미표시 (OnboardingTour 미연동)
- **두 번째 페이지 방문 (dismissed 아님)** → 기대: 가이드 재표시 / 실제: localStorage에 completed=true 저장되어 가이드 미표시
- **"건너뛰기" 클릭 후 재방문** → 기대: 가이드 재표시 / 실제: completed=true로 가이드 영구 숨김
- **"다시 보지 않기" 클릭** → 기대: 이후 가이드 영구 숨김 / 실제: 해당 버튼 자체가 없음

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- DOM에 존재하지 않는 대상 요소의 스텝은 자동 건너뛰기 (`findNextValidStep` 로직 유지)
- Escape 키로 투어 종료 기능 유지
- 대상 요소 하이라이트 + 반투명 오버레이 표시 유지
- localStorage 접근 실패 시 가이드 매번 표시 (graceful degradation)
- 지도 페이지, 코스 목록 페이지, 갤러리 페이지의 OnboardingTour 연동 유지 (새 로직 적용)
- 툴팁 위치 계산 및 뷰포트 경계 체크 로직 유지

**Scope:**
OnboardingTour 컴포넌트의 하이라이트/툴팁 렌더링 로직, 키보드 이벤트 핸들링, 포커스 관리는 "다시 보지 않기" 버튼 추가 외에 변경하지 않는다. `findNextValidStep` 함수는 변경하지 않는다.

## Hypothesized Root Cause

### Bug 1: 코스 상세페이지 가이드 미연동

`RouteDetailContent.tsx`에 `OnboardingTour` 컴포넌트가 import/렌더링되지 않았고, `useOnboarding` 훅도 호출되지 않았다. 지도 페이지(`map/page.tsx`), 코스 목록 페이지(`routes/page.tsx`), 갤러리 페이지(`gallery/page.tsx`)에는 모두 연동되어 있으나, 코스 상세 콘텐츠 컴포넌트에는 누락되었다. 또한 `tour-config.ts`에 코스 상세페이지용 스텝(`ROUTE_DETAIL_STEPS`)이 정의되어 있지 않다.

### Bug 2: 가이드 표시 로직 반전

`useOnboarding` 훅의 설계 의도가 "최초 1회 표시"였기 때문에:
- localStorage 키가 `not-a-trip-onboarding-completed`로 "완료" 개념
- `getStoredCompletion()`이 `true`를 반환하면 투어를 시작하지 않음
- `skip()`, `next()`(마지막 스텝) 호출 시 `setStoredCompletion(true)`로 완료 저장
- 이 로직을 "dismissed" 개념으로 반전해야 함: dismissed가 아닌 한 매번 표시

## Correctness Properties

Property 1: Bug Condition - 온보딩 가이드 표시 로직

_For any_ input where dismissed 상태가 `true`가 아닌 경우 (localStorage에 dismissed 키가 없거나 `false`), `useOnboarding` 훅은 유효한 스텝이 존재할 때 `isActive=true`를 반환하여 가이드를 표시해야 한다 (SHALL). dismissed가 `true`인 경우 `isActive=false`를 반환해야 한다.

**Validates: Requirements 2.2, 2.3, 2.4**

Property 2: Preservation - findNextValidStep 동작 보존

_For any_ TourStep 배열과 fromIndex에 대해, 수정된 `findNextValidStep` 함수는 원본 함수와 동일한 결과를 반환해야 한다 (SHALL). DOM에 존재하지 않는 대상 요소의 스텝은 건너뛰고, 유효한 스텝이 없으면 -1을 반환하는 동작이 보존되어야 한다.

**Validates: Requirements 3.2**

Property 3: Bug Condition - skip/complete 시 localStorage 미저장

_For any_ `skip()` 또는 `complete()` 호출에 대해, 수정된 `useOnboarding` 훅은 localStorage에 dismissed 상태를 저장하지 않아야 한다 (SHALL). 이를 통해 다음 방문 시 가이드가 다시 표시된다.

**Validates: Requirements 2.3**

Property 4: Bug Condition - dismiss 시 localStorage 저장

_For any_ `dismiss()` 호출에 대해, 수정된 `useOnboarding` 훅은 localStorage에 dismissed=true를 저장하고 `isActive=false`로 전환해야 한다 (SHALL). 이후 페이지 방문 시 가이드가 표시되지 않는다.

**Validates: Requirements 2.4**

## Fix Implementation

### Changes Required

#### 1. `src/hooks/useOnboarding.ts` — localStorage 로직 반전

**변경 내용:**
1. **localStorage 키 변경**: `not-a-trip-onboarding-completed` → `not-a-trip-onboarding-dismissed`
2. **읽기 함수 변경**: `getStoredCompletion()` → `getStoredDismissed()` — dismissed=true이면 가이드 숨김
3. **쓰기 함수 변경**: `setStoredCompletion()` → `setStoredDismissed()` — dismissed 상태 저장
4. **초기화 로직 반전**: dismissed가 `true`일 때만 투어 비활성화, 그 외에는 매번 활성화
5. **skip/complete 로직 변경**: `skip()`과 마지막 스텝 `next()`에서 localStorage 저장 제거 — 단순히 `isActive=false`만 설정
6. **dismiss 함수 추가**: 새로운 `dismiss()` 콜백 — localStorage에 dismissed=true 저장 + isActive=false
7. **UseOnboardingReturn 인터페이스 확장**: `dismiss: () => void` 추가
8. **reset 함수 수정**: `setStoredDismissed(false)` 호출로 dismissed 상태 초기화

#### 2. `src/components/common/OnboardingTour.tsx` — "다시 보지 않기" 버튼 추가

**변경 내용:**
1. **Props 인터페이스 확장**: `onDismiss: () => void` 추가
2. **버튼 추가**: 툴팁 하단에 "다시 보지 않기" 버튼 렌더링 (건너뛰기 옆)
3. **기존 버튼 유지**: "건너뛰기", "다음"/"완료" 버튼은 그대로 유지

#### 3. `src/lib/tour-config.ts` — ROUTE_DETAIL_STEPS 추가

**변경 내용:**
1. **ROUTE_DETAIL_STEPS 배열 추가**: 코스 상세페이지용 투어 스텝 정의
   - 코스 지도 영역 안내
   - 코스 시작 버튼 안내
   - 코스 순서 목록 안내

#### 4. `src/components/route/RouteDetailContent.tsx` — OnboardingTour 연동

**변경 내용:**
1. **import 추가**: `OnboardingTour`, `useOnboarding`, `ROUTE_DETAIL_STEPS`
2. **훅 호출**: `useOnboarding(ROUTE_DETAIL_STEPS)` — isActive, currentStep, next, skip, dismiss 추출
3. **컴포넌트 렌더링**: JSX 하단에 `<OnboardingTour>` 추가
4. **data-tour 속성 추가**: 가이드 대상 요소에 `data-tour` 속성 부여

#### 5. `src/components/layout/Header.tsx` — localStorage 키 변경

**변경 내용:**
1. **handleResetTour 수정**: `localStorage.removeItem('not-a-trip-onboarding-completed')` → `localStorage.removeItem('not-a-trip-onboarding-dismissed')`

#### 6. 기존 페이지 OnboardingTour 연동 업데이트

**변경 내용:**
- `src/app/(main)/map/page.tsx`: `onDismiss` prop 추가
- `src/app/routes/page.tsx`: `onDismiss` prop 추가
- `src/app/gallery/page.tsx`: `onDismiss` prop 추가

각 페이지에서 `useOnboarding`의 반환값에 `dismiss`를 추가로 추출하고, `OnboardingTour`에 `onDismiss={dismiss}` prop을 전달한다.

## Testing Strategy

### Validation Approach

테스트 전략은 두 단계로 진행한다: (1) 수정 전 코드에서 버그를 재현하는 탐색적 테스트, (2) 수정 후 코드에서 올바른 동작과 기존 동작 보존을 검증하는 테스트.

### Exploratory Bug Condition Checking

**Goal**: 수정 전 코드에서 버그를 재현하여 근본 원인을 확인한다.

**Test Plan**: `useOnboarding` 훅의 상태 전이를 테스트하여 현재 로직의 문제를 확인한다.

**Test Cases**:
1. **최초 방문 후 재방문 테스트**: localStorage가 비어있을 때 투어 시작 → skip → 재마운트 시 투어 미시작 확인 (수정 전 코드에서 실패 예상 — 재방문 시에도 표시되어야 함)
2. **코스 상세페이지 가이드 미존재 테스트**: RouteDetailContent 렌더링 시 OnboardingTour 컴포넌트 미존재 확인 (수정 전 코드에서 실패 예상)
3. **"다시 보지 않기" 버튼 미존재 테스트**: OnboardingTour 렌더링 시 "다시 보지 않기" 버튼 미존재 확인 (수정 전 코드에서 실패 예상)

**Expected Counterexamples**:
- `skip()` 호출 후 localStorage에 `completed=true` 저장되어 재방문 시 `isActive=false`
- RouteDetailContent에 OnboardingTour 컴포넌트 자체가 없음

### Fix Checking

**Goal**: 수정 후 코드에서 버그 조건에 해당하는 모든 입력에 대해 올바른 동작을 검증한다.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := useOnboarding_fixed(input.steps)
  IF input.dismissed ≠ true THEN
    ASSERT result.isActive = true
  ELSE
    ASSERT result.isActive = false
  END IF
END FOR
```

### Preservation Checking

**Goal**: 수정 후 코드에서 버그 조건에 해당하지 않는 모든 입력에 대해 기존 동작이 보존되는지 검증한다.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT findNextValidStep(input.steps, input.fromIndex)
       = findNextValidStep_fixed(input.steps, input.fromIndex)
END FOR
```

**Testing Approach**: 속성 기반 테스트(PBT)를 사용하여 보존 검증을 수행한다. `findNextValidStep` 함수는 변경하지 않으므로 동일한 입력에 대해 동일한 출력을 보장해야 한다.

**Test Cases**:
1. **DOM 미존재 스텝 건너뛰기 보존**: 다양한 TourStep 배열과 fromIndex에 대해 findNextValidStep 동작 확인
2. **Escape 키 종료 보존**: OnboardingTour 활성 상태에서 Escape 키 입력 시 onSkip 호출 확인
3. **하이라이트 오버레이 보존**: 투어 활성 시 오버레이 렌더링 확인
4. **기존 페이지 가이드 동작 보존**: 지도/코스 목록/갤러리 페이지에서 새 로직으로도 가이드 정상 표시

### Unit Tests

- `useOnboarding` 훅: dismissed=false일 때 매번 isActive=true 반환
- `useOnboarding` 훅: dismissed=true일 때 isActive=false 반환
- `useOnboarding` 훅: skip() 호출 시 localStorage 미저장, isActive=false
- `useOnboarding` 훅: dismiss() 호출 시 localStorage에 dismissed=true 저장
- `useOnboarding` 훅: reset() 호출 시 dismissed 상태 초기화
- `OnboardingTour` 컴포넌트: "다시 보지 않기" 버튼 렌더링 확인
- `OnboardingTour` 컴포넌트: "다시 보지 않기" 클릭 시 onDismiss 호출
- `Header`: "가이드 다시 보기" 클릭 시 새 키(`not-a-trip-onboarding-dismissed`) 제거

### Property-Based Tests

- 임의의 dismissed 상태(true/false/null)에 대해 useOnboarding의 isActive 반환값 검증 (Property 1)
- 임의의 TourStep 배열과 fromIndex에 대해 findNextValidStep 동작 보존 검증 (Property 2)
- 임의의 skip/complete 호출 시퀀스에 대해 localStorage 미저장 검증 (Property 3)
- 임의의 dismiss 호출에 대해 localStorage 저장 및 isActive=false 검증 (Property 4)

### Integration Tests

- 코스 상세페이지 전체 렌더링 시 OnboardingTour 표시 확인
- 가이드 "다시 보지 않기" → 페이지 재방문 → 가이드 미표시 플로우
- Header "가이드 다시 보기" → dismissed 초기화 → 가이드 재표시 플로우
- 지도/코스 목록/갤러리 페이지에서 새 로직으로 가이드 정상 동작 확인
