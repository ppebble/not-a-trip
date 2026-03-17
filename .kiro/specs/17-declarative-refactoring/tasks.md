# 구현 계획: 선언적 리팩토링 (Declarative Refactoring)

## 개요

Bottom-up 접근법으로 가장 작고 독립적인 컴포넌트부터 시작하여, 인프라 컴포넌트 → 커스텀 훅 → 페이지 레벨 통합 순서로 진행한다. 각 레이어는 이전 레이어에 의존하므로 순서를 지켜야 한다.

## Tasks

- [x] 1. Layer 1: SVG 아이콘 컴포넌트 분리
  - [x] 1.1 SVG 아이콘 컴포넌트 생성 (`src/components/icons/`)
    - `AlertTriangleIcon`, `SearchIcon`, `FilterIcon`, `MapPinIcon`, `ArrowLeftIcon`, `SpinnerIcon` 컴포넌트 생성
    - 공통 `IconProps` 인터페이스 정의 (`size`, `color`, `className`)
    - 배럴 파일 `src/components/icons/index.ts` 생성
    - _Requirements: 3.5, 3.6_

  - [ ]* 1.2 SVG 아이콘 컴포넌트 단위 테스트
    - size, color, className props 적용 검증
    - 기본값(currentColor, md 사이즈) 렌더링 검증
    - _Requirements: 3.6_

- [ ] 2. Layer 1: 프레젠테이셔널 컴포넌트 분리
  - [ ] 2.1 `SpotLoadingSkeleton` 컴포넌트 분리
    - `src/app/page.tsx` 내부의 `SpotLoadingSkeleton` 함수를 `src/components/common/SpotLoadingSkeleton.tsx`로 분리
    - 인라인 SVG를 `SpinnerIcon`으로 교체
    - `page.tsx`에서 import로 교체
    - _Requirements: 3.1, 3.6_

  - [ ] 2.2 `SpotErrorDisplay` 컴포넌트 분리
    - `src/app/page.tsx` 내부의 `SpotErrorDisplay` 함수를 `src/components/common/SpotErrorDisplay.tsx`로 분리
    - 인라인 SVG를 `AlertTriangleIcon`으로 교체
    - `page.tsx`에서 import로 교체
    - _Requirements: 3.2, 3.6_

  - [ ] 2.3 `EmptySearchOverlay`, `EmptyFilterOverlay` 컴포넌트 분리
    - `src/app/page.tsx`의 검색 결과 없음 오버레이를 `src/components/common/EmptySearchOverlay.tsx`로 분리
    - 카테고리 필터 해제 오버레이를 `src/components/common/EmptyFilterOverlay.tsx`로 분리
    - 인라인 SVG를 `SearchIcon`, `FilterIcon`으로 교체
    - `page.tsx`에서 import로 교체
    - _Requirements: 3.3, 3.6_

  - [ ]* 2.4 프레젠테이셔널 컴포넌트 단위 테스트
    - 분리 전후 동일한 HTML 구조/스타일 출력 검증
    - props 전달 검증 (error, onRetry, searchQuery 등)
    - _Requirements: 3.4_

- [ ] 3. Checkpoint - Layer 1 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Layer 2: ErrorBoundary 컴포넌트 구현
  - [ ] 4.1 `ErrorBoundary` 클래스 컴포넌트 구현
    - `src/components/common/ErrorBoundary.tsx` 생성
    - `getDerivedStateFromError`, `componentDidCatch` 구현
    - `fallback` (ReactNode) / `renderFallback` (Render Props) / 기본 에러 UI 우선순위 처리
    - `onReset` 콜백으로 에러 상태 초기화
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 4.2 ErrorBoundary 속성 기반 테스트 — Property 1: 에러 포착 및 대체 UI 표시
    - **Property 1: ErrorBoundary 에러 포착 및 대체 UI 표시**
    - **Validates: Requirements 1.1**
    - `Feature: 17-declarative-refactoring, Property 1: ErrorBoundary 에러 포착 및 대체 UI 표시`
    - Generator: 임의의 에러 메시지 문자열

  - [ ]* 4.3 ErrorBoundary 속성 기반 테스트 — Property 2: 에러→리셋 라운드트립
    - **Property 2: ErrorBoundary 에러→리셋 라운드트립**
    - **Validates: Requirements 1.3, 8.1**
    - `Feature: 17-declarative-refactoring, Property 2: ErrorBoundary 에러→리셋 라운드트립`
    - Generator: 임의의 에러 메시지 문자열

  - [ ]* 4.4 ErrorBoundary 속성 기반 테스트 — Property 3: ErrorBoundary 투명성
    - **Property 3: ErrorBoundary 투명성**
    - **Validates: Requirements 1.4**
    - `Feature: 17-declarative-refactoring, Property 3: ErrorBoundary 투명성`
    - Generator: 임의의 자식 텍스트 콘텐츠

- [ ] 5. Layer 2: useIsMounted 훅 및 AsyncBoundary 구현
  - [ ] 5.1 `useIsMounted` 훅 구현
    - `src/hooks/useIsMounted.ts` 생성
    - `useState(false)` + `useEffect`로 클라이언트 마운트 감지
    - SSR 환경에서 항상 `false` 반환
    - _Requirements: 2.6_

  - [ ] 5.2 `AsyncBoundary` 컴포넌트 구현
    - `src/components/common/AsyncBoundary.tsx` 생성
    - `QueryErrorResetBoundary` + `ErrorBoundary` + `Suspense` + `useIsMounted` 조합
    - 마운트 전 `pendingFallback` 표시, 마운트 후 자식 렌더링
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ]* 5.3 AsyncBoundary 단위 테스트
    - Suspense + ErrorBoundary 조합 동작 검증
    - SSR 환경에서 pendingFallback 표시 검증
    - _Requirements: 2.6, 8.3_

- [ ] 6. Checkpoint - Layer 2 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Layer 3: useAdminAuth 훅 추출
  - [ ] 7.1 `useAdminAuth` 훅 구현
    - `src/hooks/useAdminAuth.ts` 생성
    - `useSession()` 기반 세션 로딩, 권한 확인, 비관리자 리다이렉트 캡슐화
    - `{ isLoading, isAuthorized, session }` 반환
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 7.2 useAdminAuth 속성 기반 테스트 — Property 4: 세션-권한 매핑
    - **Property 4: useAdminAuth 세션-권한 매핑**
    - **Validates: Requirements 4.1, 8.2**
    - `Feature: 17-declarative-refactoring, Property 4: useAdminAuth 세션-권한 매핑`
    - Generator: 임의의 세션 상태 (loading/admin/non-admin/null)

- [ ] 8. Layer 3: useSpotDetailViewModel 훅 추출
  - [ ] 8.1 `useSpotDetailViewModel` 훅 구현
    - `src/hooks/useSpotDetailViewModel.ts` 생성
    - 스팟 삭제 핸들러, 권한 확인, 삭제 진행 상태 캡슐화
    - 정보 보완 폼 토글, 상태 신고 폼 토글, 로그인 모달 상태 캡슐화
    - _Requirements: 6.1, 6.2_

  - [ ]* 8.2 useSpotDetailViewModel 속성 기반 테스트 — Property 5: 권한 및 상태 관리 일관성
    - **Property 5: useSpotDetailViewModel 권한 및 상태 관리 일관성**
    - **Validates: Requirements 6.1, 6.2**
    - `Feature: 17-declarative-refactoring, Property 5: useSpotDetailViewModel 권한 및 상태 관리 일관성`
    - Generator: 임의의 사용자 역할 × 스팟 소유자 조합

- [ ] 9. Layer 3: useRouteDetailViewModel 훅 추출
  - [ ] 9.1 `useRouteDetailViewModel` 훅 구현
    - `src/hooks/useRouteDetailViewModel.ts` 생성
    - `useState`/`useEffect` 기반 수동 fetch를 React Query(`useQuery`)로 전환
    - `routeKeys` 팩토리 패턴 활용하여 캐시 호환성 유지
    - `{ route, isLoading, error }` 반환
    - _Requirements: 7.1, 7.2_

  - [ ]* 9.2 useRouteDetailViewModel 단위 테스트
    - React Query 전환 후 데이터 패칭 검증
    - 에러 상태 반환 검증
    - _Requirements: 7.4_

- [ ] 10. Layer 3: useAdminDashboardSummary 훅 및 adminKeys 확장
  - [ ] 10.1 `useAdminDashboardSummary` 훅 구현 및 서브 페이지 React Query 훅 점검
    - `src/hooks/useAdminQueries.ts`에 `dashboard`, `dashboardSummary` 키 추가
    - `useAdminDashboardSummary` 훅 추가 (기존 파일에 추가)
    - `adminKeys` 팩토리 패턴 확장
    - 기존 `useAdminReports`, `useAdminSupplements`, `useAdminStatusReports` 훅이 `adminKeys` 팩토리 패턴을 따르는지 점검하고, 누락된 훅이 있으면 추가
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [ ]* 10.2 useAdminDashboardSummary 단위 테스트
    - 데이터 패칭, 에러 처리 검증
    - _Requirements: 5.3_

- [ ] 11. Checkpoint - Layer 3 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Layer 4: 관리자 페이지 useAdminAuth 적용
  - [x] 12.1 Admin Dashboard에 useAdminAuth + useAdminDashboardSummary 적용
    - `src/app/admin/page.tsx`의 인라인 권한 검사를 `useAdminAuth`로 교체
    - `useState`/`useEffect` 기반 데이터 패칭을 `useAdminDashboardSummary`로 교체
    - _Requirements: 4.5, 5.1_

  - [x] 12.2 Admin Reports, Supplements, StatusReports 페이지에 useAdminAuth + React Query 훅 적용
    - `src/app/admin/reports/page.tsx`의 인라인 권한 검사를 `useAdminAuth`로 교체하고, `useState`/`useEffect` 기반 수동 데이터 패칭을 `useAdminReports` 훅으로 교체
    - `src/app/admin/supplements/page.tsx`의 인라인 권한 검사를 `useAdminAuth`로 교체하고, 수동 데이터 패칭을 `useAdminSupplements` 훅으로 교체
    - `src/app/admin/status-reports/page.tsx`의 인라인 권한 검사를 `useAdminAuth`로 교체하고, 수동 데이터 패칭을 `useAdminStatusReports` 훅으로 교체
    - _Requirements: 4.6, 4.7, 4.8, 5.4, 5.5_

- [x] 13. Layer 4: SpotDetailClient에 ViewModel + AsyncBoundary 적용
  - [x] 13.1 SpotDetailClient에 useSpotDetailViewModel 적용
    - `src/components/spot/SpotDetailClient.tsx`의 인라인 상태 관리/이벤트 핸들러를 `useSpotDetailViewModel`로 교체
    - 인라인 SVG를 아이콘 컴포넌트로 교체 (`ArrowLeftIcon`, `MapPinIcon`, `AlertTriangleIcon`)
    - _Requirements: 6.3, 6.4, 3.6_

  - [x] 13.2 SpotDetailClient에 AsyncBoundary 적용
    - Suspense_Boundary + Error_Boundary로 감싸기
    - 기존 `useSpotDetail` 훅을 `useSuspenseQuery` 모드로 전환
    - `isLoading`/`error` 분기 제거, 데이터가 있는 상태만 다루도록 변경
    - _Requirements: 2.3, 2.5, 2.6_

- [x] 14. Layer 4: RouteDetailClient에 ViewModel + AsyncBoundary 적용
  - [x] 14.1 RouteDetailClient에 useRouteDetailViewModel 적용
    - `src/components/route/RouteDetailClient.tsx`의 인라인 데이터 패칭을 `useRouteDetailViewModel`로 교체
    - 인라인 SVG를 아이콘 컴포넌트로 교체
    - _Requirements: 7.3, 3.6_

  - [x] 14.2 RouteDetailClient에 AsyncBoundary 적용
    - Suspense_Boundary + Error_Boundary로 감싸기
    - `useRouteDetailViewModel`을 `useSuspenseQuery` 모드로 전환
    - `isLoading`/`error` 분기 제거
    - _Requirements: 2.4, 2.5, 2.6_

- [ ] 15. Layer 4: Main Page에 AsyncBoundary 적용
  - [ ] 15.1 Main Page에 AsyncBoundary + useSuspenseQuery 적용
    - `src/app/page.tsx`에 AsyncBoundary 적용
    - `useSpots` 훅을 `useSuspenseQuery` 모드로 전환
    - `isLoading`/`error` 분기 제거, 분리된 프레젠테이셔널 컴포넌트를 fallback으로 사용
    - _Requirements: 2.1, 2.5, 2.6_

- [ ] 16. Final Checkpoint - 전체 리팩토링 완료 확인
  - Ensure all tests pass, ask the user if questions arise.
  - 리팩토링 전후 동일한 사용자 인터랙션 결과 확인
  - _Requirements: 8.3, 8.4_

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있습니다
- 각 태스크는 특정 요구사항을 참조하여 추적 가능합니다
- 체크포인트에서 점진적 검증을 수행합니다
- 속성 기반 테스트는 `fast-check` 라이브러리를 사용하며, 각 속성당 최소 100회 반복합니다
- 단위 테스트는 Jest 프레임워크를 사용합니다
- 각 Layer는 이전 Layer에 의존하므로 순서를 지켜야 합니다
