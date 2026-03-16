# Requirements Document

## Introduction

Toss 스타일의 선언적 프로그래밍 패턴을 도입하여 Not a Trip 프로젝트의 코드 품질을 개선하는 리팩토링 spec이다. 4가지 핵심 영역(비동기 처리의 선언적 전환, 추상화 수준 맞추기, 관심사의 분리, 헤드리스 컴포넌트화)을 독립적으로 진행하며, 기존 기능을 유지하면서 점진적으로 코드 구조를 개선한다.

## Glossary

- **Suspense_Boundary**: React의 `<Suspense>` 컴포넌트로, 비동기 데이터 로딩 중 fallback UI를 선언적으로 표시하는 경계 컴포넌트
- **Error_Boundary**: React의 에러 경계 컴포넌트로, 하위 컴포넌트 트리에서 발생한 렌더링 에러를 선언적으로 포착하고 대체 UI를 표시하는 컴포넌트
- **useSuspenseQuery**: TanStack Query가 제공하는 훅으로, Suspense 모드에서 데이터를 패칭하여 로딩/에러 상태를 컴포넌트 외부(Suspense_Boundary, Error_Boundary)로 위임하는 훅
- **ViewModel_Hook**: UI 렌더링에 필요한 상태와 이벤트 핸들러를 캡슐화한 커스텀 훅으로, 컴포넌트에서 도메인 로직을 분리하여 컴포넌트가 렌더링만 담당하도록 하는 패턴
- **Admin_Auth_Hook**: 관리자 페이지의 세션 확인, 권한 검사, 미인증 리다이렉트 로직을 캡슐화한 커스텀 훅 (`useAdminAuth`)
- **Presentational_Component**: 로직 없이 props만 받아 UI를 렌더링하는 컴포넌트 (예: 아이콘, 빈 상태 UI, 스켈레톤)
- **SVG_Icon_Component**: 하드코딩된 인라인 SVG를 로컬 파일(`src/components/icons/`)로 분리하고, SVGR 또는 React 컴포넌트로 모듈화한 아이콘 컴포넌트 (예: `<BookmarkIcon />`, `<SearchIcon />`)
- **HydrationBoundary**: TanStack Query가 제공하는 컴포넌트로, 서버에서 프리페치한 쿼리 데이터를 클라이언트로 전달하여 SSR/CSR 간 하이드레이션 불일치를 방지하는 경계 컴포넌트
- **Main_Page**: 메인 지도 페이지 (`src/app/page.tsx`)
- **Admin_Dashboard**: 관리자 대시보드 페이지 (`src/app/admin/page.tsx`)
- **Admin_Reports_Page**: 관리자 제보 관리 페이지 (`src/app/admin/reports/page.tsx`)
- **Admin_Supplements_Page**: 관리자 정보 보완 검토 페이지 (`src/app/admin/supplements/page.tsx`)
- **Admin_StatusReports_Page**: 관리자 상태 신고 검토 페이지 (`src/app/admin/status-reports/page.tsx`)
- **Spot_Detail_Client**: 스팟 상세 페이지 클라이언트 컴포넌트 (`src/components/spot/SpotDetailClient.tsx`)
- **Route_Detail_Client**: 코스 상세 페이지 클라이언트 컴포넌트 (`src/components/route/RouteDetailClient.tsx`)

## Requirements

### Requirement 1: 비동기 처리의 선언적 전환 — Error Boundary 도입

**User Story:** As a 개발자, I want 공통 Error_Boundary 컴포넌트를 도입하여 에러 처리를 선언적으로 관리하고 싶다, so that 각 컴포넌트 내부의 명령형 에러 분기 코드를 제거하고 일관된 에러 UI를 제공할 수 있다.

#### Acceptance Criteria

1. THE Error_Boundary SHALL 하위 컴포넌트 트리에서 발생한 렌더링 에러를 포착하고 에러 메시지와 재시도 버튼이 포함된 대체 UI를 표시한다
2. THE Error_Boundary SHALL `fallback` prop을 통해 커스텀 에러 UI를 주입받을 수 있도록 지원한다
3. THE Error_Boundary SHALL `onReset` 콜백을 통해 재시도 시 에러 상태를 초기화한다
4. WHEN 에러가 발생하지 않을 때, THE Error_Boundary SHALL 하위 컴포넌트 트리를 변경 없이 그대로 렌더링한다

### Requirement 2: 비동기 처리의 선언적 전환 — Suspense + useSuspenseQuery 적용

**User Story:** As a 개발자, I want 명령형 `isLoading`/`error` 분기 처리를 Suspense_Boundary와 useSuspenseQuery로 전환하고 싶다, so that 컴포넌트가 데이터가 있는 상태만 다루는 선언적 코드가 된다.

#### Acceptance Criteria

1. WHEN Main_Page가 렌더링될 때, THE Main_Page SHALL Suspense_Boundary와 Error_Boundary로 감싸진 내부 콘텐츠 컴포넌트를 렌더링하고, 컴포넌트 내부에서 `isLoading`/`error` 분기를 제거한다
2. WHEN Admin_Dashboard가 렌더링될 때, THE Admin_Dashboard SHALL Suspense_Boundary와 Error_Boundary로 감싸진 내부 콘텐츠 컴포넌트를 렌더링하고, 컴포넌트 내부의 `useState`/`useEffect` 기반 데이터 패칭을 useSuspenseQuery로 전환한다
3. WHEN Spot_Detail_Client가 렌더링될 때, THE Spot_Detail_Client SHALL Suspense_Boundary와 Error_Boundary로 감싸진 내부 콘텐츠 컴포넌트를 렌더링하고, 기존 `useSpotDetail` 훅을 Suspense 모드로 전환한다
4. WHEN Route_Detail_Client가 렌더링될 때, THE Route_Detail_Client SHALL Suspense_Boundary와 Error_Boundary로 감싸진 내부 콘텐츠 컴포넌트를 렌더링하고, `useState`/`useEffect` 기반 데이터 패칭을 useSuspenseQuery로 전환한다
5. THE useSuspenseQuery 기반 훅 SHALL 기존 useQuery 훅과 동일한 queryKey와 queryFn을 사용하여 캐시 호환성을 유지한다
6. THE Suspense_Boundary 적용 시, Next.js의 SSR 환경에서 useSuspenseQuery로 인한 하이드레이션 불일치 에러를 방지하기 위해 React Query의 HydrationBoundary를 활용하거나, 클라이언트 마운트 이후에만 쿼리를 실행하도록 처리한다

### Requirement 3: 추상화 수준(Level of Abstraction) 맞추기

**User Story:** As a 개발자, I want Main_Page에 혼재된 raw SVG/HTML 코드를 별도의 Presentational_Component 및 SVG_Icon_Component로 분리하고 싶다, so that 최상위 컴포넌트가 높은 수준의 조합만 담당하고 가독성이 향상된다.

#### Acceptance Criteria

1. THE Main_Page SHALL 인라인 SVG가 포함된 `SpotLoadingSkeleton` 함수를 별도의 Presentational_Component 파일로 분리하여 import한다
2. THE Main_Page SHALL 인라인 SVG가 포함된 `SpotErrorDisplay` 함수를 별도의 Presentational_Component 파일로 분리하여 import한다
3. THE Main_Page SHALL 검색 결과 없음 오버레이와 카테고리 필터 해제 오버레이를 별도의 Presentational_Component로 분리하여 import한다
4. WHEN 분리된 Presentational_Component가 렌더링될 때, THE Presentational_Component SHALL 분리 전과 동일한 HTML 구조와 스타일을 출력한다
5. THE 프로젝트 SHALL 하드코딩된 인라인 SVG 아이콘(맵 마커, 북마크, 빈 상태 아이콘, 로딩 스피너 등)을 `src/components/icons/` 디렉토리에 개별 SVG_Icon_Component 파일로 분리하여 저장한다
6. THE 컴포넌트 SHALL 인라인 SVG 대신 분리된 SVG_Icon_Component를 직관적인 이름(예: `<BookmarkIcon />`, `<SearchIcon />`, `<SpinnerIcon />`)으로 import하여 렌더링한다

### Requirement 4: 관심사의 분리 — useAdminAuth 훅 추출

**User Story:** As a 개발자, I want 관리자 페이지들에 중복된 권한 검사 로직을 Admin_Auth_Hook으로 추출하고 싶다, so that 권한 검사 로직이 한 곳에서 관리되고 관리자 페이지 컴포넌트가 UI 렌더링에 집중할 수 있다.

#### Acceptance Criteria

1. THE Admin_Auth_Hook SHALL 세션 로딩 상태, 관리자 권한 확인, 비관리자 리다이렉트 로직을 캡슐화하고 `{ isLoading, isAuthorized, session }` 객체를 반환한다
2. WHEN 세션이 로딩 중일 때, THE Admin_Auth_Hook SHALL `isLoading`을 `true`로 반환한다
3. WHEN 사용자가 관리자가 아닐 때, THE Admin_Auth_Hook SHALL 메인 페이지(`/`)로 리다이렉트를 수행하고 `isAuthorized`를 `false`로 반환한다
4. WHEN 사용자가 관리자일 때, THE Admin_Auth_Hook SHALL `isAuthorized`를 `true`로, `session`을 현재 세션 객체로 반환한다
5. THE Admin_Dashboard SHALL Admin_Auth_Hook을 사용하여 기존의 인라인 권한 검사 코드를 대체한다
6. THE Admin_Reports_Page SHALL Admin_Auth_Hook을 사용하여 기존의 인라인 권한 검사 코드를 대체한다
7. THE Admin_Supplements_Page SHALL Admin_Auth_Hook을 사용하여 기존의 인라인 권한 검사 코드를 대체한다
8. THE Admin_StatusReports_Page SHALL Admin_Auth_Hook을 사용하여 기존의 인라인 권한 검사 코드를 대체한다

### Requirement 5: 관심사의 분리 — 관리자 페이지 데이터 패칭 통일

**User Story:** As a 개발자, I want 관리자 페이지들의 수동 fetch 호출을 React Query 훅으로 일괄 전환하고 싶다, so that 모든 관리자 페이지의 데이터 패칭 패턴이 통일되고 캐시 관리가 일관된다.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL `useState`/`useEffect` 기반의 수동 fetch 호출을 `useAdminDashboardSummary` React Query 훅으로 대체한다
2. THE `useAdminDashboardSummary` 훅 SHALL `adminKeys` 팩토리 패턴을 따르는 queryKey를 사용한다
3. WHEN 대시보드 요약 데이터 로딩에 실패할 때, THE `useAdminDashboardSummary` 훅 SHALL 에러 객체를 반환하여 Error_Boundary 또는 인라인 에러 UI에서 처리할 수 있도록 한다
4. THE Admin_Reports_Page, Admin_Supplements_Page, Admin_StatusReports_Page SHALL 기존 `useState`/`useEffect` 기반의 수동 데이터 패칭을 각각의 전용 React Query 훅(예: `useAdminReports`, `useAdminSupplements`, `useAdminStatusReports`)으로 대체한다
5. THE 전용 React Query 훅들 SHALL `adminKeys` 팩토리 패턴을 따르는 queryKey를 사용하여 기존 `useAdminQueries.ts`의 패턴과 일관성을 유지한다

### Requirement 6: 도메인 로직의 헤드리스 컴포넌트화 — SpotDetail ViewModel

**User Story:** As a 개발자, I want Spot_Detail_Client의 도메인 로직(삭제, 권한 확인, 정보 보완/상태 신고 토글, 로그인 모달)을 ViewModel_Hook으로 분리하고 싶다, so that 컴포넌트가 렌더링만 담당하고 로직을 독립적으로 테스트할 수 있다.

#### Acceptance Criteria

1. THE ViewModel_Hook (`useSpotDetailViewModel`) SHALL 스팟 삭제 핸들러, 권한 확인 결과(`hasEditPermission`, `hasDeletePermission`), 삭제 진행 상태(`isDeleting`)를 캡슐화하여 반환한다
2. THE ViewModel_Hook (`useSpotDetailViewModel`) SHALL 정보 보완 폼 토글, 상태 신고 폼 토글, 로그인 필요 모달 상태를 캡슐화하여 반환한다
3. THE Spot_Detail_Client SHALL ViewModel_Hook을 사용하여 기존의 인라인 상태 관리 및 이벤트 핸들러 코드를 대체한다
4. WHEN ViewModel_Hook이 반환한 핸들러가 호출될 때, THE ViewModel_Hook SHALL 기존 인라인 로직과 동일한 동작(삭제 확인, 캐시 무효화, 리다이렉트)을 수행한다

### Requirement 7: 도메인 로직의 헤드리스 컴포넌트화 — RouteDetail ViewModel

**User Story:** As a 개발자, I want Route_Detail_Client의 데이터 패칭과 에러 처리 로직을 ViewModel_Hook으로 분리하고 싶다, so that 컴포넌트가 렌더링만 담당하고 코드 구조가 명확해진다.

#### Acceptance Criteria

1. THE ViewModel_Hook (`useRouteDetailViewModel`) SHALL 코스 데이터 패칭, 로딩 상태, 에러 상태를 캡슐화하여 `{ route, isLoading, error }` 객체를 반환한다
2. THE ViewModel_Hook (`useRouteDetailViewModel`) SHALL `useState`/`useEffect` 기반의 수동 fetch를 React Query 훅으로 전환한다
3. THE Route_Detail_Client SHALL ViewModel_Hook을 사용하여 기존의 인라인 데이터 패칭 코드를 대체한다
4. WHEN 코스 데이터 로딩에 실패할 때, THE ViewModel_Hook SHALL 에러 객체를 반환하여 컴포넌트가 에러 UI를 렌더링할 수 있도록 한다

### Requirement 8: 리팩토링 안전성 보장

**User Story:** As a 개발자, I want 리팩토링 후에도 기존 기능이 동일하게 동작함을 보장하고 싶다, so that 사용자 경험에 영향 없이 코드 품질을 개선할 수 있다.

#### Acceptance Criteria

1. THE Error_Boundary SHALL 에러 발생 시 대체 UI를 렌더링하고, 재시도 시 에러 상태를 초기화하는 속성을 만족한다
2. THE Admin_Auth_Hook SHALL 관리자 세션에 대해 `isAuthorized: true`를, 비관리자 세션에 대해 `isAuthorized: false`를 반환하는 속성을 만족한다
3. WHEN 각 리팩토링 영역이 완료될 때, THE 리팩토링된 컴포넌트 SHALL 리팩토링 전과 동일한 사용자 인터랙션 결과를 생성한다
4. THE 각 리팩토링 영역 SHALL 다른 영역과 독립적으로 진행 가능하며, 하나의 영역 완료가 다른 영역의 기존 코드에 영향을 주지 않는다
