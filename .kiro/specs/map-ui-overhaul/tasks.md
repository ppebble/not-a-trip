# 구현 계획: Map UI Overhaul

## 개요

지도 메인 페이지의 UI/UX 전면 개편을 단계적으로 구현한다. 낮은 영향도의 단순 변경부터 시작하여 점진적으로 복잡한 레이아웃 변경으로 진행하며, 각 단계에서 기존 기능이 깨지지 않도록 검증한다. 모든 변경은 기존 컴포넌트 구조를 유지하면서 진행한다.

## Tasks

- [x] 1. 단순 UI 텍스트/색상 변경
  - [x] 1.1 SpotLoadingSkeleton 배경색 변경
    - `src/components/common/SpotLoadingSkeleton.tsx`에서 `bg-primary-800` → `bg-neutral-800`으로 변경
    - _Requirements: 1.1_
  - [x] 1.2 EmptyFilterOverlay 문구 변경
    - `src/components/common/EmptyFilterOverlay.tsx`에서 "아래 필터에서 원하는 카테고리를 선택하세요" → "필터에서 원하는 카테고리를 선택하세요"로 변경
    - _Requirements: 7.1, 7.2_
  - [x] 1.3 map.css 배경색 및 다크 모드 추가
    - `src/components/map/map.css`에서 `.leaflet-container` 배경색 `#eeedfc` → `#f4f4f5`로 변경
    - `.dark .leaflet-container { background: #27272a; }` 다크 모드 규칙 추가
    - _Requirements: 8.1, 8.2_
  - [x] 1.4 Attribution 텍스트 변경
    - `src/components/map/PilgrimageMap.tsx`에서 "Anime Pilgrim" → "Not a Trip"으로 변경
    - _Requirements: 9.1, 9.2_

- [x] 2. PilgrimageMap 컨트롤 위치 및 타일 변경
  - [x] 2.1 TileLayer URL을 OSM 기본 타일로 변경
    - `url` prop: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` (288255.xyz 서버 다운으로 OSM 폴백)
    - `attribution` prop: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`
    - `maxZoom={19}` 유지
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 2.2 줌 컨트롤 위치 변경
    - `absolute right-4 top-4` → `absolute right-4 bottom-20`으로 변경
    - LocationButton(bottom-4) 위에 위치하여 우측 하단 컨트롤 그룹 형성
    - _Requirements: 6.3_
  - [x] 2.3 LocationButton 위치 통일
    - `absolute bottom-20 right-4 z-[1000] md:bottom-4` → `absolute bottom-4 right-4 z-[1000]`으로 변경
    - 모바일/데스크톱 반응형 분기 제거, 동일한 `bottom-4 right-4` 사용
    - _Requirements: 6.1, 6.2_
  - [ ]* 2.4 Property 6 테스트: LocationButton 위치 일관성
    - **Property 6: LocationButton 위치 일관성**
    - 임의의 뷰포트 크기에서 LocationButton className에 반응형 분기(`md:`, `lg:` 등) 부재 확인
    - **Validates: Requirements 6.1, 6.2**

- [x] 3. Checkpoint — 단순 변경 검증
  - 모든 테스트 통과 확인, 빌드 정상 확인. 문제가 있으면 사용자에게 문의.

- [x] 4. CategoryFilter 가로 스크롤 전환
  - [x] 4.1 CategoryFilter 레이아웃 변경
    - `src/components/map/CategoryFilter.tsx`에서 `flex flex-wrap` → `flex overflow-x-auto scrollbar-hide`로 변경
    - 모든 카테고리 버튼에 `flex-shrink-0` 클래스 추가
    - 이벤트 전파 차단: `onPointerDown={(e) => e.stopPropagation()}`, `onWheel={(e) => e.stopPropagation()}` 추가
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 4.2 scrollbar-hide 유틸리티 CSS 추가
    - `src/app/globals.css`에 `.scrollbar-hide` 클래스 추가 (webkit + Firefox 스크롤바 숨김)
    - _Requirements: 2.3_
  - [ ]* 4.3 Property 1 테스트: 카테고리 버튼 줄바꿈 방지
    - **Property 1: 카테고리 버튼 줄바꿈 방지**
    - 임의의 카테고리 부분집합을 생성하여 렌더링 후, 모든 버튼에 `flex-shrink-0` 존재 및 부모 컨테이너에 `overflow-x-auto` 확인
    - **Validates: Requirements 2.2**

- [x] 5. ContentSearchFilter 토글 제거 및 상시 노출
  - [x] 5.1 ContentSearchFilter 토글 로직 제거
    - `src/components/map/ContentSearchFilter.tsx`에서 `isExpanded` 상태, `handleToggleExpand`, `onExpandChange` prop 제거
    - 접힌 상태의 돋보기 버튼 렌더링 분기 제거 (항상 입력 필드 렌더링)
    - 배경/테두리/그림자를 제거하여 부모 바에 위임 (통합 바 내 좌측 고정 영역)
    - 너비: `w-48 md:w-56`
    - 300ms 디바운스 유지, 컴포넌트 언마운트 시 타이머 클린업 보장
    - _Requirements: 3.2, 3.4, 3.5, 3.6_
  - [x] 5.2 AutocompleteDropdown 방향 변경
    - `src/components/map/AutocompleteDropdown.tsx`에서 `absolute bottom-full mb-1` → `absolute top-full mt-1`로 변경
    - _Requirements: 3.5_
  - [ ]* 5.3 Property 2 테스트: 검색 입력창 항상 노출
    - **Property 2: 검색 입력창 항상 노출**
    - 임의의 searchQuery 상태를 생성하여 렌더링 후, `input[role="combobox"]` 항상 DOM에 존재 확인
    - **Validates: Requirements 3.2, 3.4**
  - [ ]* 5.4 Property 3 테스트: 자동완성 활성화 조건
    - **Property 3: 자동완성 활성화 조건**
    - 임의의 문자열(0~100자)을 생성하여, 2글자 이상이면 드롭다운 open, 미만이면 closed 확인
    - **Validates: Requirements 3.5**
  - [ ]* 5.5 Property 4 테스트: 검색 디바운스 타이밍 및 클린업
    - **Property 4: 검색 디바운스 타이밍 및 클린업**
    - 임의의 입력 시퀀스와 타이밍을 생성하여, 300ms 디바운스 동작 및 언마운트 시 클린업 확인
    - **Validates: Requirements 3.6**

- [x] 6. Checkpoint — 개별 컴포넌트 변경 검증
  - 모든 테스트 통과 확인, 빌드 정상 확인. 문제가 있으면 사용자에게 문의.

- [x] 7. 필터 바 통합 및 레이아웃 재구성
  - [x] 7.1 page.tsx 필터 바를 상단 통합 바로 재구성
    - `src/app/page.tsx`에서 하단 플로팅 영역(`absolute bottom-6 left-1/2 -translate-x-1/2`)을 상단 통합 바로 변경
    - 새 구조: `absolute top-0 left-0 right-0 z-[1000]` 컨테이너 내에 `[ContentSearchFilter | 구분선(h-8 w-px bg-neutral-300) | CategoryFilter]` 배치
    - 통합 바 스타일: `bg-white/95 backdrop-blur-sm shadow-lg dark:bg-neutral-900/95`
    - `isSearchExpanded` 상태 및 `onExpandChange` prop 전달 제거
    - 카테고리 필터 숨김 조건(`!isSearchExpanded &&`) 제거 — 항상 노출
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4_
  - [x] 7.2 데스크톱 정보 패널 위치 변경
    - `src/app/page.tsx`에서 `absolute left-4 top-4` → `absolute left-4 bottom-4`로 변경
    - _Requirements: 10.1, 10.2_
  - [ ]* 7.3 Property 5 테스트: 필터 바 z-index 보장
    - **Property 5: 필터 바 z-index 보장**
    - 임의의 렌더링 조건에서 필터 바 컨테이너의 z-index 값이 1000 이상인지 확인
    - **Validates: Requirements 4.4**
  - [ ]* 7.4 Property 7 테스트: EmptyFilterOverlay 방향 무관 문구
    - **Property 7: EmptyFilterOverlay 방향 무관 문구**
    - 임의의 렌더링에서 EmptyFilterOverlay 텍스트에 방향 지시어("아래", "위", "왼쪽", "오른쪽") 부재 확인
    - **Validates: Requirements 7.1**

- [x] 8. 최종 Checkpoint — 전체 통합 검증
  - 모든 테스트 통과 확인, 빌드 정상 확인, 전체 Requirements 커버리지 확인. 문제가 있으면 사용자에게 문의.

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 Requirements를 참조하여 추적성 확보
- Checkpoint에서 점진적 검증 수행
- Property 테스트는 `fast-check` 라이브러리 사용 (프로젝트에 이미 설치됨)
- 별도의 `FilterBar.tsx` 컴포넌트를 만들지 않고 `page.tsx` 내 인라인 레이아웃으로 구현
