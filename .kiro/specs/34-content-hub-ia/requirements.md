# Requirements Document

## Introduction

"Not a Trip" 서비스의 정보 구조(IA)를 재구성하여, 첫 진입 사용자가 서비스의 핵심 기능(작품 탐색, 코스 실행, 인증 업로드)을 즉시 이해하고 목적에 맞는 경로로 진입할 수 있도록 한다. 특히 작품 팬 유저를 위한 전용 허브 구조를 도입하여, 작품 중심의 탐색 흐름을 서비스의 대표 경로로 승격시킨다.

## Glossary

- **Header**: 모든 페이지 상단에 고정되는 글로벌 네비게이션 컴포넌트 (`src/components/layout/Header.tsx`)
- **Content_List_Page**: 전체 작품 목록을 탐색할 수 있는 신규 페이지 (`/contents`)
- **Content_Hub_Page**: 특정 작품의 허브 역할을 하는 상세 페이지 (`/contents/[name]`)
- **Landing_Page**: 신규 사용자가 처음 보는 환영 페이지 (`/welcome`)
- **Entry_Point_Section**: 랜딩 페이지 내 목적별 병렬 진입점을 제공하는 섹션
- **Map_Search**: 지도 페이지의 콘텐츠 검색 자동완성 컴포넌트 (`ContentSearchFilter`)
- **Autocomplete_Dropdown**: 검색 입력 시 표시되는 자동완성 결과 드롭다운
- **Representative_Spot**: 작품 허브 페이지에서 인증 수 또는 등록 순서 기준으로 선정된 대표 스팟
- **Related_Course**: 작품과 연관된 순례 코스
- **Recent_Certification**: 작품 관련 스팟에서 최근 등록된 인증 피드

## Requirements

### Requirement 1: 헤더 네비게이션 IA 재구성

**User Story:** 사용자로서, 헤더 네비게이션에서 "작품 탐색" 메뉴를 통해 작품 목록 페이지에 바로 접근하고 싶다. 이를 통해 작품 중심 탐색이 서비스의 핵심 기능임을 즉시 인지할 수 있다.

#### Acceptance Criteria

1. THE Header SHALL 데스크톱 네비게이션에 "작품 탐색" 링크를 "홈" 다음 위치에 표시한다
2. THE Header SHALL 모바일 드롭다운 메뉴에 "작품 탐색" 항목을 "홈" 다음 위치에 표시한다
3. WHEN 사용자가 "작품 탐색" 링크를 클릭하면, THE Header SHALL `/contents` 경로로 이동시킨다
4. WHILE 사용자가 `/contents` 또는 `/contents/[name]` 경로에 있을 때, THE Header SHALL "작품 탐색" 링크를 활성 상태로 표시한다

### Requirement 2: 작품 목록 페이지 신규 생성

**User Story:** 사용자로서, 서비스에 등록된 모든 작품을 한눈에 탐색할 수 있는 목록 페이지가 필요하다. 이를 통해 관심 있는 작품을 빠르게 찾고 해당 작품의 허브 페이지로 이동할 수 있다.

#### Acceptance Criteria

1. THE Content_List_Page SHALL `/contents` 경로에서 접근 가능하다
2. THE Content_List_Page SHALL 등록된 모든 작품을 카드 형태의 그리드 레이아웃으로 표시한다
3. THE Content_List_Page SHALL 각 작품 카드에 작품명, 작품 타입, 등록된 스팟 수, 대표 이미지를 표시한다
4. WHEN 사용자가 작품 카드를 클릭하면, THE Content_List_Page SHALL 해당 작품의 Content_Hub_Page(`/contents/[name]`)로 이동시킨다
5. THE Content_List_Page SHALL 작품 타입(애니메이션, 영화, 드라마, 스포츠 팀, 아티스트, 게임, 기타)별 필터링 기능을 제공한다
6. THE Content_List_Page SHALL 작품명 검색 기능을 제공한다
7. WHEN 등록된 작품이 없을 때, THE Content_List_Page SHALL 빈 상태 안내 메시지를 표시한다

### Requirement 3: 작품 허브 페이지 승격

**User Story:** 특정 작품 팬으로서, 작품 페이지에서 대표 스팟, 관련 코스, 최근 인증을 한 곳에서 확인하고 싶다. 이를 통해 작품 관련 모든 정보를 허브 페이지에서 탐색할 수 있다.

#### Acceptance Criteria

1. THE Content_Hub_Page SHALL 작품 개요 섹션에 작품명, 작품 타입, 연도, 대표 이미지, 총 스팟 수, 총 인증 수를 표시한다
2. THE Content_Hub_Page SHALL 대표 스팟 섹션에 인증 수 기준 상위 3개 스팟을 카드 형태로 표시한다
3. WHEN 대표 스팟이 3개 미만일 때, THE Content_Hub_Page SHALL 등록된 모든 스팟을 대표 스팟으로 표시한다
4. THE Content_Hub_Page SHALL 관련 코스 섹션에 해당 작품과 연관된 순례 코스 목록을 표시한다
5. WHEN 관련 코스가 없을 때, THE Content_Hub_Page SHALL 관련 코스 섹션을 숨긴다
6. THE Content_Hub_Page SHALL 최근 인증 섹션에 해당 작품 관련 스팟의 최근 인증 피드를 최대 6개 표시한다
7. WHEN 최근 인증이 없을 때, THE Content_Hub_Page SHALL 최근 인증 섹션에 "아직 인증이 없습니다" 안내를 표시한다
8. THE Content_Hub_Page SHALL 전체 스팟 보기 링크를 제공하여 기존 스팟 목록+지도 뷰로 이동할 수 있게 한다
9. THE Content_Hub_Page SHALL 개요, 대표 스팟, 관련 코스, 최근 인증, 전체 스팟 순서로 섹션을 배치한다

### Requirement 4: 랜딩 페이지 목적별 진입점 추가

**User Story:** 첫 방문 사용자로서, 랜딩 페이지에서 "작품으로 찾기", "코스로 따라가기", "인증 둘러보기" 중 내 목적에 맞는 진입점을 선택하고 싶다. 이를 통해 서비스가 제공하는 핵심 기능을 즉시 이해하고 원하는 흐름으로 진입할 수 있다.

#### Acceptance Criteria

1. THE Landing_Page SHALL Entry_Point_Section을 HeroSection 아래에 배치한다
2. THE Entry_Point_Section SHALL "작품으로 찾기", "코스로 따라가기", "인증 둘러보기" 3개의 진입점을 병렬로 표시한다
3. THE Entry_Point_Section SHALL 각 진입점에 아이콘, 제목, 간단한 설명을 포함한다
4. WHEN 사용자가 "작품으로 찾기" 진입점을 클릭하면, THE Entry_Point_Section SHALL `/contents` 경로로 이동시킨다
5. WHEN 사용자가 "코스로 따라가기" 진입점을 클릭하면, THE Entry_Point_Section SHALL `/routes` 경로로 이동시킨다
6. WHEN 사용자가 "인증 둘러보기" 진입점을 클릭하면, THE Entry_Point_Section SHALL `/gallery` 경로로 이동시킨다
7. THE Entry_Point_Section SHALL 모바일에서 세로 스택, 태블릿 이상에서 가로 병렬 레이아웃으로 반응형 표시한다

### Requirement 5: 지도 검색 자동완성에서 작품 페이지 연결

**User Story:** 지도에서 작품을 검색하는 사용자로서, 자동완성 결과에서 작품 페이지로 바로 이동할 수 있는 옵션을 보고 싶다. 이를 통해 검색 결과에서 작품 허브 페이지로 빠르게 전환할 수 있다.

#### Acceptance Criteria

1. WHEN 자동완성 결과에 작품이 표시될 때, THE Autocomplete_Dropdown SHALL 각 작품 항목에 "작품 페이지로 이동" 링크를 함께 표시한다
2. WHEN 사용자가 "작품 페이지로 이동" 링크를 클릭하면, THE Autocomplete_Dropdown SHALL 해당 작품의 Content_Hub_Page(`/contents/[name]`)로 이동시킨다
3. THE Autocomplete_Dropdown SHALL 기존 작품 선택(지도 필터링) 동작을 유지하면서 추가 링크를 제공한다

### Requirement 6: 작품 페이지 뒤로가기 개선

**User Story:** 작품 허브 페이지를 탐색하는 사용자로서, 뒤로가기 버튼이 이전 페이지로 정확히 돌아가길 원한다. 이를 통해 작품 목록에서 왔으면 목록으로, 지도에서 왔으면 지도로 자연스럽게 복귀할 수 있다.

#### Acceptance Criteria

1. THE Content_Hub_Page SHALL 뒤로가기 버튼을 상단에 표시한다
2. WHEN 브라우저 히스토리에 이전 페이지가 존재할 때, THE Content_Hub_Page SHALL 뒤로가기 클릭 시 브라우저 히스토리 back을 실행한다
3. WHEN 브라우저 히스토리에 이전 페이지가 없을 때(직접 URL 진입), THE Content_Hub_Page SHALL 뒤로가기 클릭 시 `/contents` 경로로 이동시킨다
4. THE Content_Hub_Page SHALL 뒤로가기 버튼의 레이블을 "작품 목록으로" 로 표시한다
