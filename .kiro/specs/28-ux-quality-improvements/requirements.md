# Requirements Document

## Introduction

사용자 피드백과 코드 분석을 통해 발견된 UX 품질 이슈들을 일괄 개선하는 기능이다. "좋아하는 작품의 실제 장소를 찾아가고 싶은 팬" 관점에서 발견된 4가지 문제를 해결한다:

1. 갤러리 인증샷 이미지 깨짐 (Critical)
2. 지도 스팟 클릭 시 상세 페이지 미이동 (Critical)
3. 순례 코스 가이드 모드 개선 (Enhancement)
4. 작품별 스팟 모아보기 부재 (Enhancement)

## Glossary

- **Feed_Grid**: `FeedTab.tsx`의 `FeedGridItem` 컴포넌트. 갤러리 피드에서 인증샷을 3열 정사각형 그리드로 표시하는 UI 요소
- **Comparison_Card**: `ComparisonCard.tsx` 컴포넌트. 작품 원본 캡처와 유저 인증샷을 split view로 비교 표시하는 카드
- **Fallback_Image**: 이미지 로드 실패 시 대체로 표시되는 플레이스홀더 이미지 (`/images/placeholder-spot.jpg`)
- **Map_Page**: `/map` 경로의 지도 메인 페이지. Leaflet 기반 PilgrimageMap 컴포넌트를 포함
- **Spot_Marker**: 지도 위에 표시되는 스팟 위치 마커. 클릭 시 스팟 정보를 제공
- **Spot_Detail_Page**: `/spots/[id]` 경로의 스팟 상세 페이지. SpotDetailClient 컴포넌트로 구성
- **Navigation_Panel**: `NavigationPanel.tsx` 컴포넌트. 코스 따라가기 모드에서 하단에 표시되는 실시간 추적 패널
- **Guide_Panel**: 코스 가이드 모드에서 사용할 체크리스트 형태의 안내 패널. Navigation_Panel을 대체
- **Route_Detail_Page**: `/routes/[id]` 경로의 코스 상세 페이지. RouteDetailContent 컴포넌트로 구성
- **Content_Spots_Page**: 특정 작품에 연결된 모든 스팟을 모아 보여주는 전용 페이지
- **Related_Content**: 스팟에 연결된 작품 정보 (이름, 타입, 연도 등). `relatedContent` 필드로 저장
- **Content_Name**: 작품의 이름. 스팟의 `relatedContent.name` 필드에 저장되며 검색 및 필터링의 기준

## Requirements

### Requirement 1: 갤러리 피드 이미지 에러 핸들링

**User Story:** 팬으로서, 갤러리에서 인증샷 이미지가 로드 실패해도 깨진 아이콘 대신 의미 있는 대체 이미지를 보고 싶다. 그래야 갤러리 탐색 경험이 끊기지 않는다.

#### Acceptance Criteria

1. WHEN Feed_Grid의 인증샷 이미지 로드가 실패하면, THE Feed_Grid SHALL Fallback_Image를 대체 표시한다
2. WHEN Feed_Grid의 인증샷 이미지 로드가 실패하면, THE Feed_Grid SHALL 깨진 이미지 아이콘을 표시하지 않고 Fallback_Image로 즉시 전환한다
3. THE Feed_Grid SHALL Comparison_Card와 동일한 `onError` + fallback 패턴을 사용하여 이미지 에러를 처리한다
4. WHEN Fallback_Image가 표시된 상태에서도, THE Feed_Grid SHALL 호버 오버레이와 클릭 이벤트를 정상 동작시킨다

### Requirement 2: 지도 스팟 마커 클릭 네비게이션

**User Story:** 팬으로서, 지도에서 스팟 마커를 클릭하면 해당 스팟의 상세 페이지로 이동하고 싶다. 그래야 지도에서 발견한 스팟의 상세 정보를 바로 확인할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 Map_Page에서 Spot_Marker를 클릭하면, THE Map_Page SHALL Spot_Detail_Page(`/spots/[id]`)로 이동한다
2. THE Map_Page SHALL `handleSpotSelect` 함수에서 `console.log`만 실행하는 현재 동작을 `router.push`를 사용한 페이지 이동으로 교체한다
3. WHEN Spot_Marker 클릭으로 페이지 이동이 발생하면, THE Map_Page SHALL 클릭된 스팟의 `spotId`를 경로 파라미터로 사용한다

### Requirement 3: 순례 코스 체크리스트 가이드 모드

**User Story:** 팬으로서, 순례 코스를 시작하면 실시간 추적 대신 체크리스트 형태의 가이드를 받고 싶다. 그래야 자유롭게 코스를 따라가면서 각 스팟을 하나씩 체크할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 Route_Detail_Page에서 "코스 시작" 버튼을 클릭하면, THE Route_Detail_Page SHALL Navigation_Panel 대신 Guide_Panel을 표시한다
2. THE Guide_Panel SHALL 코스의 모든 스팟을 순서대로 체크리스트 형태로 표시한다
3. THE Guide_Panel SHALL 각 스팟 항목에 스팟 이름, 다음 스팟까지의 거리, 예상 이동 시간을 표시한다
4. THE Guide_Panel SHALL 각 스팟 항목에 외부 지도 앱 길찾기 버튼을 제공한다
5. WHEN 사용자가 특정 스팟에 도착하면, THE Guide_Panel SHALL 해당 스팟 항목에 "여기서 인증하기" 버튼을 표시한다
6. WHEN 사용자가 "여기서 인증하기" 버튼을 클릭하면, THE Guide_Panel SHALL 해당 스팟의 Spot_Detail_Page로 이동하여 인증 절차를 진행한다
7. THE Guide_Panel SHALL 전체 코스 진행률을 백분율과 프로그레스 바로 표시한다
8. WHEN 스팟 인증이 완료되면, THE Guide_Panel SHALL 해당 스팟 항목을 완료 상태(체크 표시)로 변경한다
9. WHILE 코스 가이드 모드가 활성화된 상태에서, THE Guide_Panel SHALL 소실된 스팟(`isAvailable === false`)을 비활성 상태로 표시하고 건너뛰기를 허용한다
10. IF 사용자의 GPS 정확도가 100m를 초과하면, THEN THE Guide_Panel SHALL GPS 정확도 경고 메시지를 표시한다

### Requirement 4: 작품별 스팟 모아보기

**User Story:** 팬으로서, 특정 작품과 관련된 모든 스팟을 한 페이지에서 모아보고 싶다. 그래야 좋아하는 작품의 성지순례를 효율적으로 계획할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 Content_Spots_Page(`/contents/[name]`)에 접근하면, THE Content_Spots_Page SHALL 해당 Content_Name과 연결된 모든 스팟 목록을 표시한다
2. THE Content_Spots_Page SHALL 작품 이름, 작품 타입, 연도 정보를 헤더에 표시한다
3. THE Content_Spots_Page SHALL 각 스팟을 카드 형태로 표시하며, 스팟 이름, 대표 사진, 주소, 카테고리를 포함한다
4. WHEN 사용자가 스팟 카드를 클릭하면, THE Content_Spots_Page SHALL 해당 Spot_Detail_Page로 이동한다
5. THE Content_Spots_Page SHALL 스팟 목록을 지도 위에 마커로 함께 표시한다
6. WHEN Spot_Detail_Page에서 Related_Content가 존재하면, THE Spot_Detail_Page SHALL "같은 작품의 다른 스팟" 섹션을 표시한다
7. WHEN 사용자가 "같은 작품의 다른 스팟" 항목을 클릭하면, THE Spot_Detail_Page SHALL 해당 스팟의 Spot_Detail_Page로 이동한다
8. THE Content_Spots_Page SHALL 기존 `/api/spots` 엔드포인트의 `search` 파라미터를 활용하여 `relatedContent.name` 기준으로 스팟을 조회한다
9. IF 해당 Content_Name과 연결된 스팟이 없으면, THEN THE Content_Spots_Page SHALL "등록된 스팟이 없습니다" 빈 상태 메시지를 표시한다
