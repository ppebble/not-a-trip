# Bugfix Requirements Document

## Introduction

온보딩 가이드 투어에 두 가지 문제가 있다:

1. **코스 상세페이지 가이드 미동작**: `RouteDetailContent.tsx`에 `OnboardingTour` 컴포넌트가 연동되지 않아, 코스 상세페이지(`/routes/[id]`)에서 온보딩 가이드가 표시되지 않는다. 지도 페이지, 코스 목록 페이지, 갤러리 페이지에는 정상 연동되어 있다.

2. **가이드 표시 로직 반전 필요**: 현재 로직은 "최초 방문 시 1회 표시 → localStorage에 완료 저장 → Header의 '가이드 다시 보기'로 초기화" 방식이다. 사용자가 원하는 방식은 반대로, "매번 페이지 방문 시 가이드 상시 표시 → '다시 보지 않기' 클릭 시 localStorage에 저장하여 이후 숨김 → Header의 '가이드 다시 보기'로 초기화" 방식이다.

이 두 문제로 인해 코스 상세페이지 신규 사용자가 가이드를 받지 못하고, 전체적으로 가이드 표시 정책이 사용자 기대와 반대로 동작한다.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN 사용자가 코스 상세페이지(`/routes/[id]`)를 방문하면 THEN the system은 온보딩 가이드 투어를 표시하지 않는다 (OnboardingTour 컴포넌트가 연동되지 않음)

1.2 WHEN 사용자가 서비스에 최초 방문하면 THEN the system은 온보딩 가이드를 1회 표시하고 localStorage에 `not-a-trip-onboarding-completed=true`를 저장하여 이후 방문 시 가이드를 표시하지 않는다

1.3 WHEN 사용자가 온보딩 가이드에서 "건너뛰기"를 클릭하면 THEN the system은 localStorage에 완료 상태를 저장하여 이후 가이드를 표시하지 않는다

1.4 WHEN 사용자가 가이드를 다시 보고 싶을 때 THEN the system은 Header의 "가이드 다시 보기" 버튼을 통해서만 가이드를 다시 볼 수 있다

1.5 WHEN 온보딩 가이드가 표시될 때 THEN the system은 "다시 보지 않기" 버튼을 제공하지 않고 "건너뛰기"와 "다음" 버튼만 제공한다

### Expected Behavior (Correct)

2.1 WHEN 사용자가 코스 상세페이지(`/routes/[id]`)를 방문하면 THEN the system SHALL `ROUTE_PAGE_STEPS`에 정의된 온보딩 가이드 투어를 표시한다 (localStorage에 "다시 보지 않기"가 저장되지 않은 경우)

2.2 WHEN 사용자가 페이지를 방문하고 localStorage에 해당 페이지의 "다시 보지 않기" 상태가 저장되어 있지 않으면 THEN the system SHALL 매번 온보딩 가이드를 표시한다

2.3 WHEN 사용자가 온보딩 가이드에서 "건너뛰기" 또는 "완료"를 클릭하면 THEN the system SHALL 가이드를 닫되 localStorage에 완료 상태를 저장하지 않아 다음 방문 시 다시 표시한다

2.4 WHEN 사용자가 온보딩 가이드에서 "다시 보지 않기" 버튼을 클릭하면 THEN the system SHALL localStorage에 해당 상태를 저장하여 이후 해당 페이지의 가이드를 영구적으로 숨긴다

2.5 WHEN 온보딩 가이드가 표시될 때 THEN the system SHALL "다음", "건너뛰기", "다시 보지 않기" 버튼을 모두 제공한다

### Unchanged Behavior (Regression Prevention)

3.1 WHEN Header의 "가이드 다시 보기" 버튼을 클릭하면 THEN the system SHALL CONTINUE TO localStorage의 온보딩 상태를 초기화하여 가이드를 다시 표시할 수 있게 한다

3.2 WHEN 온보딩 가이드의 대상 요소가 DOM에 존재하지 않으면 THEN the system SHALL CONTINUE TO 해당 스텝을 건너뛰고 다음 스텝으로 진행한다

3.3 WHEN localStorage 접근이 실패하면 THEN the system SHALL CONTINUE TO 가이드를 매번 표시한다 (graceful degradation)

3.4 WHEN 지도 페이지, 코스 목록 페이지, 갤러리 페이지에서 온보딩 가이드가 동작할 때 THEN the system SHALL CONTINUE TO 기존과 동일하게 가이드를 표시한다 (새로운 로직 적용)

3.5 WHEN 사용자가 Escape 키를 누르면 THEN the system SHALL CONTINUE TO 온보딩 투어를 종료한다

3.6 WHEN 온보딩 투어가 활성화되면 THEN the system SHALL CONTINUE TO 대상 요소를 하이라이트하고 반투명 오버레이를 표시한다

---

## Bug Condition

### Bug Condition Function

```pascal
FUNCTION isBugCondition_Missing(X)
  INPUT: X of type PageVisit
  OUTPUT: boolean
  
  // 코스 상세페이지 방문 시 가이드가 표시되지 않는 버그
  RETURN X.page = "/routes/[id]"
END FUNCTION

FUNCTION isBugCondition_Logic(X)
  INPUT: X of type OnboardingState
  OUTPUT: boolean
  
  // 가이드 표시 로직이 반전되어야 하는 버그
  // 현재: completed=false일 때만 표시 (최초 1회)
  // 기대: dismissed=false일 때 매번 표시
  RETURN X.hasVisitedBefore = true AND X.onboardingCompleted = false
END FUNCTION
```

### Property Specification

```pascal
// Property: Fix Checking - 코스 상세페이지 가이드 표시
FOR ALL X WHERE isBugCondition_Missing(X) DO
  result ← renderRouteDetailPage'(X)
  ASSERT result.hasOnboardingTour = true
END FOR

// Property: Fix Checking - 가이드 상시 표시 로직
FOR ALL X WHERE isBugCondition_Logic(X) DO
  result ← useOnboarding'(X.steps)
  ASSERT result.isActive = true WHEN X.dismissed = false
  ASSERT result.isActive = false WHEN X.dismissed = true
END FOR
```

### Preservation Goal

```pascal
// Property: Preservation Checking - 기존 페이지 가이드 동작 유지
FOR ALL X WHERE NOT isBugCondition_Missing(X) DO
  ASSERT renderPage(X).hasOnboardingTour = renderPage'(X).hasOnboardingTour
END FOR

// Property: Preservation Checking - DOM 미존재 스텝 건너뛰기
FOR ALL X WHERE NOT isBugCondition_Logic(X) DO
  ASSERT findNextValidStep(X.steps, X.fromIndex) = findNextValidStep'(X.steps, X.fromIndex)
END FOR
```
