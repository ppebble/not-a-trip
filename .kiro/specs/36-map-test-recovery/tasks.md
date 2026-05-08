# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - 테스트 아키텍처 호환성 실패 확인
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists (테스트가 이전 아키텍처를 가정하여 실패)
  - **Scoped PBT Approach**: 6개 테스트 파일 각각을 실행하여 실패 패턴을 확인
  - 테스트 파일: `src/components/map/__tests__/SpotPin.bug.test.tsx` 실행 → `sourceCode.split('handleMouseOver')[1]` undefined 반환 확인
  - 테스트 파일: `src/components/map/__tests__/SpotPin.preservation.test.tsx` 실행 → `data-testid="spot-marker"` null 반환 확인
  - 테스트 파일: `src/components/map/__tests__/spot-pin-coordinates.test.tsx` 실행 → `getByTestId('marker')` 요소 없음 확인
  - 테스트 파일: `src/components/map/__tests__/PilgrimageMap.preservation.test.tsx` 실행 → `queryAllByTestId('marker')` 0개 확인
  - 테스트 파일: `src/components/map/__tests__/PilgrimageMap.bug.test.tsx` 실행 → `getAllByTestId('marker')` 요소 없음 확인
  - 테스트 파일: `src/app/spots/[id]/__tests__/spot-detail-required-info.test.tsx` 실행 → HTML 엔티티 불일치 확인
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are run and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - 기존 검증 의도 및 다른 테스트 보존
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: PilgrimageMap.preservation.test의 Property 2-2 ~ 2-6 (MapContainer props, LocationButton, 줌 컨트롤, SpotPreview/BottomSheet)이 현재 코드에서 PASS하는지 확인
  - Observe: spot-detail-required-info.test의 기본 Property 3, Empty photos, Empty related content, Long content Edge Case가 PASS하는지 확인
  - Observe: SpotPin.preservation.test의 소스코드 분석 테스트(PIN_SIZES, Z_INDEX 상수 검증)가 PASS하는지 확인
  - Write property-based test: 수정 대상이 아닌 기존 테스트들이 모두 PASS하는지 일괄 실행으로 확인
  - Verify tests pass on UNFIXED code (수정 대상이 아닌 테스트들은 이미 PASS해야 함)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are run and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 3. Fix for 지도 테스트 아키텍처 호환성 복구

  - [x] 3.1 SpotPin.bug.test.tsx 수정 - 소스코드 분석 패턴 변경
    - `sourceCode.split('handleMouseOver')` → `marker.on('mouseover'` 패턴 기반 분석으로 전환
    - `isPreviewHoveredRef` → `useUIStore.getState().isPreviewHovered` 패턴 검증으로 변경
    - debounce 타이밍 추출: `mouseover` 이벤트 핸들러 내 `setTimeout(..., N)` 패턴에서 N 추출
    - setSelectedSpot 검증: mouseover 핸들러 영역에서 `setSelectedSpot` 미호출 확인
    - _Bug_Condition: testFile.usesSourceCodeSplit("handleMouseOver") AND currentSource.hasNoNamedFunction("handleMouseOver")_
    - _Expected_Behavior: 새로운 순수 Leaflet API 구조에 맞게 검증 통과_
    - _Preservation: Z_INDEX.hovered ≥ 10000, mouseover debounce ≥ 80ms, mouseout debounce ≥ 200ms, 터치 디바이스 감지, isPreviewHovered 체크 검증 의도 보존_
    - _Requirements: 2.1_

  - [x] 3.2 SpotPin.preservation.test.tsx 수정 - L.marker mock 기반 전환
    - `L.marker` mock 추가: `jest.fn()`으로 호출 인자(coordinates, icon) 캡처
    - react-leaflet `<Marker>` mock 제거: `data-testid="spot-marker"` 기반 DOM 쿼리 제거
    - 클릭 이벤트 검증: `marker.on('click', handler)` 캡처 후 handler 직접 호출로 전환
    - 좌표/z-index 검증: `L.marker` 호출 인자에서 coordinates 확인, `marker.setZIndexOffset` mock으로 z-index 검증
    - 소스코드 분석 테스트 유지: PIN_SIZES, Z_INDEX 상수 검증은 소스코드 읽기 방식 유지
    - 터치 디바이스 검증: `_isTouchDevice` 패턴으로 변경
    - _Bug_Condition: testFile.assumesReactLeafletMarkerRendering AND currentArchitecture.usesDirectLeafletAPI_
    - _Expected_Behavior: L.marker mock을 통한 좌표/이벤트 검증 통과_
    - _Preservation: PIN_SIZES(base:48, hovered:54), Z_INDEX(base:0, hovered:10000), 터치 디바이스 감지, onSelect 콜백 검증 의도 보존_
    - _Requirements: 2.2_

  - [x] 3.3 spot-pin-coordinates.test.tsx 수정 - L.marker mock 전환
    - `L.marker` mock 추가: `jest.fn()`으로 mock하여 첫 번째 인자(coordinates) 캡처
    - react-leaflet `Marker` 컴포넌트 mock 제거, `useMap` mock만 유지
    - 좌표 검증 방식 변경: `getByTestId('marker').getAttribute('data-position')` → `L.marker.mock.calls[0][0]`으로 좌표 확인
    - MapContainer 래핑 유지: SpotPin이 `useMap()` 훅을 사용하므로 context 필요
    - _Bug_Condition: testFile.assumesReactLeafletMarkerRendering AND currentArchitecture.usesDirectLeafletAPI_
    - _Expected_Behavior: L.marker 호출 인자로 좌표 일치 검증 통과_
    - _Preservation: SpotPin이 spot.coordinates를 L.marker에 정확히 전달하는 검증 의도 보존_
    - _Requirements: 2.3_

  - [x] 3.4 PilgrimageMap.preservation.test.tsx 수정 - SpotMarkerLayer mock 전환
    - `jest.mock('../SpotMarkerLayer')` 추가: props 캡처용 mock 컴포넌트
    - Property 2-1 수정: `queryAllByTestId('marker')` 마커 수 검증 → SpotMarkerLayer mock의 props.spots 길이 검증
    - 나머지 Property 유지: MapContainer props, LocationButton, 줌 컨트롤, SpotPreview/BottomSheet 검증은 이미 DOM 기반으로 동작
    - _Bug_Condition: testFile.usesQueryAllByTestId('marker') AND SpotMarkerLayer.returnsNull_
    - _Expected_Behavior: SpotMarkerLayer mock props로 spots 전달 검증 통과_
    - _Preservation: MapContainer 인터랙션 props, LocationButton GPS flyTo, 커스텀 줌 컨트롤, SpotPreview/BottomSheet 렌더링 검증 의도 보존_
    - _Requirements: 2.4, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.5 PilgrimageMap.bug.test.tsx 수정 - SpotMarkerLayer mock 전환
    - `jest.mock('../SpotMarkerLayer')` 추가: props 캡처용 mock
    - Property 1-1 수정: `getAllByTestId('marker')` → SpotMarkerLayer mock의 props.spots 길이 검증
    - Property 1-3 수정: 동일하게 SpotMarkerLayer mock props 기반 검증
    - 나머지 Property 유지: setTimeout/ResizeObserver 소스코드 분석은 이미 동작
    - _Bug_Condition: testFile.usesGetAllByTestId('marker') AND SpotMarkerLayer.returnsNull_
    - _Expected_Behavior: SpotMarkerLayer mock props로 spots 변경 시 안정성 검증 통과_
    - _Preservation: spots 변경 시 MapContainer 리마운트 없음, ResizeObserver 사용, setTimeout invalidateSize 미사용 검증 의도 보존_
    - _Requirements: 2.5_

  - [x] 3.6 spot-detail-required-info.test.tsx 수정 - HTML 엔티티 디코딩 적용
    - `decodeHTMLEntities(str)` 헬퍼 추가: `&amp;` → `&`, `&lt;` → `<`, `&gt;` → `>`, `&quot;` → `"`, `&#39;` → `'`
    - `containsRequiredInfo` 수정: textContent 비교 시 HTML 엔티티 디코딩 적용하여 특수문자 포함 데이터 검증
    - _Bug_Condition: testFile.comparesTextContentDirectly("&", "<", ">") AND reactRendering.escapesHTMLEntities_
    - _Expected_Behavior: HTML 엔티티 디코딩 적용 후 특수문자 포함 데이터 검증 통과_
    - _Preservation: 기본 Property 3, Empty photos, Empty related content, Long content Edge Case가 동일하게 PASS_
    - _Requirements: 2.6, 3.5_

  - [x] 3.7 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - 테스트 아키텍처 호환성 복구 확인
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - 수정된 6개 테스트 파일을 모두 실행하여 PASS 확인
    - `npx jest src/components/map/__tests__/SpotPin.bug.test.tsx`
    - `npx jest src/components/map/__tests__/SpotPin.preservation.test.tsx`
    - `npx jest src/components/map/__tests__/spot-pin-coordinates.test.tsx`
    - `npx jest src/components/map/__tests__/PilgrimageMap.preservation.test.tsx`
    - `npx jest src/components/map/__tests__/PilgrimageMap.bug.test.tsx`
    - `npx jest src/app/spots/[id]/__tests__/spot-detail-required-info.test.tsx`
    - **EXPECTED OUTCOME**: All tests PASS (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - 기존 검증 의도 및 다른 테스트 보존 확인
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - 수정 대상이 아닌 기존 테스트들이 여전히 PASS하는지 확인
    - PilgrimageMap.preservation.test의 Property 2-2 ~ 2-6 PASS 확인
    - spot-detail-required-info.test의 기본 Property 3, Empty photos, Empty related content, Long content PASS 확인
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - 전체 map 테스트 스위트 일괄 실행: `npx jest --testPathPattern="src/components/map/__tests__"`
  - spot-detail 테스트 스위트 실행: `npx jest --testPathPattern="spot-detail-required-info"`
  - 모든 테스트 PASS 확인
  - Ensure all tests pass, ask the user if questions arise.
