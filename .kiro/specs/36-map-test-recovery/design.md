# Map Test Recovery Bugfix Design

## Overview

지도 줌 성능 개선 작업(SpotPin → 순수 Leaflet API 전환, PilgrimageMap store 구독 제거, SpotMarkerLayer 도입)으로 인해 기존 테스트 6개 스위트가 실패합니다. 테스트들이 이전 아키텍처(react-leaflet `<Marker>` 컴포넌트 렌더링)를 가정하고 있어, 새로운 순수 Leaflet API 기반 구조와 호환되지 않습니다.

수정 방향은 테스트 코드를 새로운 아키텍처에 맞게 전환하는 것입니다:
- SpotPin 테스트: Leaflet `L.marker` mock 기반으로 전환
- PilgrimageMap 테스트: 마커 수 검증 제거, MapContainer props/UI 컴포넌트 검증으로 전환
- spot-detail PBT: HTML 엔티티 디코딩을 고려한 `containsRequiredInfo` 수정

## Glossary

- **Bug_Condition (C)**: 테스트가 이전 아키텍처(react-leaflet `<Marker>` 렌더링)를 가정하여 현재 코드에서 실패하는 조건
- **Property (P)**: 테스트가 새로운 아키텍처(순수 Leaflet API, SpotMarkerLayer)에 맞게 검증을 수행하여 통과하는 상태
- **Preservation**: 테스트 수정 후에도 기존에 PASS하던 다른 테스트들과 검증 의도가 변경되지 않아야 함
- **SpotPin**: `src/components/map/SpotPin.tsx` — 순수 Leaflet API 기반 마커 컴포넌트 (React DOM에 `null` 반환, `L.marker()`로 직접 관리)
- **SpotMarkerLayer**: `src/components/map/SpotMarkerLayer.tsx` — 클러스터 그룹 + 줌 레벨별 아이콘 관리 레이어 (React DOM에 `null` 반환)
- **PilgrimageMap**: `src/components/map/PilgrimageMap.tsx` — 지도 컨테이너 컴포넌트 (MapContainer + SpotMarkerLayer + UI 컨트롤)
- **containsRequiredInfo**: spot-detail 테스트의 헬퍼 함수 — `textContent`에서 필수 정보 존재 여부 검증

## Bug Details

### Bug Condition

테스트가 실패하는 조건은 크게 3가지 패턴으로 분류됩니다:

1. **SpotPin 테스트 (3개)**: `handleMouseOver`/`handleMouseOut` 함수명 기반 소스코드 분할, `isPreviewHoveredRef` 패턴 검색, react-leaflet `<Marker>` mock의 `data-testid` 요소 렌더링을 가정
2. **PilgrimageMap 테스트 (2개)**: `queryAllByTestId('marker')`로 마커 수 검증 — SpotMarkerLayer가 React DOM에 아무것도 렌더링하지 않으므로 항상 0개
3. **spot-detail PBT (1개)**: `containsRequiredInfo`가 `textContent`에서 `&`, `<`, `>` 문자를 직접 검색하지만, React가 이를 HTML 엔티티(`&amp;`, `&lt;`, `&gt;`)로 이스케이프하여 렌더링

**Formal Specification:**
```
FUNCTION isBugCondition(testFile)
  INPUT: testFile of type TestFile
  OUTPUT: boolean
  
  RETURN (testFile.assumesReactLeafletMarkerRendering == true
         AND currentArchitecture.usesDirectLeafletAPI == true)
         OR (testFile.usesSourceCodeSplit("handleMouseOver") == true
             AND currentSource.hasNoNamedFunction("handleMouseOver") == true)
         OR (testFile.comparesTextContentDirectly("&", "<", ">") == true
             AND reactRendering.escapesHTMLEntities == true)
END FUNCTION
```

### Examples

- **SpotPin.bug.test.tsx**: `sourceCode.split('handleMouseOver')[1]` → 현재 SpotPin에는 `handleMouseOver`라는 이름의 함수가 없음 (인라인 `marker.on('mouseover', () => {...})` 형태). `undefined`가 반환되어 테스트 FAIL
- **SpotPin.preservation.test.tsx**: `container.querySelector('[data-testid="spot-marker"]')` → SpotPin이 `return null`이므로 DOM에 아무 요소도 없음. `null` 반환으로 FAIL
- **spot-pin-coordinates.test.tsx**: `getByTestId('marker')` → react-leaflet `<Marker>` mock이 렌더링하는 div를 기대하지만, SpotPin은 `null` 반환. FAIL
- **PilgrimageMap.preservation.test.tsx**: `queryAllByTestId('marker')` → SpotMarkerLayer가 `null` 반환하므로 마커 0개. `expect(markers.length).toBe(spots.length)` FAIL
- **PilgrimageMap.bug.test.tsx**: `getAllByTestId('marker')` → 동일 이유로 마커 0개. FAIL
- **spot-detail "Special characters"**: `content.includes(spotData.name)` where name contains `&` → `textContent`에서는 `&amp;`가 아닌 `&`로 표시되지만, React가 내부적으로 이스케이프 처리하는 경우 불일치 발생

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- SpotPin.bug.test의 검증 의도 보존: Z_INDEX.hovered ≥ 10000, mouseover debounce ≥ 80ms, mouseout debounce ≥ 200ms, 터치 디바이스 감지, `isPreviewHovered` 체크
- SpotPin.preservation.test의 검증 의도 보존: PIN_SIZES 상수 (base: 48, hovered: 54), Z_INDEX 상수 (base: 0, hovered: 10000), 터치 디바이스 감지 로직, onSelect 콜백 존재
- spot-pin-coordinates.test의 검증 의도 보존: SpotPin이 spot.coordinates를 L.marker에 정확히 전달
- PilgrimageMap.preservation.test의 검증 의도 보존: MapContainer 인터랙션 props, LocationButton GPS flyTo, 커스텀 줌 컨트롤, SpotPreview/BottomSheet 렌더링
- PilgrimageMap.bug.test의 검증 의도 보존: spots 변경 시 MapContainer 리마운트 없음, ResizeObserver 사용, setTimeout invalidateSize 미사용
- spot-detail의 다른 Edge Case 테스트들 (Empty photos, Empty related content, Long content)이 계속 PASS

**Scope:**
테스트 코드만 수정하며, 프로덕션 소스코드(SpotPin.tsx, SpotMarkerLayer.tsx, PilgrimageMap.tsx, SpotDetailClient.tsx)는 변경하지 않습니다.

## Hypothesized Root Cause

1. **아키텍처 전환 미반영 (SpotPin 테스트 3개)**:
   - SpotPin이 react-leaflet `<Marker>`에서 순수 `L.marker()` API로 전환됨
   - 컴포넌트가 `return null`이므로 React DOM에 아무것도 렌더링하지 않음
   - 이벤트 핸들러가 `handleMouseOver`/`handleMouseOut` 명명된 함수에서 인라인 `marker.on('mouseover', ...)` 형태로 변경됨
   - `isPreviewHoveredRef` 대신 `useUIStore.getState().isPreviewHovered` 직접 호출로 변경됨

2. **SpotMarkerLayer null 반환 (PilgrimageMap 테스트 2개)**:
   - 이전: 각 SpotPin이 react-leaflet `<Marker>`를 렌더링 → DOM에 `data-testid="marker"` 존재
   - 현재: SpotMarkerLayer가 `return null` → DOM에 마커 관련 요소 없음
   - `queryAllByTestId('marker')`가 항상 빈 배열 반환

3. **HTML 엔티티 이스케이프 (spot-detail PBT 1개)**:
   - React가 텍스트 노드에서 `&`, `<`, `>` 등을 HTML 엔티티로 이스케이프
   - `textContent`는 브라우저에서 디코딩된 값을 반환하지만, jsdom 환경에서 동작이 다를 수 있음
   - `containsRequiredInfo`가 원본 문자열과 `textContent`를 직접 비교할 때 불일치 발생

## Correctness Properties

Property 1: Bug Condition - 테스트 아키텍처 호환성 복구

_For any_ 테스트 파일이 새로운 순수 Leaflet API 아키텍처를 가정하도록 수정된 경우, 해당 테스트는 현재 소스코드에서 의도한 검증을 정확히 수행하여 PASS해야 한다.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

Property 2: Preservation - 기존 검증 의도 및 다른 테스트 보존

_For any_ 테스트 수정이 적용된 후, 기존에 PASS하던 테스트들(PilgrimageMap의 MapContainer props 검증, LocationButton flyTo, 커스텀 줌 컨트롤, SpotPreview/BottomSheet 렌더링, spot-detail의 기본 Property 3 및 다른 Edge Case)은 동일하게 PASS해야 하며, 수정된 테스트의 검증 의도가 변경되지 않아야 한다.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

**파일 1**: `src/components/map/__tests__/SpotPin.bug.test.tsx`

**수정 방향**: 소스코드 분석 패턴을 현재 아키텍처에 맞게 변경

1. **함수명 분할 제거**: `sourceCode.split('handleMouseOver')` → `marker.on('mouseover'` 패턴 기반 분석으로 전환
2. **isPreviewHoveredRef 검증 변경**: `isPreviewHoveredRef` → `useUIStore.getState().isPreviewHovered` 패턴 검증
3. **debounce 타이밍 추출 방식 변경**: `mouseover` 이벤트 핸들러 내 `setTimeout(..., N)` 패턴에서 N 추출
4. **setSelectedSpot 검증 변경**: mouseover 핸들러 영역에서 `setSelectedSpot` 미호출 확인

---

**파일 2**: `src/components/map/__tests__/SpotPin.preservation.test.tsx`

**수정 방향**: react-leaflet `<Marker>` mock 기반 → Leaflet `L.marker` mock 기반으로 전환

1. **L.marker mock 추가**: `jest.fn()`으로 `L.marker`를 mock하여 호출 인자(coordinates, icon) 캡처
2. **react-leaflet Marker mock 제거**: `data-testid="spot-marker"` 기반 DOM 쿼리 제거
3. **클릭 이벤트 검증**: `marker.on('click', handler)` 캡처 후 handler 직접 호출로 전환
4. **좌표/z-index 검증**: `L.marker` 호출 인자에서 coordinates 확인, `marker.setZIndexOffset` mock으로 z-index 검증
5. **소스코드 분석 테스트 유지**: PIN_SIZES, Z_INDEX 상수 검증은 소스코드 읽기 방식 유지 (이미 동작함)
6. **터치 디바이스 검증 유지**: 소스코드 분석 방식이지만 `_isTouchDevice` 패턴으로 변경

---

**파일 3**: `src/components/map/__tests__/spot-pin-coordinates.test.tsx`

**수정 방향**: react-leaflet `<Marker>` mock → `L.marker` mock으로 전환

1. **L.marker mock 추가**: `jest.fn()`으로 mock하여 첫 번째 인자(coordinates) 캡처
2. **react-leaflet mock 변경**: `Marker` 컴포넌트 mock 제거, `useMap` mock만 유지
3. **좌표 검증 방식 변경**: `getByTestId('marker').getAttribute('data-position')` → `L.marker.mock.calls[0][0]`으로 좌표 확인
4. **MapContainer 래핑 유지**: SpotPin이 `useMap()` 훅을 사용하므로 MapContainer context 필요

---

**파일 4**: `src/components/map/__tests__/PilgrimageMap.preservation.test.tsx`

**수정 방향**: 마커 수 검증 제거, UI 컴포넌트 존재 확인으로 전환

1. **Property 2-1 수정**: `queryAllByTestId('marker')` 마커 수 검증 → SpotMarkerLayer에 spots prop이 전달되는지 확인 (SpotMarkerLayer mock으로 props 캡처)
2. **SpotMarkerLayer mock 추가**: `jest.mock('../SpotMarkerLayer')` — props 캡처용 mock 컴포넌트
3. **나머지 Property 유지**: MapContainer props, LocationButton, 줌 컨트롤, SpotPreview/BottomSheet 검증은 이미 DOM 기반으로 동작

---

**파일 5**: `src/components/map/__tests__/PilgrimageMap.bug.test.tsx`

**수정 방향**: 마커 수 검증 제거, MapContainer 안정성 + SpotMarkerLayer props 전달 검증으로 전환

1. **Property 1-1 수정**: `getAllByTestId('marker')` → SpotMarkerLayer mock의 props.spots 길이 검증
2. **Property 1-3 수정**: 동일하게 SpotMarkerLayer mock props 기반 검증
3. **SpotMarkerLayer mock 추가**: props 캡처용 mock
4. **나머지 Property 유지**: setTimeout/ResizeObserver 소스코드 분석은 이미 동작

---

**파일 6**: `src/app/spots/[id]/__tests__/spot-detail-required-info.test.tsx`

**수정 방향**: `containsRequiredInfo` 함수에서 HTML 엔티티 디코딩 적용

1. **HTML 엔티티 디코딩 헬퍼 추가**: `decodeHTMLEntities(str)` — `&amp;` → `&`, `&lt;` → `<`, `&gt;` → `>`, `&quot;` → `"`, `&#39;` → `'`
2. **containsRequiredInfo 수정**: `content.includes(spotData.name)` → `content.includes(spotData.name) || content.includes(decodeHTMLEntities(spotData.name))` 또는 양쪽 모두 디코딩 후 비교
3. **대안**: `textContent` 비교 시 원본 문자열에서 HTML 특수문자를 제거하고 비교

## Testing Strategy

### Validation Approach

테스트 코드 자체를 수정하는 버그이므로, 검증은 수정된 테스트를 실행하여 PASS 여부를 확인하는 방식입니다. 수정 전 실패를 확인하고, 수정 후 통과를 확인합니다.

### Exploratory Bug Condition Checking

**Goal**: 수정 전 테스트를 실행하여 실패 패턴을 확인하고, 근본 원인 분석을 검증합니다.

**Test Plan**: 각 테스트 파일을 개별 실행하여 실패 메시지와 스택 트레이스를 분석합니다.

**Test Cases**:
1. **SpotPin.bug.test**: `sourceCode.split('handleMouseOver')[1]` → `undefined` 반환 확인 (will fail on unfixed code)
2. **SpotPin.preservation.test**: `container.querySelector('[data-testid="spot-marker"]')` → `null` 반환 확인 (will fail on unfixed code)
3. **spot-pin-coordinates.test**: `getByTestId('marker')` → 요소 없음 에러 확인 (will fail on unfixed code)
4. **PilgrimageMap.preservation.test**: `queryAllByTestId('marker').length` → 0 반환 확인 (will fail on unfixed code)
5. **PilgrimageMap.bug.test**: `getAllByTestId('marker')` → 요소 없음 에러 확인 (will fail on unfixed code)
6. **spot-detail special characters**: `content.includes(name)` → `false` 반환 확인 (will fail on unfixed code)

**Expected Counterexamples**:
- SpotPin 테스트: `handleMouseOver` 함수명이 소스코드에 존재하지 않아 split 결과가 undefined
- PilgrimageMap 테스트: `data-testid="marker"` 요소가 DOM에 0개
- spot-detail: `&` 문자가 `textContent`에서 매칭되지 않음

### Fix Checking

**Goal**: 수정된 테스트가 현재 소스코드에서 의도한 검증을 정확히 수행하여 PASS하는지 확인합니다.

**Pseudocode:**
```
FOR ALL testFile WHERE isBugCondition(testFile) DO
  result := runTest(testFile_fixed)
  ASSERT result == PASS
END FOR
```

### Preservation Checking

**Goal**: 수정된 테스트가 기존에 PASS하던 다른 테스트에 영향을 주지 않으며, 검증 의도가 보존되는지 확인합니다.

**Pseudocode:**
```
FOR ALL testFile WHERE NOT isBugCondition(testFile) DO
  ASSERT runTest(testFile) == PASS  // 다른 테스트 영향 없음
END FOR

FOR ALL fixedTest WHERE isBugCondition(fixedTest) DO
  ASSERT verificationIntent(fixedTest_original) == verificationIntent(fixedTest_fixed)
END FOR
```

**Testing Approach**: 전체 테스트 스위트를 실행하여 regression이 없는지 확인합니다. 특히:
- PilgrimageMap.preservation.test의 Property 2-2 ~ 2-6은 이미 DOM 기반으로 동작하므로 수정 후에도 PASS 유지 확인
- spot-detail의 기본 Property 3, Empty photos, Empty related content, Long content Edge Case가 PASS 유지 확인

**Test Cases**:
1. **MapContainer props 보존**: 수정 후에도 scrollWheelZoom, doubleClickZoom 등 props 검증이 동일하게 PASS
2. **LocationButton flyTo 보존**: GPS 위치 이동 검증이 동일하게 PASS
3. **커스텀 줌 컨트롤 보존**: Zoom in/Zoom out 버튼 렌더링 검증이 동일하게 PASS
4. **spot-detail 기본 테스트 보존**: 특수문자 없는 데이터에서 containsRequiredInfo가 동일하게 PASS

### Unit Tests

- 수정된 SpotPin.bug.test: 소스코드 분석 패턴이 현재 코드 구조와 일치하는지 검증
- 수정된 SpotPin.preservation.test: L.marker mock을 통한 좌표/이벤트 검증
- 수정된 spot-pin-coordinates.test: L.marker 호출 인자로 좌표 일치 검증
- 수정된 PilgrimageMap 테스트: SpotMarkerLayer mock props로 spots 전달 검증
- 수정된 spot-detail: HTML 엔티티 디코딩 적용 후 특수문자 포함 데이터 검증

### Property-Based Tests

- spot-pin-coordinates: fast-check으로 랜덤 좌표 생성 → L.marker 호출 인자와 일치 검증
- PilgrimageMap.preservation: fast-check으로 랜덤 spots 배열 생성 → SpotMarkerLayer props.spots 길이 일치 검증
- PilgrimageMap.bug: fast-check으로 필터링 시퀀스 생성 → MapContainer 리마운트 없음 + SpotMarkerLayer props 업데이트 검증
- spot-detail special characters: fast-check으로 특수문자 포함 문자열 생성 → containsRequiredInfo PASS 검증

### Integration Tests

- 전체 map 테스트 스위트 일괄 실행: `npm test -- --testPathPattern="src/components/map/__tests__"`
- spot-detail 테스트 스위트 실행: `npm test -- --testPathPattern="spot-detail-required-info"`
- 전체 테스트 스위트 실행으로 regression 확인: `npm test`
