# Requirements Document

## Introduction

지도 메인 페이지(Home)의 UI/UX를 전면 개편한다. 로딩 스피너 배경색 변경, 필터 영역 레이아웃·위치·검색 통합 개편, 지도 타일의 "일본해" 표기 문제 해결, 그리고 이에 따른 부수적 UI 조정(LocationButton 위치, EmptyFilterOverlay 문구, map.css 배경색, attribution 텍스트)을 포함한다. 모든 변경은 단일 브랜치에서 수행한다.

## Glossary

- **Map_Page**: 메인 페이지(`src/app/page.tsx`)의 지도 기반 UI 전체
- **SpotLoadingSkeleton**: 초기 스팟 데이터 로딩 시 표시되는 전체 화면 로딩 컴포넌트 (`src/components/common/SpotLoadingSkeleton.tsx`)
- **Filter_Bar**: 검색 입력창과 카테고리 필터 버튼을 하나의 바로 통합한 UI 영역
- **CategoryFilter**: 카테고리별 스팟 필터링 버튼 그룹 컴포넌트 (`src/components/map/CategoryFilter.tsx`)
- **ContentSearchFilter**: 콘텐츠 검색 입력 컴포넌트 (`src/components/map/ContentSearchFilter.tsx`)
- **TileLayer**: Leaflet 지도 타일 레이어 (`react-leaflet`의 `TileLayer` 컴포넌트)
- **LocationButton**: 현재 위치로 이동하는 GPS 버튼 컴포넌트 (`src/components/mobile/LocationButton.tsx`)
- **EmptyFilterOverlay**: 카테고리 전체 해제 시 표시되는 빈 상태 오버레이 (`src/components/common/EmptyFilterOverlay.tsx`)
- **PilgrimageMap**: Leaflet 기반 지도 컨테이너 컴포넌트 (`src/components/map/PilgrimageMap.tsx`)
- **Attribution_Badge**: 지도 좌측 하단의 서비스명 표시 배지 (PilgrimageMap 내부)

## Requirements

### Requirement 1: 로딩 스피너 배경색 변경

**User Story:** 사용자로서, 초기 스팟 데이터 로딩 시 눈이 편안한 배경색을 보고 싶다. 현재 보라색(bg-primary-800) 배경이 너무 강렬하다.

#### Acceptance Criteria

1. THE SpotLoadingSkeleton SHALL 배경색으로 neutral 톤(bg-neutral-800)을 사용한다
2. THE SpotLoadingSkeleton SHALL 스피너 아이콘과 로딩 텍스트의 가독성을 neutral 배경 위에서 유지한다

### Requirement 2: 필터 바 레이아웃 — 1줄 가로 스크롤

**User Story:** 사용자로서, 화면 너비가 좁아져도 카테고리 필터 버튼이 줄바꿈 없이 가로 스크롤로 탐색되길 원한다 (에어비앤비 스타일).

#### Acceptance Criteria

1. THE CategoryFilter SHALL flex-wrap 대신 가로 스크롤(overflow-x-auto) 레이아웃을 사용한다
2. WHILE 화면 너비가 좁은 상태에서, THE CategoryFilter SHALL 카테고리 버튼을 줄바꿈 없이 단일 행으로 유지한다
3. THE CategoryFilter SHALL 모바일 환경에서 스크롤바를 숨기되 터치 스크롤은 허용한다
4. THE CategoryFilter SHALL 데스크톱 환경에서도 가로 스크롤 동작을 지원한다

### Requirement 3: 검색과 카테고리 필터 통합 바

**User Story:** 사용자로서, 별도의 돋보기 버튼을 클릭하지 않고 하나의 통합 바에서 바로 검색어를 입력하고 카테고리를 스크롤하고 싶다.

#### Acceptance Criteria

1. THE Filter_Bar SHALL 검색 입력창과 카테고리 스크롤 영역을 [🔍 검색 입력창 | 구분선 | 카테고리 스크롤] 형태로 하나의 바 안에 통합한다
2. THE Filter_Bar SHALL 검색 입력창을 항상 노출하여 클릭 없이 바로 타이핑 가능하게 한다
3. THE Filter_Bar SHALL 검색 입력창과 카테고리 영역 사이에 시각적 구분선을 표시한다
4. THE ContentSearchFilter SHALL 기존의 토글(접기/펼치기) 동작을 제거하고 항상 펼쳐진 상태로 표시한다
5. WHEN 검색어를 입력하면, THE ContentSearchFilter SHALL 기존 자동완성 드롭다운 기능을 유지한다
6. WHEN 사용자가 검색어를 입력할 때, THE ContentSearchFilter SHALL 디바운스(Debounce, 약 300ms) 처리를 적용하여 불필요한 지도 마커 리렌더링 과부하를 방지한다

### Requirement 4: 필터 바 위치 이동 — 하단에서 상단으로

**User Story:** 사용자로서, 모바일에서 하단 제스처 영역과 필터가 충돌하지 않도록 필터 바가 헤더 바로 아래에 위치하길 원한다.

#### Acceptance Criteria

1. THE Filter_Bar SHALL 하단 중앙(absolute bottom-6) 대신 상단 헤더 바로 아래에 위치한다
2. THE Filter_Bar SHALL 지도 위에 플로팅 오버레이로 표시되어 지도 콘텐츠를 가리지 않는다
3. THE Filter_Bar SHALL 모바일과 데스크톱 모두에서 상단 위치를 유지한다
4. THE Filter_Bar SHALL z-[1000] 이상의 z-index를 가져 지도 핀이나 컨트롤에 가려지지 않아야 한다

### Requirement 5: 지도 타일 한국어 라벨 변경

**User Story:** 사용자로서, 지도에서 동해가 "일본해(Sea of Japan)"로 표기되는 것을 원하지 않는다. 한국어 라벨이 적용된 타일로 변경되어야 한다.

> **⚠️ 기술 제약 사항**: 현재 사용 중인 CARTO Voyager 래스터 타일은 이미 렌더링된 이미지이므로 URL 파라미터로 라벨 언어를 변경할 수 없다. 래스터 타일 자체의 한계이며, 언어 변경이 가능한 것은 벡터 타일(MapTiler, Protomaps 등)뿐이다. 따라서 래스터 타일 범위 내에서 가능한 대안을 적용한다.
>
> **대안 옵션:**
> 1. **288255.xyz 무료 래스터 타일** — OpenFreeMap 벡터 타일을 래스터로 렌더링한 서비스. 무료, API 키 불필요. 단, SLA 없음 (best-effort). OSM 기본 `name` 태그 사용 (일본 지역은 일본어 라벨).
> 2. **OpenStreetMap 기본 타일** (`tile.openstreetmap.org`) — OSM 기본 스타일. 무료. `name` 태그 기반으로 동해는 "日本海 (Sea of Japan / East Sea)" 병기 표시.
> 3. **MapTiler 벡터 타일** — `language=ko` 파라미터로 한국어 라벨 완전 지원. 단, API 키 필요 + 무료 티어 제한(월 10만 요청).
> 4. **VWorld 타일** — 한국 정부 제공 타일. 한국어 라벨 + 동해 표기. API 키 필요. 한국 영토 외 커버리지 제한적.
>
> **권장**: 일본 지역 여행지가 주 콘텐츠이므로, 일본어 라벨이 오히려 현지감을 줄 수 있다. "일본해" 표기만 문제라면, 해당 줌 레벨에서 바다 라벨이 보이지 않는 수준(줌 6 이상)에서는 큰 이슈가 아닐 수 있다. 근본적 해결을 위해서는 MapTiler 벡터 타일 전환이 필요하나, 비용과 복잡도가 증가한다.

#### Acceptance Criteria

1. THE TileLayer SHALL 현재 CARTO Voyager 타일의 한국어 라벨 미지원 한계를 인지하고, 가능한 범위 내에서 대안 타일 프로바이더를 적용한다
2. THE TileLayer SHALL 변경 후에도 기존과 동일한 줌 레벨 범위(maxZoom 19)를 지원한다
3. THE TileLayer SHALL 변경 후에도 지도 렌더링 품질과 로딩 속도를 유지한다
4. IF 무료 래스터 타일로 전환할 경우, THE TileLayer SHALL 기존 CARTO Voyager와 유사한 시각적 톤을 유지하는 프로바이더를 선택한다

### Requirement 6: 줌 컨트롤 및 LocationButton 위치 재조정

**User Story:** 사용자로서, 필터 바가 상단으로 이동한 후에도 줌 컨트롤과 현재 위치 버튼이 필터 바와 겹치지 않고 적절한 위치에 있어 쉽게 접근할 수 있길 원한다.

#### Acceptance Criteria

1. WHEN 필터 바가 상단으로 이동하면, THE LocationButton SHALL 하단 우측에 위치하되 기존 bottom-20(모바일)을 bottom-4로 통일한다
2. THE LocationButton SHALL 모바일과 데스크톱 모두에서 동일한 하단 우측 위치(bottom-4 right-4)를 사용한다
3. WHEN 필터 바가 상단으로 이동하면, THE 커스텀 줌 컨트롤(Zoom In/Out) SHALL 상단(top-4) 영역을 피하여 LocationButton 위쪽이나 필터 바를 가리지 않는 우측 하단/중단 영역으로 이동한다

### Requirement 7: EmptyFilterOverlay 문구 수정

**User Story:** 사용자로서, 필터 바가 상단으로 이동했으므로 "아래 필터에서"라는 방향 지시 문구가 혼란을 주지 않아야 한다.

#### Acceptance Criteria

1. THE EmptyFilterOverlay SHALL "아래 필터에서 원하는 카테고리를 선택하세요" 문구를 방향 무관한 문구로 변경한다
2. THE EmptyFilterOverlay SHALL 변경된 문구에서도 사용자가 카테고리 선택 행동을 유도받을 수 있어야 한다

### Requirement 8: 지도 컨테이너 배경색 변경

**User Story:** 사용자로서, 지도 타일 로딩 전 배경색이 연보라(#eeedfc)가 아닌 neutral 톤이어서 전체 UI 톤과 일관되길 원한다.

#### Acceptance Criteria

1. THE PilgrimageMap SHALL map.css의 `.leaflet-container` 배경색을 #eeedfc(연보라)에서 neutral 톤으로 변경한다
2. THE PilgrimageMap SHALL 다크 모드에서도 적절한 neutral 배경색을 적용한다

### Requirement 9: Attribution 텍스트 변경

**User Story:** 사용자로서, 지도 좌측 하단의 서비스명이 리브랜딩된 "Not a Trip"으로 표시되어야 한다.

#### Acceptance Criteria

1. THE Attribution_Badge SHALL "Anime Pilgrim" 텍스트를 "Not a Trip"으로 변경한다
2. THE Attribution_Badge SHALL 변경 후에도 기존 스타일(bg-primary-800/80, 텍스트 흰색)을 유지한다

### Requirement 10: 데스크톱 정보 패널 위치 검토

**User Story:** 사용자로서, 필터 바가 상단으로 이동한 후 데스크톱 정보 패널(스팟 개수 표시)이 필터 바와 겹치지 않아야 한다.

#### Acceptance Criteria

1. WHEN 필터 바가 상단에 위치하면, THE Map_Page SHALL 데스크톱 정보 패널의 위치를 필터 바와 겹치지 않도록 조정한다
2. THE Map_Page SHALL 데스크톱 정보 패널이 필터 바 아래 또는 지도 내 다른 적절한 위치에 표시되도록 한다
