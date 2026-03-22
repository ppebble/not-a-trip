# Implementation Plan

## Bug 1: MapContainer 재사용 에러 (PilgrimageMap.tsx)

- [x] 1. Write bug condition exploration test - MapContainer 안정성
  - **Property 1: Bug Condition** - MapContainer 재사용 에러
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: spots 배열이 변경될 때(카테고리 필터 전환) MapContainer가 에러 없이 동일 인스턴스를 유지하는지 검증
  - Test file: `src/components/map/__tests__/PilgrimageMap.bug.test.tsx`
  - Bug Condition: `input.component == "PilgrimageMap" AND input.spotsArray HAS CHANGED AND MapContainer ATTEMPTS RE-RENDER`
  - PilgrimageMap에 spots prop을 [전체 50개] → [필터링 15개] → [전체 50개]로 변경하며 렌더링
  - MapContainer가 언마운트되지 않고 동일 Leaflet 인스턴스를 유지하는지 확인
  - SpotPin 마커들만 새 배열에 맞게 업데이트되는지 확인
  - useEffect 내 setTimeout 기반 invalidateSize 호출 패턴이 존재하는지 확인
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples: spots 배열 변경 시 "Map container is being reused by another instance" 에러 또는 setTimeout 기반 invalidateSize 패턴 감지
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2_

- [x] 2. Write preservation property tests - MapContainer 기존 동작 보존 (BEFORE implementing fix)
  - **Property 2: Preservation** - 전체 스팟 표시 및 기본 인터랙션 보존
  - **IMPORTANT**: Follow observation-first methodology
  - Test file: `src/components/map/__tests__/PilgrimageMap.preservation.test.tsx`
  - Observe: 카테고리 필터 없이 전체 스팟 표시 시 모든 핀이 정상 렌더링됨
  - Observe: 지도 줌인/줌아웃, 드래그 등 기본 인터랙션 정상 동작
  - Observe: 현재 위치 버튼 클릭 시 GPS 위치 이동 정상 동작
  - Write property-based test: spots 배열이 변경되지 않는 경우(전체 표시), 모든 SpotPin이 spots.length만큼 렌더링됨
  - Write property-based test: MapContainer의 줌/드래그 props가 유지됨 (scrollWheelZoom, doubleClickZoom, dragging, touchZoom 등)
  - Verify test passes on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.9_


## Bug 2: 갤러리 피드 레이아웃 (CheckInGallery.tsx)

- [x] 3. Write bug condition exploration test - 갤러리 아이템 크기 제한
  - **Property 1: Bug Condition** - 갤러리 아이템 과도한 크기
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: 아이템 수가 1~3개일 때 각 아이템의 렌더링 너비가 max-width를 초과하는지 검증
  - Test file: `src/components/checkin/__tests__/CheckInGallery.bug.test.tsx`
  - Bug Condition: `input.component == "CheckInGallery" AND input.checkinCount IN [1, 2, 3] AND input.viewportWidth > singleItemMaxWidth`
  - CheckInGallery에 1개 아이템 렌더링 → 아이템에 max-width 제한 클래스가 적용되어 있는지 확인
  - CheckInGallery에 2~3개 아이템 렌더링 → 각 아이템에 max-width 제한이 있는지 확인
  - 아이템 1~3개일 때 좌측 정렬(justify-items-start 또는 flex 기반)이 적용되는지 확인
  - 스켈레톤 UI에도 동일한 max-width 제한이 적용되는지 확인
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples: 1개 아이템의 렌더링 너비 > 200px, max-width 클래스 미적용
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.3, 2.4_

- [x] 4. Write preservation property tests - 갤러리 기존 레이아웃 보존 (BEFORE implementing fix)
  - **Property 2: Preservation** - 4개 이상 갤러리 그리드 및 모달 동작 보존
  - **IMPORTANT**: Follow observation-first methodology
  - Test file: `src/components/checkin/__tests__/CheckInGallery.preservation.test.tsx`
  - Observe: 아이템 4개 이상일 때 기존 grid-cols-2/3/4 반응형 레이아웃 유지
  - Observe: 갤러리 이미지 클릭 시 CheckInDetailModal 정상 표시
  - Observe: 정렬 옵션(최신순/인기순) 전환 정상 동작
  - Write property-based test: 아이템 4~20개 범위에서 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 클래스가 유지됨
  - Write property-based test: 아이템 클릭 시 selectedCheckIn 상태가 설정되고 CheckInDetailModal이 렌더링됨
  - Verify test passes on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.3, 3.4_


## Bug 3: RouteMap 타일 깨짐 (RouteMap.tsx)

- [x] 5. Write bug condition exploration test - RouteMap 타일 정렬
  - **Property 1: Bug Condition** - RouteMap 타일 깨짐
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: RouteMap 마운트 시 invalidateSize가 ResizeObserver 기반이 아닌 setTimeout(300) 기반으로 호출되는지 검증
  - Test file: `src/components/route/__tests__/RouteMap.bug.test.tsx`
  - Bug Condition: `input.component == "RouteMap" AND input.containerSizeNotSettled == true AND invalidateSize() CALLED AT FIXED_TIMEOUT`
  - RouteMap 컴포넌트 마운트 후 setTimeout(300) 패턴이 사용되는지 확인
  - ResizeObserver가 사용되지 않고 있는지 확인
  - invalidateSize()가 컨테이너 크기 확정과 무관하게 고정 타이밍에 호출되는지 확인
  - useEffect 클린업에서 ResizeObserver disconnect가 없는지 확인
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples: invalidateSize()가 setTimeout(300) 기반으로 호출됨, ResizeObserver 미사용
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.5, 2.6_

- [x] 6. Write preservation property tests - RouteMap 기존 동작 보존 (BEFORE implementing fix)
  - **Property 2: Preservation** - Polyline, 마커, Popup 동작 보존
  - **IMPORTANT**: Follow observation-first methodology
  - Test file: `src/components/route/__tests__/RouteMap.preservation.test.tsx`
  - Observe: Polyline 구간별 스타일(도보=실선, 대중교통=점선) 정상 렌더링
  - Observe: 번호 마커(createNumberIcon) 정상 표시 및 스타일 유지
  - Observe: 시작 지점 마커 정상 표시
  - Observe: 스팟 마커 클릭 시 Popup 정상 표시
  - Observe: 소실 스팟 회색 마커 + 취소선 스타일 유지
  - Write property-based test: spots 배열(1~10개)에 대해 Marker가 spots.length만큼 렌더링됨
  - Write property-based test: routeSegments가 올바른 isDashed 값을 가짐 (거리 기반)
  - Write property-based test: 범례(legend) UI가 항상 렌더링됨
  - Verify test passes on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.5, 3.6_


## Bug 4: 근접 핀 이벤트 충돌 (SpotPin.tsx)

- [x] 7. Write bug condition exploration test - 근접 핀 호버 안정성
  - **Property 1: Bug Condition** - 근접 핀 이벤트 충돌
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: z-index 간격과 debounce 타이밍이 근접 핀 간 이벤트 충돌을 방지하기에 충분한지 검증
  - Test file: `src/components/map/__tests__/SpotPin.bug.test.tsx`
  - Bug Condition: `input.component == "SpotPin" AND input.nearbyPinCount >= 2 AND input.mouseMoveBetweenPins == true AND debounceWindow < mouseTransitionTime`
  - Z_INDEX 상수 확인: base=0, selected=500, hovered=1000 → 간격이 부족한지 검증
  - debounce 타이밍 확인: mouseover=50ms, mouseout=150ms → 핀 간 전환 시 충돌 가능성 검증
  - mouseout 핸들러가 다른 핀 위에 있는지 확인하는 로직이 없는지 검증
  - SpotPreview에 pointer-events: none이 적용되지 않아 마우스 이벤트를 가로채는지 확인
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples: Z_INDEX.hovered=1000 (부족), mouseover debounce=50ms (너무 짧음), SpotPreview에 pointer-events: none 미적용
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.7, 2.8_

- [x] 8. Write preservation property tests - 핀 기존 동작 보존 (BEFORE implementing fix)
  - **Property 2: Preservation** - 개별 핀 이벤트 및 모바일 터치 보존
  - **IMPORTANT**: Follow observation-first methodology
  - Test file: `src/components/map/__tests__/SpotPin.preservation.test.tsx`
  - Observe: 핀이 충분히 떨어져 있을 때 개별 호버/클릭 정상 동작
  - Observe: 모바일 터치 시 Bottom Sheet 정상 동작 (touchCount 기반 로직)
  - Observe: 핀 아이콘 생성(createImagePinIcon) 시 카테고리 색상/크기 정상 적용
  - Observe: 선택된 핀의 시각적 피드백(선택 링, 글로우 효과) 정상 표시
  - Write property-based test: 개별 핀 클릭 시 setSelectedSpot이 올바른 spotId로 호출됨
  - Write property-based test: 터치 디바이스에서 mouseover/mouseout 이벤트가 무시됨
  - Write property-based test: 핀 아이콘 크기가 상태별로 올바름 (base=48, hovered=54, selected=58)
  - Verify test passes on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.7, 3.8_


## Bug 1 Fix: MapContainer 재사용 에러 수정

- [x] 9. Fix for MapContainer 재사용 에러

  - [x] 9.1 Implement the fix - PilgrimageMap.tsx
    - MapContainer에 동적 key prop이 사용되지 않도록 보장 (spots 등 데이터 의존 key 금지)
    - spots 배열은 오직 자식 컴포넌트(SpotPin)로만 전달되어 마커 DOM만 업데이트되도록 유지
    - dynamic import의 `ssr: false` 설정과 부모 컴포넌트 리렌더링 패턴 점검
    - useEffect 내 `setTimeout(() => { map.invalidateSize() }, 100)` 제거 → ResizeObserver 기반으로 교체
    - whenReady 콜백 내 `setTimeout(() => { mapRef.current?.invalidateSize() }, 100)` 제거 → 즉시 호출 또는 ResizeObserver 기반으로 변경
    - ResizeObserver에 debounce(requestAnimationFrame 또는 100ms) 적용하여 무한 루프 방지
    - useEffect 클린업에서 ResizeObserver disconnect() 호출
    - _Bug_Condition: isBugCondition(input) where input.spotsArray HAS CHANGED AND MapContainer ATTEMPTS RE-RENDER_
    - _Expected_Behavior: MapContainer는 언마운트되지 않고 동일 Leaflet 인스턴스 유지, SpotPin 마커만 업데이트_
    - _Preservation: 전체 스팟 표시, 줌/드래그, GPS 위치 이동 기존 동작 유지_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.9_

  - [x] 9.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - MapContainer 안정성
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2_

  - [x] 9.3 Verify preservation tests still pass
    - **Property 2: Preservation** - 전체 스팟 표시 및 기본 인터랙션 보존
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 2 Fix: 갤러리 피드 레이아웃 수정

- [x] 10. Fix for 갤러리 피드 레이아웃

  - [x] 10.1 Implement the fix - CheckInGallery.tsx
    - 아이템 수가 1~3개일 때 그리드 아이템에 `max-w-[200px]` (또는 적절한 값) 클래스 적용
    - 아이템 수가 1~3개일 때 그리드 컨테이너에 `justify-items-start` 또는 flex 기반 레이아웃으로 전환하여 좌측 정렬
    - 아이템 4개 이상일 때는 기존 `grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4` 유지
    - 스켈레톤 UI(로딩 상태)에도 동일한 max-width 제한 적용하여 레이아웃 시프트 방지
    - _Bug_Condition: isBugCondition(input) where input.checkinCount IN [1, 2, 3] AND viewportWidth > singleItemMaxWidth_
    - _Expected_Behavior: itemWidth(result) <= MAX_WIDTH AND alignment(result) == "left"_
    - _Preservation: 4개 이상 갤러리 grid-cols-2/3/4 유지, CheckInDetailModal 정상 표시_
    - _Requirements: 2.3, 2.4, 3.3, 3.4_

  - [x] 10.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - 갤러리 아이템 크기 제한
    - **IMPORTANT**: Re-run the SAME test from task 3 - do NOT write a new test
    - The test from task 3 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 3
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.3, 2.4_

  - [x] 10.3 Verify preservation tests still pass
    - **Property 2: Preservation** - 4개 이상 갤러리 그리드 및 모달 동작 보존
    - **IMPORTANT**: Re-run the SAME tests from task 4 - do NOT write new tests
    - Run preservation property tests from step 4
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 3 Fix: RouteMap 타일 깨짐 수정

- [x] 11. Fix for RouteMap 타일 깨짐

  - [x] 11.1 Implement the fix - RouteMap.tsx
    - `setTimeout(() => { map.invalidateSize() ... }, 300)` 패턴 완전 제거
    - 컨테이너 div에 ref를 연결하고 ResizeObserver로 크기 변경 감지
    - ResizeObserver 콜백에 debounce(requestAnimationFrame 또는 100ms) 적용하여 무한 루프(ResizeLoop Error) 방지
    - invalidateSize() 호출 후 bounds 맞추기 로직을 ResizeObserver 콜백 내에서 실행
    - useEffect 클린업에서 ResizeObserver disconnect() 호출하여 메모리 누수 방지
    - bounds가 변경될 때도 ResizeObserver 기반으로 타일 재정렬
    - _Bug_Condition: isBugCondition(input) where containerSizeNotSettled == true AND invalidateSize() CALLED AT FIXED_TIMEOUT_
    - _Expected_Behavior: tilesAligned(result) AND invalidateSizeCalledAfterResize(result)_
    - _Preservation: Polyline, 번호 마커, 시작 지점 마커, Popup 기존 스타일/동작 유지_
    - _Requirements: 2.5, 2.6, 3.5, 3.6_

  - [x] 11.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - RouteMap 타일 정렬
    - **IMPORTANT**: Re-run the SAME test from task 5 - do NOT write a new test
    - The test from task 5 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 5
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.5, 2.6_

  - [x] 11.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Polyline, 마커, Popup 동작 보존
    - **IMPORTANT**: Re-run the SAME tests from task 6 - do NOT write new tests
    - Run preservation property tests from step 6
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 4 Fix: 근접 핀 이벤트 충돌 수정

- [ ] 12. Fix for 근접 핀 이벤트 충돌

  - [ ] 12.1 Implement the fix - SpotPin.tsx z-index 강화 + debounce 조정
    - Z_INDEX 상수 변경: `{ base: 0, selected: 500, hovered: 1000 }` → `{ base: 0, selected: 2000, hovered: 5000 }`
    - mouseover debounce 타이밍 조정: 50ms → 80~100ms
    - mouseout debounce 타이밍 조정: 150ms → 200~250ms
    - mouseout 핸들러 개선: 다른 핀 위에 있는지 확인하는 로직 추가 (다른 SpotPin의 mouseover가 이미 트리거된 경우 closePreview 스킵)
    - _Bug_Condition: isBugCondition(input) where nearbyPinCount >= 2 AND mouseMoveBetweenPins == true_
    - _Expected_Behavior: previewStable(result) AND correctSpotDisplayed(result)_
    - _Preservation: 개별 핀 호버/클릭, 모바일 터치 Bottom Sheet 기존 동작 유지_
    - _Requirements: 2.7, 2.8, 3.7, 3.8_

  - [ ] 12.2 Implement the fix - SpotPreview pointer-events: none 적용
    - SpotPreview 컴포넌트(`src/components/map/SpotPreview.tsx`)의 루트 div에 `pointer-events: none` CSS 적용
    - 이로 인해 미리보기 모달이 마우스 이벤트를 가로채지 않아 핀의 hover 상태가 유지됨
    - SpotPreview 내부의 onMouseEnter/onMouseLeave 핸들러 제거 (pointer-events: none이므로 불필요)
    - setPreviewHovered 관련 로직 정리 (더 이상 필요 없음)
    - 미리보기는 순수 정보 표시 전용(읽기 전용)으로 유지
    - 상세 페이지 이동 등 실제 상호작용은 핀(Marker) 자체의 클릭 이벤트에서 처리
    - _Bug_Condition: SpotPreview가 마우스 이벤트를 가로채서 핀의 mouseout을 강제 유발_
    - _Expected_Behavior: SpotPreview 위에 커서가 있어도 핀의 hover 상태 유지_
    - _Requirements: 2.7, 2.8_

  - [ ] 12.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - 근접 핀 호버 안정성
    - **IMPORTANT**: Re-run the SAME test from task 7 - do NOT write a new test
    - The test from task 7 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 7
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.7, 2.8_

  - [ ] 12.4 Verify preservation tests still pass
    - **Property 2: Preservation** - 개별 핀 이벤트 및 모바일 터치 보존
    - **IMPORTANT**: Re-run the SAME tests from task 8 - do NOT write new tests
    - Run preservation property tests from step 8
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Final Checkpoint

- [ ] 13. Checkpoint - 전체 테스트 통과 확인
  - 모든 bug condition exploration 테스트 통과 확인 (tasks 1, 3, 5, 7)
  - 모든 preservation 테스트 통과 확인 (tasks 2, 4, 6, 8)
  - `npm run type-check` 통과 확인
  - `npm run build` 통과 확인
  - 4가지 버그 수정이 서로 독립적이며 회귀 없음을 확인
  - 사용자에게 질문이 있으면 확인
