# 구현 계획: UX 품질 개선

## 개요

4가지 독립적인 UX 품질 이슈를 순차적으로 개선한다. 각 이슈는 기존 코드 패턴과 API를 최대한 재활용하며, Critical 이슈(이미지 에러 핸들링, 마커 클릭 네비게이션)를 먼저 처리한 후 Enhancement(가이드 모드, 작품별 스팟)를 구현한다.

## Tasks

- [x] 1. 갤러리 피드 이미지 에러 핸들링 구현
  - `src/components/gallery/FeedTab.tsx`의 `FeedGridItem` 컴포넌트 수정
  - `useState(false)`로 `imageError` 상태 추가
  - `Image` 컴포넌트에 `onError={() => setImageError(true)}` 핸들러 추가
  - `src`를 `imageError ? '/images/placeholder-spot.jpg' : checkIn.photoUrl` 삼항 연산자로 변경
  - `ComparisonCard.tsx`의 기존 패턴을 그대로 따름
  - 호버 오버레이와 클릭 이벤트는 기존 코드 유지
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. 지도 스팟 마커 클릭 네비게이션 구현
  - [x] 2.1 `handleSpotSelect`에 `router.push` 적용
    - `src/app/(main)/map/page.tsx`의 `MapContent` 컴포넌트 수정
    - `useRouter` import 추가 (`next/navigation`)
    - `handleSpotSelect` 함수에서 `console.log`를 `router.push(`/spots/${spotId}`)` 로 교체
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.2 spotId → URL 매핑 속성 테스트 작성
    - **Property 1: 스팟 ID → URL 매핑 정확성**
    - 임의의 spotId 문자열에 대해 `router.push`가 `/spots/${spotId}` 경로로 호출되는지 검증
    - fast-check 100회 이상 실행, 태그: `Feature: ux-quality-improvements, Property 1: spotId URL mapping`
    - **Validates: Requirements 2.3**

- [x] 3. 체크포인트 — Critical 이슈 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. 순례 코스 체크리스트 가이드 모드 구현
  - [x] 4.1 GuidePanel 컴포넌트 생성
    - `src/components/route/GuidePanel.tsx` 신규 파일 생성
    - `GuidePanelProps` 인터페이스 구현 (spots, checkedSpotIds, currentSpotIndex, progress, currentPosition, accuracy, onCheckIn, onEndRoute, isCompleted)
    - 코스의 모든 스팟을 순서대로 체크리스트 형태로 렌더링
    - 각 스팟 항목에 스팟 이름, 다음 스팟까지의 거리(`distanceFromPrev`), 예상 이동 시간(`walkTimeFromPrev`) 표시
    - 각 스팟 항목에 `DirectionsButton` 컴포넌트를 재활용한 외부 지도 앱 길찾기 버튼 제공
    - 인증 완료 스팟은 체크 표시로 완료 상태 변경
    - "여기서 인증하기" 버튼 → `onCheckIn(spotId)` 호출로 스팟 상세 페이지 이동
    - 전체 코스 진행률을 백분율 + 프로그레스 바로 표시
    - `isAvailable === false`인 소실 스팟은 비활성 스타일(line-through, 회색 배경) + "건너뛰기" 표시
    - GPS 정확도 100m 초과 시 경고 메시지 표시
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x] 4.2 RouteDetailContent에서 NavigationPanel을 GuidePanel로 교체
    - `src/components/route/RouteDetailContent.tsx` 수정
    - `NavigationPanel` import를 `GuidePanel`로 변경
    - 코스 시작 시 GuidePanel이 표시되도록 props 연결
    - 기존 `nav` 훅의 상태를 GuidePanel props에 매핑
    - _Requirements: 3.1_

  - [x] 4.3 GuidePanel 스팟 목록 렌더링 완전성 속성 테스트
    - **Property 2: GuidePanel 스팟 목록 렌더링 완전성**
    - 임의의 RouteSpot 배열에 대해 모든 스팟이 순서대로 렌더링되고 spotName, distanceFromPrev, walkTimeFromPrev 정보가 포함되는지 검증
    - fast-check 100회 이상 실행, 태그: `Feature: ux-quality-improvements, Property 2: GuidePanel spot list completeness`
    - **Validates: Requirements 3.2, 3.3**

  - [x] 4.4 코스 진행률 계산 정확성 속성 테스트
    - **Property 3: 코스 진행률 계산 정확성**
    - 임의의 스팟 목록과 체크된 스팟 ID 집합에 대해 진행률이 `(유효 스팟 중 체크된 수 / 전체 유효 스팟 수) × 100`과 일치하는지 검증
    - fast-check 100회 이상 실행, 태그: `Feature: ux-quality-improvements, Property 3: progress calculation accuracy`
    - **Validates: Requirements 3.7**

  - [x] 4.5 소실 스팟 비활성 처리 속성 테스트
    - **Property 4: 소실 스팟 비활성 처리**
    - 임의의 RouteSpot 배열에서 `isAvailable === false`인 스팟이 비활성 스타일로 렌더링되고 인증 버튼 대신 "건너뛰기" 표시가 있는지 검증
    - fast-check 100회 이상 실행, 태그: `Feature: ux-quality-improvements, Property 4: unavailable spot deactivation`
    - **Validates: Requirements 3.9**

- [x] 5. 작품별 스팟 모아보기 구현
  - [x] 5.1 Content_Spots_Page 신규 페이지 및 클라이언트 컴포넌트 생성
    - `src/app/(main)/contents/[name]/page.tsx` 서버 컴포넌트 생성
    - `params.name`을 `decodeURIComponent`로 디코딩하여 `ContentSpotsClient`에 전달
    - `src/components/content/ContentSpotsClient.tsx` 클라이언트 컴포넌트 생성
    - `useSpots` 훅 또는 `/api/spots?search={contentName}` API를 활용하여 스팟 조회
    - 헤더에 작품 이름, 작품 타입, 연도 정보 표시
    - 스팟을 카드 형태로 표시 (스팟 이름, 대표 사진, 주소, 카테고리 포함)
    - 카드 클릭 시 `/spots/{id}`로 이동
    - 스팟 목록을 지도 위에 마커로 함께 표시 (PilgrimageMap 또는 SpotDetailMap 재활용)
    - 스팟 0건일 때 "등록된 스팟이 없습니다" 빈 상태 메시지 표시
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.8, 4.9_

  - [x] 5.2 SameContentSpots 컴포넌트 생성 및 SpotDetailClient 연동
    - `src/components/spot/SameContentSpots.tsx` 신규 컴포넌트 생성
    - `currentSpotId`와 `relatedContent` props를 받아 첫 번째 relatedContent.name 기준으로 `/api/spots?search={name}` 호출
    - 현재 스팟은 결과에서 제외하여 "같은 작품의 다른 스팟" 목록 표시
    - 각 항목 클릭 시 해당 스팟의 상세 페이지로 이동
    - `src/components/spot/SpotDetailClient.tsx`의 `SpotDetailContent`에 SameContentSpots 섹션 추가
    - `relatedContent`가 존재할 때만 섹션 렌더링
    - _Requirements: 4.6, 4.7_

  - [x] 5.3 스팟 카드 필수 정보 포함 속성 테스트
    - **Property 5: 스팟 카드 필수 정보 포함**
    - 임의의 SpotPin 데이터에 대해 스팟 카드 렌더링 결과에 스팟 이름(`name`)과 카테고리 정보가 포함되는지 검증
    - fast-check 100회 이상 실행, 태그: `Feature: ux-quality-improvements, Property 5: spot card required info`
    - **Validates: Requirements 4.3**

- [x] 6. 최종 체크포인트 — 전체 기능 검증
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 Requirements를 참조하여 추적 가능
- 체크포인트에서 증분 검증 수행
- 속성 테스트는 설계 문서의 Correctness Properties를 검증
- 단위 테스트는 특정 시나리오와 에지 케이스를 검증
