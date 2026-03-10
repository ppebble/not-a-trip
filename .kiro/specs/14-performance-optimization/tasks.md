# Implementation Plan: 성능 최적화 (Performance Optimization)

## Overview

Core Web Vitals(LCP, CLS, TTI) 지표를 개선하기 위한 성능 최적화를 점진적으로 적용합니다. 기존 기능을 깨뜨리지 않도록 **영향도 높고 부작용 적은 순서**로 단계별 적용하며, 각 Phase 사이에 Checkpoint를 두어 안전하게 배포합니다.

## Tasks

- [x] 1. 빌드 타임 설정 최적화 (런타임 위험 제로)
  - [x] 1.1 `next.config.ts` 이미지 설정 추가
    - `images.formats`에 `['image/avif', 'image/webp']` 설정
    - `images.deviceSizes`에 `[640, 750, 828, 1080, 1200]` 설정
    - `images.imageSizes`에 `[16, 32, 48, 64, 96, 128, 256]` 설정
    - `images.remotePatterns`에 프로젝트에서 사용하는 모든 외부 도메인 등록 (picsum.photos, images.unsplash.com, via.placeholder.com, raw.githubusercontent.com, cdnjs.cloudflare.com, cdn.myanimelist.net, localhost)
    - _Requirements: 1.2, 1.4, 5.3_

  - [x] 1.2 `src/app/globals.css` 폰트 선언 정리
    - `body`의 `font-family`를 `var(--font-geist-sans), sans-serif`로 변경
    - `code, pre`의 `font-family`를 `var(--font-geist-mono), monospace`로 변경
    - 기존 `'Inter'` 등 하드코딩된 폰트 선언 제거
    - `src/app/layout.tsx`에서 `display: 'swap'` 옵션 확인 및 적용
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2. Checkpoint — 빌드 타임 설정 검증
  - `npm run build` 실행하여 빌드 정상 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Leaflet CSS 번들링 (높은 영향도, 격리된 변경)
  - [x] 3.1 Leaflet CSS를 CDN에서 로컬 import로 전환
    - `src/app/layout.tsx`에서 Leaflet CDN `<link>` 태그 제거
    - 지도 컴포넌트(PilgrimageMap 등)에서 `import 'leaflet/dist/leaflet.css'` 추가
    - _Requirements: 4.1, 4.4_

  - [x] 3.2 Leaflet 마커 아이콘 로컬화
    - `node_modules/leaflet/dist/images/` 내 마커 아이콘 파일들(`marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`)을 `public/leaflet/` 디렉토리로 복사
    - 지도 컴포넌트 마운트 시점에 `L.Icon.Default.imagePath = '/leaflet/'` 한 줄 추가하여 아이콘 경로를 로컬로 설정 (Leaflet이 CSS 파일 위치 기준으로 이미지를 찾다 404 에러 발생하는 문제 방지)
    - _Requirements: 4.2_

- [x] 4. Checkpoint — Leaflet 번들링 검증
  - 지도 페이지에서 마커 및 타일이 정상 렌더링되는지 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. 이미지 최적화 — 컴포넌트별 점진 전환
  - [x] 5.1 `src/lib/image-utils.ts` 생성 — blur placeholder 유틸리티
    - 정적 SVG 기반 `BLUR_DATA_URL` 상수 정의
    - `blurPlaceholderProps` 객체 export (`placeholder: 'blur'`, `blurDataURL`)
    - _Requirements: 5.4_

  - [x] 5.2 `src/components/common/OptimizedImage.tsx` 생성 — 래퍼 컴포넌트
    - `next/image`를 감싸고 blur placeholder를 자동 적용하는 래퍼
    - `disableBlur` prop으로 blur 비활성화 옵션 제공
    - _Requirements: 1.1, 5.4_

  - [x] 5.3 HoverTooltip 컴포넌트 이미지 전환
    - `src/components/map/HoverTooltip.tsx`의 네이티브 `<img>` → `OptimizedImage` (fill 모드)
    - `sizes` 속성 추가
    - _Requirements: 1.1, 1.3, 5.1_

  - [x] 5.4 RouteCard 컴포넌트 이미지 전환
    - `src/components/route/RouteCard.tsx`의 네이티브 `<img>` → `OptimizedImage` (fill 모드)
    - `sizes` 속성 추가
    - _Requirements: 1.1, 1.3, 5.1, 5.2_

  - [x] 5.5 RouteFormContent 컴포넌트 이미지 전환
    - `src/components/route/RouteFormContent.tsx`의 네이티브 `<img>` → `OptimizedImage` (width/height 모드, 32x32)
    - _Requirements: 1.1, 1.3_

  - [x] 5.6 RouteDetailContent 및 SpotOrderList 컴포넌트 이미지 전환
    - `src/components/route/RouteDetailContent.tsx`의 네이티브 `<img>` → `OptimizedImage` (width/height 모드, 48x48)
    - `src/components/route/SpotOrderList.tsx`의 네이티브 `<img>` → `OptimizedImage` (width/height 모드, 48x48)
    - _Requirements: 1.1, 1.3_

  - [x] 5.7 LCP 핵심 이미지에 priority 속성 적용
    - 스팟 상세 페이지(`/spots/[id]`) 첫 번째 대표 이미지에 `priority={true}` 적용
    - SpotPreview 팝업 썸네일에 `priority={true}` 적용
    - 갤러리 페이지 첫 번째 행 이미지에 `priority={true}` 적용
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 5.8 Property 테스트 — remotePatterns 도메인 매칭
    - **Property 1: remotePatterns 도메인 매칭**
    - 임의의 원격 이미지 URL에 대해 remotePatterns 매칭 함수가 protocol, hostname, pathname을 모두 고려하여 올바르게 허용/거부하는지 검증
    - **Validates: Requirements 1.4**

- [x] 6. Checkpoint — 이미지 최적화 검증
  - 모든 이미지가 정상 렌더링되는지 확인
  - `npm run build` 실행하여 빌드 정상 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. 렌더링 최적화 (비파괴적 리팩토링)
  - [x] 7.1 Zustand useShallow selector 적용
    - `SpotPin`, `PilgrimageMap`, `SpotPreview`, `SearchInput`, `CategoryFilter`, `ContentSearchFilter` 컴포넌트에서 전체 스토어 구독을 `useShallow` selector로 변경
    - `import { useShallow } from 'zustand/react/shallow'` 사용
    - _Requirements: 8.1_

  - [x] 7.2 클라이언트 컴포넌트 목록 아이템에 선별적 React.memo 적용
    - ⚠️ **Server Component에는 React.memo 적용 불가** — 상태/이벤트 없는 정적 카드는 Server Component로 유지하는 것이 최고의 최적화
    - 각 대상 컴포넌트 최상단에 `'use client'`가 있는지 먼저 확인
    - Client Component(`'use client'` 선언됨)이면서 상위 목록 컴포넌트 내부에서 반복 렌더링되는 아이템에만 `React.memo` 래핑
    - Server Component인 경우 `React.memo` 적용하지 않고 그대로 유지 (불필요한 `'use client'` 추가 금지)
    - _Requirements: 8.2_

  - [x] 7.3 React Query staleTime/gcTime 전역 기본값 설정
    - `src/lib/providers.tsx`의 `QueryClient` defaultOptions에 `staleTime: 5분`, `gcTime: 10분`, `refetchOnWindowFocus: false`, `refetchOnReconnect: false` 설정
    - 데이터 특성별 개별 훅에서 staleTime/gcTime 오버라이드 적용 (spotDetail: 10분/15분, facilities: 15분/20분, likeStatus: 30초/5분 등)
    - _Requirements: 8.3_

  - [ ]* 7.4 Property 테스트 — Zustand shallow selector 동등성
    - **Property 3: Zustand shallow selector 동등성**
    - 임의의 스토어 상태에서 selector가 선택하지 않은 필드만 변경된 경우 useShallow 반환값이 이전과 얕은 동등성을 유지하는지 검증
    - **Validates: Requirements 8.1**

  - [ ]* 7.5 Property 테스트 — React Query 캐시 설정 불변식
    - **Property 5: React Query 캐시 설정 불변식**
    - 임의의 캐시 설정에 대해 staleTime이 항상 gcTime 이하인지 검증
    - **Validates: Requirements 8.3**

- [x] 8. Checkpoint — 렌더링 최적화 검증
  - 기존 기능(지도, 필터, 검색 등)이 정상 동작하는지 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. 네트워크 최적화 (Link prefetch 제어)
  - [x] 9.1 목록 페이지 Link에 prefetch={false} 적용
    - `RouteCard` 컴포넌트의 `<Link>`에 `prefetch={false}` 추가
    - `PostList` 내 게시글 링크에 `prefetch={false}` 추가
    - 갤러리 그리드 내 링크에 `prefetch={false}` 추가
    - Next.js의 hover 시 자동 prefetch 동작으로 체감 속도 유지
    - _Requirements: 9.1, 9.2_

- [x] 10. Checkpoint — 네트워크 최적화 검증
  - 목록 페이지에서 링크 클릭 시 정상 이동 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. 스크립트 로딩 최적화 (Google Places API 온디맨드)
  - [x] 11.1 `src/hooks/useGooglePlacesLoader.ts` 생성 — 온디맨드 스크립트 로더 훅
    - 초기 상태 `isLoaded: false`, `loadError: null`
    - `loadScript()` 호출 시 `<script>` 태그 동적 삽입
    - 이미 로드된 경우 중복 삽입 방지 (멱등성)
    - 로드 실패 시 `loadError` 상태 설정
    - _Requirements: 7.1_

  - [x] 11.2 FacilityReportForm에 온디맨드 로더 통합
    - 기존 `useLoadScript` 또는 즉시 로드 방식을 `useGooglePlacesLoader`로 교체
    - 검색 입력창 포커스 시 `loadScript()` 호출
    - 로드 실패 시 수동 주소 입력 폼으로 폴백
    - _Requirements: 7.1_

  - [ ]* 11.3 Property 테스트 — Google Places 온디맨드 로딩 상태 전이
    - **Property 2: Google Places 온디맨드 로딩 상태 전이**
    - 초기 상태 `isLoaded: false` → `loadScript()` 성공 후 `isLoaded: true` → 재호출 시 중복 삽입 없이 즉시 반환 (멱등성) 검증
    - **Validates: Requirements 7.1**

- [x] 12. React Query 전환 + 이미지 최적화 + 컴포넌트 분리 (전체 코드베이스)

  - [x] 12.1 API 라우트 등록 확장
    - `api-routes.ts`에 `ADMIN.REPORTS`, `ADMIN.STATUS_REPORTS`, `ADMIN.SUPPLEMENTS`, `ADMIN.CONTENT_IMAGES` 엔드포인트 추가
    - `CHECKINS`, `USERS`, `RANKING`, `ROUTES.LIST`, `ROUTES.RECOMMENDED` 엔드포인트 추가
    - _Requirements: 8.3_

  - [x] 12.2 Admin React Query 훅 생성 (`src/hooks/useAdminQueries.ts`)
    - `useAdminReports(statusFilter, page)` — 제보 목록 조회
    - `useAdminStatusReports(reviewStatusFilter, statusFilter, page)` — 상태 신고 목록 조회
    - `useAdminSupplements(statusFilter, page)` — 정보 보완 목록 조회
    - `useAdminContentImages(search, page)` — 콘텐츠 이미지 목록 조회
    - `adminKeys` 쿼리 키 팩토리 정의
    - invalidation 유틸 훅 (`useInvalidateAdminReports` 등) 제공
    - _Requirements: 8.3_

  - [x] 12.3 일반 컴포넌트 React Query 훅 생성 (`src/hooks/useGalleryQueries.ts`, `src/hooks/useRouteQueries.ts` 등)
    - `useCheckInGallery(spotId, userId, sortBy, page)` — 인증샷 갤러리 조회 (`CheckInGallery` 용)
    - `useHallOfFameRanking()` — 명예의 전당 랭킹 조회 (`HallOfFameTab` 용)
    - `useContentList()` — 작품 목록 조회 (`ContentTab` 용)
    - `useRouteList(filters, page)` — 코스 목록 조회 (`RouteListContent` 용)
    - `useRelatedRoutes(contentNames)` — 관련 코스 조회 (`RelatedRoutes` 용)
    - `useContributors(spotId)` — 기여자 목록 조회 (`ContributorList` 용)
    - `useCheckInCount(spotId)` — 인증 수 조회 (`SpotCheckInSection` 용)
    - `useUserProfile(userId)` — 유저 프로필 데이터 조회 (`profile/[id]/page` 용)
    - _Requirements: 8.3_

  - [x] 12.4 `AdminReportList` 리팩토링 — React Query 전환 + 카드 분리
    - `useState` + `useEffect` + `fetch` → `useAdminReports` 훅으로 교체
    - `refreshKey` prop 제거 → React Query invalidation으로 대체
    - `ReportSummaryCard`를 `src/components/admin/ReportSummaryCard.tsx`로 분리
    - `ReportSummaryCard`에 `React.memo` 적용
    - `Image fill`에 `sizes="56px"` 추가 (또는 `OptimizedImage` 래퍼 사용)
    - _Requirements: 8.1, 8.2, 8.3, 5.1_

  - [x] 12.5 `AdminStatusReportList` 리팩토링 — React Query 전환 + 카드 분리
    - `useState` + `useEffect` + `fetch` → `useAdminStatusReports` 훅으로 교체
    - `refreshKey` prop 제거 → React Query invalidation으로 대체
    - `StatusReportSummaryCard`를 `src/components/admin/StatusReportSummaryCard.tsx`로 분리
    - `StatusReportSummaryCard`에 `React.memo` 적용, `ReviewStatusBadge`도 함께 분리
    - _Requirements: 8.1, 8.2, 8.3, 5.1_

  - [x] 12.6 `AdminSupplementList` 리팩토링 — React Query 전환 + 카드 분리
    - `useState` + `useEffect` + `fetch` → `useAdminSupplements` 훅으로 교체
    - `refreshKey` prop 제거 → React Query invalidation으로 대체
    - `SupplementSummaryCard`를 `src/components/admin/SupplementSummaryCard.tsx`로 분리
    - `SupplementSummaryCard`에 `React.memo` 적용, `SupplementStatusBadge`도 함께 분리
    - _Requirements: 8.1, 8.2, 8.3, 3.1_

  - [x] 12.7 Admin 페이지 `refreshKey` 제거 및 invalidation 연동
    - `src/app/admin/reports/page.tsx` — `refreshKey` 제거, `handleReviewComplete`에서 queryClient invalidation
    - `src/app/admin/status-reports/page.tsx` — 동일 적용
    - `src/app/admin/supplements/page.tsx` — 동일 적용
    - _Requirements: 8.3_

  - [x] 12.8 `AdminContentImagesPage` React Query 전환
    - `useState` + `useEffect` + `fetch` → `useAdminContentImages` 훅으로 교체
    - mutation 훅 생성 (`useUploadContentImage`, `useDeleteContentImage`, `useSyncContentMasters`)
    - _Requirements: 8.3_

  - [x] 12.9 `CheckInGallery` React Query 전환 + 이미지 최적화
    - `useState` + `fetch` → `useCheckInGallery` 훅으로 교체
    - `CheckInDetailModal`을 별도 파일로 분리
    - 갤러리 그리드 `Image fill`에 `sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"` 추가
    - 모달 내 `Image fill`에 적절한 `sizes` 추가
    - _Requirements: 8.3, 5.1_

  - [x] 12.10 `HallOfFameTab` React Query 전환
    - `useState` + `useEffect` + `fetch` → `useHallOfFameRanking` 훅으로 교체
    - _Requirements: 8.3_

  - [x] 12.11 `ContentTab` React Query 전환
    - 내부 `useContentList` 커스텀 훅 → `useContentList` React Query 훅으로 교체
    - _Requirements: 8.3_

  - [x] 12.12 `RouteListContent` React Query 전환
    - `useState` + `useEffect` + `fetch` → `useRouteList` 훅으로 교체 (무한 스크롤은 `useInfiniteQuery` 활용)
    - _Requirements: 8.3_

  - [x] 12.13 `RelatedRoutes` React Query 전환
    - `useState` + `useEffect` + `fetch` → `useRelatedRoutes` 훅으로 교체
    - _Requirements: 8.3_

  - [x] 12.14 `ContributorList` React Query 전환
    - `useState` + `useEffect` + `fetch` → `useContributors` 훅으로 교체
    - _Requirements: 8.3_

  - [x] 12.15 `SpotCheckInSection` React Query 전환
    - 인증 수 조회 `useState` + `useEffect` + `fetch` → `useCheckInCount` 훅으로 교체
    - `refreshKey` 패턴 제거 → React Query invalidation으로 대체
    - _Requirements: 8.3_

  - [x] 12.16 `UserProfilePage` React Query 전환
    - 4개 병렬 fetch (`stats`, `badges`, `progress`, `reportedSpots`) → `useUserProfile` 훅 또는 개별 React Query 훅으로 교체
    - `useQueries` 활용하여 병렬 조회 최적화
    - _Requirements: 8.3_

  - [x] 12.17 전체 `Image fill` sizes 속성 누락 보완
    - `AdminReportList` — `sizes="56px"` (w-14 h-14 썸네일)
    - `AdminReportReview` — 증거 사진 `sizes="(max-width: 768px) 50vw, 33vw"`
    - `AdminSupplementReview` — 씬 캡처/첨부 사진 `sizes="(max-width: 768px) 50vw, 33vw"`
    - `AdminStatusReportReview` — 증거 사진 `sizes="(max-width: 768px) 50vw, 384px"`
    - `AdminContentImagesPage` — 콘텐츠 이미지 `sizes="64px"` (h-16 w-16), 업로드 미리보기 `sizes="96px"`
    - `RelatedContentItem` — `sizes="(max-width: 640px) 100vw, 50vw"`
    - `RelatedContentSection` — `sizes="(max-width: 640px) 100vw, 50vw"`
    - `MyReportList` — `sizes="56px"` (h-14 w-14 썸네일)
    - `NearbySpotWarning` — `sizes="48px"` (h-12 w-12 썸네일)
    - `EvidencePairUpload` — 캡처/현장 미리보기 `sizes="96px"`
    - `StatusReportForm` — 증거 사진 미리보기 `sizes="128px"`
    - `SupplementForm` — 캡처/첨부 미리보기 `sizes="128px"`
    - `CheckInGallery` — 갤러리 `sizes="(max-width: 640px) 50vw, 25vw"`, 모달 `sizes="(max-width: 768px) 100vw, 672px"`
    - `CheckInModal` — 참고 장면/미리보기 `sizes="(max-width: 768px) 50vw, 256px"`
    - `QuickCheckIn` — 미리보기 `sizes="128px"`
    - `ComparisonViewer` — 비교 이미지 `sizes="(max-width: 768px) 50vw, 384px"`
    - `ViewfinderOverlay` — 씬 가이드 `sizes="100vw"`
    - `SpotSearchModal` — 썸네일 `sizes="48px"`
    - `SpotDetailPage` — 스팟 사진 `sizes="(max-width: 768px) 100vw, 50vw"`
    - `reports/[id]/page` — 증거 사진 `sizes="(max-width: 768px) 50vw, 33vw"`
    - `community/media/[title]/page` — 배너 `sizes="100vw"`, 포스터 `sizes="80px"`, 스팟 썸네일 `sizes="64px"`
    - _Requirements: 1.3, 5.1_

- [x] 12.C Checkpoint — React Query 전환 + 이미지 최적화 검증
  - 모든 페이지 정상 동작 확인 (admin, gallery, route, spot, profile, community)
  - `npm run build` 실행하여 빌드 정상 완료 확인
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Code Splitting 확인 및 정리
  - [x] 13.1 기존 dynamic import 유지 확인 및 누락 보완
    - Leaflet 지도 컴포넌트의 `dynamic import + ssr: false` 유지 확인
    - 무거운 모달(FacilityReportForm 등)에 `next/dynamic` 지연 로딩 적용 여부 확인 및 필요 시 적용
    - 정적 UI 컴포넌트가 Server Component로 유지되는지 확인
    - _Requirements: 4.3, 4.4, 6.1, 6.2_

- [x] 14. Final Checkpoint — 전체 성능 최적화 검증
  - `npm run build` 실행하여 빌드 정상 완료 확인
  - 모든 페이지 정상 동작 확인
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- **점진적 적용 원칙**: Phase 1(빌드 설정) → Phase 2(Leaflet) → Phase 3(이미지) → Phase 4(렌더링) → Phase 5(네트워크) → Phase 6(스크립트) 순서로 위험도 낮은 것부터 적용
- 각 Phase 사이에 Checkpoint를 두어 기존 기능이 깨지지 않았는지 검증
- SpotPin은 Leaflet divIcon의 HTML 문자열 제약으로 `next/image` 전환 불가 (네이티브 `<img>` 유지)
- AddSceneModal은 로컬 blob URL 미리보기이므로 전환 대상에서 제외
- Property 테스트는 `fast-check` 라이브러리 사용 (이미 devDependencies에 설치됨)
- **React.memo 주의**: Server Component에는 React.memo 적용 불가. `'use client'` 선언된 Client Component이면서 상위 목록에서 반복 렌더링되는 아이템에만 선별 적용. 정적 카드는 Server Component 유지가 최고의 최적화
- **Leaflet 아이콘 경로**: CSS 번들링 후 Leaflet이 이미지 경로를 찾지 못하는 문제는 `L.Icon.Default.imagePath = '/leaflet/'` 한 줄로 해결
