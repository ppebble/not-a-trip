# 구현 계획: UX 품질 개선 Phase 2

## 개요

3가지 독립적인 UX 품질 개선을 순차적으로 구현한다. Critical 이슈(코스 생성 최소 스팟 수 유연화)를 먼저 처리한 후 Enhancement(공유 기능, 온보딩 가이드 투어)를 구현한다. 각 기능은 기존 코드 패턴(Zustand, React Query, Tailwind CSS)을 따르며 독립적으로 구현/배포 가능하다.

## Tasks

- [x] 1. 코스 생성 최소 스팟 수 1개로 변경
  - [x] 1.1 RouteFormContent 유효성 검사 수정
    - `src/components/route/RouteFormContent.tsx` 수정
    - `spots.length < 2` → `spots.length < 1` 조건 변경
    - 에러 메시지를 "코스에는 최소 1개의 스팟이 필요합니다"로 변경
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Route API 유효성 검사 수정
    - `src/app/api/routes/route.ts` (POST) 수정: `spots.length < 2` → `spots.length < 1`
    - `src/app/api/routes/[id]/route.ts` (PUT) 수정: 동일한 패턴 적용
    - 에러 메시지를 "코스에는 최소 1개의 스팟이 필요합니다"로 변경
    - _Requirements: 1.3, 1.4_

  - [x] 1.3 SpotOrderList 격려 메시지 및 빈 상태 메시지 수정
    - `src/components/route/SpotOrderList.tsx` 수정
    - `spots.length === 1`일 때 "💡 더 많은 스팟을 추가하면 풍성한 순례 경험을 만들 수 있어요!" 메시지 표시
    - 빈 상태 메시지의 "최소 2개" → "최소 1개"로 변경
    - _Requirements: 1.5_

  - [x] 1.4 GuidePanel 단일 스팟 처리 확인 및 수정
    - `src/components/route/GuidePanel.tsx` 수정
    - 스팟 1개일 때 "다음 스팟" 거리/시간 정보 미표시 확인
    - 단일 스팟 인증 UI만 제공되도록 조건 처리
    - _Requirements: 1.6_

  - [x] 1.5 RouteDetailContent 단일 스팟 코스 표시 확인
    - `src/components/route/RouteDetailContent.tsx` 확인
    - 스팟 1개 코스가 정상 표시되는지 확인, 필요 시 수정
    - _Requirements: 1.7_

  - [ ]* 1.6 유효한 스팟 수에 대한 유효성 검사 속성 테스트
    - **Property 1: 유효한 스팟 수에 대한 유효성 검사 통과**
    - `src/lib/__tests__/route-validation.test.ts` 신규 생성
    - spots 배열 길이 1 이상 + 필수 필드 유효 시 스팟 관련 에러 미반환 검증
    - fast-check 100회 이상 실행, 태그: `Feature: 29-ux-quality-phase2, Property 1: valid spot count validation`
    - **Validates: Requirements 1.1, 1.3**

- [x] 2. 체크포인트 — 코스 생성 유연화 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. 스팟/코스 공유 기능 구현
  - [x] 3.1 공유 유틸리티 함수 생성
    - `src/lib/share-utils.ts` 신규 생성
    - `formatSpotShareText(spotName, contentName?)` — 스팟 공유 텍스트 생성
    - `formatRouteShareText(routeName)` — 코스 공유 텍스트 생성
    - `canShare()` — Web Share API 지원 여부 확인
    - `executeShare(data)` — 공유 실행 (Web Share API → Clipboard 폴백)
    - AbortError 시 무시, 기타 에러 시 클립보드 폴백 처리
    - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 3.2 ShareButton 공통 컴포넌트 생성
    - `src/components/common/ShareButton.tsx` 신규 생성
    - `ShareButtonProps` 인터페이스 구현 (title, text, url?, variant?, className?)
    - 내부에 토스트 상태 관리 (useToast 훅 또는 로컬 state)
    - Web Share API 지원 시 네이티브 공유 시트 호출
    - 미지원 시 클립보드 복사 + "링크가 복사되었습니다" 토스트 표시
    - _Requirements: 2.3, 2.4, 2.5_

  - [x] 3.3 Toast 컴포넌트 및 useToast 훅 생성
    - `src/components/common/Toast.tsx` 신규 생성
    - `src/hooks/useToast.ts` 신규 생성
    - 3초 후 자동 사라짐, 하단 중앙 위치
    - _Requirements: 2.5_

  - [x] 3.4 SpotDetailClient에 ShareButton 연동
    - `src/components/spot/SpotDetailClient.tsx` 수정
    - 헤더 영역에 ShareButton 추가
    - 공유 텍스트: `formatSpotShareText(spot.name, spot.relatedContent[0]?.name)`
    - 공유 URL: 현재 페이지 canonical URL
    - _Requirements: 2.1, 2.6, 2.8_

  - [x] 3.5 RouteDetailContent에 ShareButton 연동
    - `src/components/route/RouteDetailContent.tsx` 수정
    - 액션 버튼 영역에 ShareButton 추가
    - 공유 텍스트: `formatRouteShareText(route.name)`
    - 공유 URL: 현재 페이지 canonical URL
    - _Requirements: 2.2, 2.7, 2.8_

  - [ ]* 3.6 공유 텍스트 포맷팅 일관성 속성 테스트
    - **Property 2: 공유 텍스트 포맷팅 일관성**
    - `src/lib/__tests__/share-text-formatting.test.ts` 신규 생성
    - 임의의 스팟명/작품명/코스명에 대해 "[Not a Trip]" 접두사, "확인해보세요!" 접미사, 입력 문자열 포함 검증
    - fast-check 100회 이상 실행, 태그: `Feature: 29-ux-quality-phase2, Property 2: share text formatting consistency`
    - **Validates: Requirements 2.6, 2.7**

- [x] 4. 체크포인트 — 공유 기능 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. 신규 사용자 온보딩 가이드 투어 구현
  - [x] 5.1 useOnboarding 훅 생성
    - `src/hooks/useOnboarding.ts` 신규 생성
    - localStorage 키: `not-a-trip-onboarding-completed`
    - `isActive`, `currentStep`, `next()`, `skip()`, `reset()` 반환
    - 대상 요소 DOM 미존재 시 자동 건너뛰기 로직 포함
    - localStorage 접근 실패 시 graceful degradation (매번 투어 표시)
    - _Requirements: 3.1, 3.7, 3.8, 3.9, 3.12_

  - [x] 5.2 OnboardingTour 오버레이 컴포넌트 생성
    - `src/components/common/OnboardingTour.tsx` 신규 생성
    - 전체 화면 반투명 오버레이 (`fixed inset-0 bg-black/50 z-[9999]`)
    - 대상 요소 `getBoundingClientRect()`로 위치 계산, clip-path/box-shadow로 하이라이트
    - 설명 툴팁에 "다음" 버튼과 "건너뛰기" 버튼 포함
    - 모바일 뷰포트에서 툴팁 위치 자동 조정 (화면 밖 벗어남 방지)
    - _Requirements: 3.5, 3.6, 3.11_

  - [x] 5.3 페이지별 Tour 설정 파일 생성
    - `src/lib/tour-config.ts` 신규 생성
    - `MAP_PAGE_STEPS`: 카테고리 필터 → 검색 입력 → 마커 클릭 순서
    - `ROUTE_PAGE_STEPS`: 코스 시작 방법 안내
    - `GALLERY_PAGE_STEPS`: 인증샷 업로드 방법 안내
    - 각 스텝에 `data-tour` 속성 기반 target selector 정의
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 5.4 지도 페이지에 온보딩 투어 연동 및 data-tour 속성 추가
    - `src/app/(main)/map/page.tsx` 수정: OnboardingTour + useOnboarding 연동
    - 카테고리 필터, 검색 입력, 마커 관련 요소에 `data-tour` 속성 추가
    - _Requirements: 3.1, 3.2_

  - [x] 5.5 코스/갤러리 페이지에 온보딩 투어 연동
    - `src/app/routes/page.tsx` 수정: ROUTE_PAGE_STEPS 연동
    - `src/app/gallery/page.tsx` 수정: GALLERY_PAGE_STEPS 연동
    - 해당 요소에 `data-tour` 속성 추가
    - _Requirements: 3.3, 3.4_

  - [x] 5.6 "가이드 다시 보기" 옵션 추가
    - `src/components/layout/Header.tsx` 수정
    - 설정/도움말 메뉴에 "가이드 다시 보기" 옵션 추가
    - 클릭 시 `useOnboarding.reset()` 호출하여 Tour_State 초기화
    - _Requirements: 3.10_

  - [ ]* 5.7 투어 스텝 필터링 속성 테스트
    - **Property 3: 투어 스텝 필터링 — DOM 미존재 요소 건너뛰기**
    - `src/hooks/__tests__/onboarding-tour-step-filter.test.ts` 신규 생성
    - 임의의 TourStep 배열에서 DOM 미존재 target은 건너뛰고 존재하는 target으로 진행 검증
    - fast-check 100회 이상 실행, 태그: `Feature: 29-ux-quality-phase2, Property 3: tour step filtering`
    - **Validates: Requirements 3.12**

- [x] 6. 최종 체크포인트 — 전체 기능 검증
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 Requirements를 참조하여 추적 가능
- 체크포인트에서 증분 검증 수행
- 속성 테스트는 설계 문서의 Correctness Properties를 검증
- 단위 테스트는 특정 시나리오와 에지 케이스를 검증
- Critical(코스 생성 유연화) → Enhancement(공유, 온보딩) 순서로 구현
