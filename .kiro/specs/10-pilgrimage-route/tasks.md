# Implementation Plan: 성지순례 코스/루트 시스템 (Pilgrimage Route)

## Overview

유저가 여러 스팟을 순서대로 묶어 코스를 생성하고, 탐색·따라가기할 수 있는 시스템을 구현한다. 데이터 모델 → API → UI 컴포넌트 → 네비게이션 → 오프라인 캐싱 순으로 점진적으로 구축한다.

## Tasks

- [x] 1. 데이터 모델, 유틸리티 및 DB 설정
  - [x] 1.1 Route 관련 타입 정의
    - `src/types/route.ts`에 `Route`, `RouteSpot`, `RouteDifficulty`, `RouteBookmark`, `RouteCompletion` 인터페이스 정의
    - _Requirements: 1.2_

  - [x] 1.2 DB 컬렉션 및 인덱스 설정
    - `src/lib/db.ts`의 COLLECTIONS에 `routes`, `route_bookmarks`, `route_completions` 추가
    - 인덱스 생성 함수 작성 (routes: isPublic+createdAt, isPublic+bookmarkCount, relatedContentNames, regionTag, authorId, isOfficial / route_bookmarks: userId+routeId unique, routeId / route_completions: userId+routeId, routeId)
    - _Requirements: 1.2, 2.1, 2.2_

  - [x] 1.3 코스 거리/시간 계산 유틸리티 구현
    - `src/lib/route-utils.ts`에 `estimateWalkTime`, `calculateRouteDistances` 함수 구현
    - 기존 `src/lib/geo-utils.ts`의 `calculateDistance` (Haversine) 활용
    - 도보 보정 계수(1.3)와 평균 도보 속도(80m/분) 적용
    - _Requirements: 1.4_

  - [ ]* 1.4 데이터 모델 및 유틸리티 테스트
    - **Property 2: 도보 시간 계산의 단조성** — 거리가 크면 도보 시간도 크거나 같아야 하며, 동일 좌표 간 거리/시간은 0
    - **Validates: Requirements 1.4, 3.3**
    - 단위 테스트: 동일 좌표 → 0m, 알려진 좌표 쌍 거리 검증, `calculateRouteDistances` 첫 스팟 null 검증
    - _Requirements: 1.4_

- [x] 2. 코스 CRUD API 구현
  - [x] 2.1 코스 생성 API (`POST /api/routes`)
    - `src/app/api/routes/route.ts`에 코스 생성 엔드포인트 구현
    - 인증 확인, 필수 필드 검증 (코스명, 설명, 예상 소요시간, 난이도, 스팟 목록)
    - 스팟 최소 2개 검증, 스팟 ID 유효성 검증 (spots 컬렉션 대조)
    - `calculateRouteDistances`로 스팟 간 거리/시간 자동 계산
    - 공개/비공개 설정 처리
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 코스 목록 조회 API (`GET /api/routes`)
    - 동일 파일에 목록 조회 엔드포인트 구현
    - 정렬: 인기순(bookmarkCount+completionCount 내림차순), 최신순(createdAt 내림차순), 소요시간순(estimatedDuration 오름차순)
    - 필터: 작품별(relatedContentNames), 지역별(regionTag), 소요시간별(estimatedDuration 범위)
    - 페이지네이션 (cursor 기반 또는 offset)
    - _Requirements: 2.1, 2.2_

  - [x] 2.3 코스 상세/수정/삭제 API (`/api/routes/[id]`)
    - `src/app/api/routes/[id]/route.ts`에 GET, PUT, DELETE 구현
    - GET: 코스 상세 조회 시 spots 컬렉션과 대조하여 `isAvailable` 갱신
    - PUT: 작성자 권한 확인, 스팟 순서 변경 시 거리/시간 재계산
    - DELETE: 작성자 권한 확인, 관련 북마크/완주 기록 정리
    - 비공개 코스 타인 접근 시 403
    - _Requirements: 1.2, 1.3, 1.4, 2.3_

  - [ ]* 2.4 코스 CRUD API 테스트
    - **Property 1: 코스 생성 라운드트립** — 생성 후 조회 시 모든 필드 동일, 스팟 순서 보존
    - **Validates: Requirements 1.2, 1.5**
    - **Property 3: 코스 목록 정렬 정확성** — 인접 항목이 정렬 기준 위반하지 않음
    - **Validates: Requirements 2.1, 4.2**
    - **Property 4: 필터링 결과의 조건 충족** — 필터링 결과 모든 항목이 조건 만족
    - **Validates: Requirements 2.2, 4.1, 4.3**
    - 단위 테스트: 필수 필드 누락 에러, 스팟 1개 이하 에러, 빈 목록/단일 항목 정렬, 빈 필터 전체 반환
    - _Requirements: 1.2, 1.5, 2.1, 2.2_

- [x] 3. 북마크 및 완주 API 구현
  - [x] 3.1 코스 북마크 API (`POST /api/routes/[id]/bookmark`)
    - `src/app/api/routes/[id]/bookmark/route.ts`에 토글 방식 북마크 구현
    - 북마크 추가/해제 시 routes 컬렉션의 `bookmarkCount` 증감
    - 중복 북마크 방지 (unique 인덱스 활용)
    - _Requirements: 2.4_

  - [x] 3.2 코스 완주 기록 API (`POST /api/routes/[id]/complete`)
    - `src/app/api/routes/[id]/complete/route.ts`에 완주 기록 엔드포인트 구현
    - 완주 시 인증한 스팟 ID 목록, 소요 시간 기록
    - routes 컬렉션의 `completionCount` 증가
    - _Requirements: 3.5_

  - [x] 3.3 추천 코스 조회 API (`GET /api/routes/recommended`)
    - `src/app/api/routes/recommended/route.ts`에 추천 코스 엔드포인트 구현
    - 공식 추천 코스(isOfficial) 별도 표시
    - 인기 코스(bookmarkCount + completionCount 기준) 자동 추천
    - 작품명 파라미터로 해당 작품 관련 코스 필터링
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 3.4 북마크 및 완주 API 테스트
    - **Property 5: 북마크 토글 라운드트립** — 추가 시 목록 포함, 해제 시 제거, bookmarkCount 정확히 증감
    - **Validates: Requirements 2.4**
    - 단위 테스트: 중복 북마크 방지, 존재하지 않는 코스 북마크 에러, 빈 코스 완주 엣지 케이스
    - _Requirements: 2.4, 3.5_

- [x] 4. Checkpoint - 백엔드 검증
  - 모든 API 테스트 통과 확인, 유저에게 질문이 있으면 문의하세요.

- [x] 5. Zustand 스토어 및 네비게이션 훅 구현
  - [x] 5.1 courseProgressStore 구현
    - `src/stores/courseProgressStore.ts`에 코스 진행 상태 관리 스토어 구현
    - 상태: activeRouteId, activeRoute, currentSpotIndex, checkedSpotIds(Set), startedAt, isNavigating
    - 액션: startRoute (기존 Check-in 기록 조회하여 자동 반영), checkInSpot, moveToNextSpot, endRoute, resetProgress
    - startRoute 시 `GET /api/checkins?userId=...` 호출하여 이미 인증된 스팟 자동 포함
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 5.2 useRouteNavigation 훅 구현
    - `src/hooks/useRouteNavigation.ts`에 네비게이션 로직 훅 구현
    - courseProgressStore + useGeolocation 조합
    - 현재 위치 기반 다음 스팟까지 거리/시간 실시간 계산
    - 진행률 계산: (checkedSpotIds.size / 유효 스팟 수) * 100
    - 완주 판정: 유효 스팟(isAvailable !== false) 전체 인증 시 완주
    - 완주 시 `POST /api/routes/[id]/complete` 호출
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

  - [ ]* 5.3 스토어 및 네비게이션 훅 테스트
    - **Property 6: 네비게이션 시작 시 상태 초기화** — startRoute 후 isNavigating=true, currentSpotIndex=0, activeRouteId 일치, 기존 인증 스팟 자동 포함
    - **Validates: Requirements 3.1**
    - **Property 7: 진행률 계산 정확성** — N개 스팟 중 M개 인증 시 진행률 = (M/N)*100, 0~100 범위
    - **Validates: Requirements 3.4**
    - **Property 8: 완주 판정 정확성** — 유효 스팟 전체 인증 시만 완주, isAvailable:false 스팟 제외
    - **Validates: Requirements 3.5**
    - 단위 테스트: 스팟 0개 엣지 케이스, 중복 인증 처리, endRoute 후 상태 초기화
    - _Requirements: 3.1, 3.4, 3.5_

- [x] 6. 코스 목록 및 상세 페이지 구현
  - [x] 6.1 RouteCard 컴포넌트 구현
    - `src/components/route/RouteCard.tsx`에 코스 카드 컴포넌트 구현
    - 코스명, 스팟 수, 예상 시간, 난이도, 북마크 수, 공식 추천 뱃지 표시
    - _Requirements: 2.1_

  - [x] 6.2 RouteFilterBar 컴포넌트 구현
    - `src/components/route/RouteFilterBar.tsx`에 필터 UI 구현
    - 작품별, 지역별, 소요시간별 필터 + 정렬 옵션 (인기순/최신순/소요시간순)
    - _Requirements: 2.1, 2.2_

  - [x] 6.3 코스 목록 페이지 구현
    - `src/app/routes/page.tsx`에 코스 목록 페이지 구현
    - RouteCard + RouteFilterBar 조합
    - 무한 스크롤 페이지네이션
    - _Requirements: 2.1, 2.2_

  - [x] 6.4 RouteMap 컴포넌트 구현
    - `src/components/route/RouteMap.tsx`에 Leaflet 기반 코스 지도 구현
    - 스팟 마커 + 순서 번호 표시, 스팟 간 Polyline 연결
    - isAvailable:false 스팟은 회색 마커 + 취소선으로 표시
    - ⚠️ 주의: 코스 동선의 순서를 명확히 보여주기 위해 RouteMap에서는 마커 클러스터링(Marker Clustering) 플러그인을 반드시 비활성화해야 함 (마커가 합쳐지면 순서 파악 불가)
    - _Requirements: 2.3_

  - [x] 6.5 코스 상세 페이지 구현
    - `src/app/routes/[id]/page.tsx`에 코스 상세 페이지 구현
    - RouteMap + 스팟 순서 목록 + 스팟 간 이동 거리/시간 표시
    - "코스 시작" / "코스 저장" 버튼
    - 외부 지도 앱(구글맵/야후재팬맵) 연결 버튼
    - 코스 제작자 정보 표시
    - _Requirements: 1.4, 2.3, 2.4, 3.1_

- [x] 7. 코스 생성/수정 페이지 구현
  - [x] 7.1 SpotOrderList 컴포넌트 구현
    - `src/components/route/SpotOrderList.tsx`에 스팟 순서 관리 컴포넌트 구현
    - 드래그 앤 드롭으로 스팟 순서 변경
    - 스팟 간 거리/시간 표시, 스팟별 메모 입력
    - _Requirements: 1.2, 1.3_

  - [x] 7.2 코스 생성 페이지 구현
    - `src/app/routes/create/page.tsx`에 코스 생성 페이지 구현
    - 기본 정보 입력 (코스명, 설명, 예상 소요시간, 난이도)
    - 스팟 검색/선택 UI (지도에서 선택 또는 검색)
    - SpotOrderList로 순서 관리
    - 공개/비공개 설정
    - 미리보기 기능
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 7.3 코스 수정 페이지 구현
    - `src/app/routes/[id]/edit/page.tsx`에 코스 수정 페이지 구현
    - 생성 페이지와 동일한 폼을 기존 데이터로 프리필
    - 작성자만 접근 가능
    - _Requirements: 1.2_

- [x] 8. Checkpoint - 기본 UI 검증
  - 코스 목록/상세/생성/수정 페이지 동작 확인, 유저에게 질문이 있으면 문의하세요.

- [x] 9. 따라가기 모드 (네비게이션) 구현
  - [x] 9.1 NavigationPanel 컴포넌트 구현
    - `src/components/route/NavigationPanel.tsx`에 따라가기 모드 하단 패널 구현
    - 현재 목표 스팟 정보, 다음 스팟까지 거리/시간
    - 진행률 바, 인증(Check-in) 버튼, 코스 종료 버튼
    - isAvailable:false 스팟 건너뛰기 처리
    - ⚠️ 오프라인 대응: 08번 스펙의 useNetworkStatus 훅을 활용하여 오프라인(isOnline === false) 상태일 경우 '외부 지도 앱 연결(경로 탐색)' 버튼을 disabled 처리하고 "오프라인 상태에서는 외부 앱 연결이 불가합니다" 안내 툴팁 표시
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 9.2 코스 상세 페이지에 따라가기 모드 통합
    - 코스 상세 페이지에서 "코스 시작" 클릭 시 NavigationPanel 활성화
    - RouteMap에 현재 위치 마커 표시
    - useRouteNavigation 훅 연결
    - GPS 정확도 낮을 때(accuracy > 100m) 경고 표시
    - _Requirements: 3.1, 3.3_

  - [x] 9.3 완주 처리 및 뱃지/이펙트 구현
    - 모든 유효 스팟 인증 완료 시 완주 기념 시각적 이펙트 표시
    - `POST /api/routes/[id]/complete` 호출하여 완주 기록 저장
    - 프로필에 완주 기록 표시
    - _Requirements: 3.5_

- [x] 10. 오프라인 캐싱 (Service Worker 확장) 구현
  - [x] 10.1 Service Worker 코스 캐시 확장
    - `public/sw.js`에 `ROUTE_CACHE` 추가
    - `PREFETCH_ROUTE` 메시지 핸들러 구현
    - 코스 상세 API, 스팟 상세 API, 썸네일 URL 프리패치
    - _Requirements: 3.6_

  - [x] 10.2 useRouteCache 훅 및 클라이언트 프리패치 유틸리티 구현
    - `src/lib/route-cache.ts`에 `prefetchRouteForOffline` 함수 구현
    - `src/hooks/useRouteCache.ts`에 캐시 상태 관리 훅 구현
    - 코스 시작/저장 시 자동 프리패치 트리거
    - Service Worker 미지원 시 graceful fallback
    - _Requirements: 3.6_

  - [ ]* 10.3 오프라인 캐싱 테스트
    - **Property 9: 오프라인 프리패치 URL 완전성** — 코스 상세 API URL + 모든 스팟 상세 API URL + 썸네일 URL 포함 검증
    - **Validates: Requirements 3.6**
    - 단위 테스트: 썸네일 없는 스팟 처리, 빈 스팟 목록 처리
    - _Requirements: 3.6_

- [x] 11. 추천 코스 UI 및 통합
  - [x] 11.1 코스 목록 페이지에 추천 코스 섹션 추가
    - 공식 추천 코스 별도 섹션 표시
    - 인기 코스 자동 추천 섹션
    - _Requirements: 4.1, 4.2_

  - [x] 11.2 작품 관련 코스 연동
    - 스팟 상세 페이지 또는 작품 페이지에서 해당 작품 관련 추천 코스 표시
    - `GET /api/routes/recommended?contentName=...` 활용
    - _Requirements: 4.3_

- [x] 12. Final Checkpoint - 전체 기능 검증
  - 모든 테스트 통과 확인, 유저에게 질문이 있으면 문의하세요.

## Notes

- `*` 표시된 태스크는 선택사항이며 빠른 MVP를 위해 건너뛸 수 있습니다
- 각 태스크는 특정 Requirements를 참조하여 추적 가능합니다
- Property-Based Test는 `fast-check` 라이브러리, 단위 테스트는 `vitest`를 사용합니다
- 기존 인프라 활용: `geo-utils.ts` (Haversine), `useGeolocation` 훅, `public/sw.js` (PWA), Check-in API (`/api/checkins`)
