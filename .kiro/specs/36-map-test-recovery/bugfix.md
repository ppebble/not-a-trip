# Bugfix Requirements Document

## Introduction

지도 줌 성능 개선 작업(SpotPin → 순수 Leaflet API 전환, PilgrimageMap store 구독 제거, SpotMarkerLayer 도입)으로 인해 기존 테스트 6개 스위트가 실패합니다. 테스트들이 이전 아키텍처(react-leaflet `<Marker>` 컴포넌트 렌더링)를 가정하고 있어, 새로운 순수 Leaflet API 기반 구조와 호환되지 않습니다.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN SpotPin.bug.test.tsx를 실행하면 THEN `handleMouseOver`/`handleMouseOut` 함수명 기반 소스코드 분할이 실패하고, `isPreviewHoveredRef` 패턴이 존재하지 않아 테스트가 FAIL한다

1.2 WHEN SpotPin.preservation.test.tsx를 실행하면 THEN react-leaflet `<Marker>` mock을 통한 렌더링 테스트가 실패한다 (SpotPin이 `null`을 반환하므로 `data-testid="spot-marker"` 요소가 DOM에 존재하지 않음)

1.3 WHEN spot-pin-coordinates.test.tsx를 실행하면 THEN react-leaflet `<Marker>` mock의 `data-testid="marker"` 요소가 렌더링되지 않아 좌표 검증이 실패한다

1.4 WHEN PilgrimageMap.preservation.test.tsx를 실행하면 THEN `queryAllByTestId('marker')`로 마커 수를 검증하는 테스트가 실패한다 (SpotMarkerLayer가 React 요소를 렌더링하지 않음)

1.5 WHEN PilgrimageMap.bug.test.tsx를 실행하면 THEN `getAllByTestId('marker')`로 마커 수를 검증하는 테스트가 실패한다 (동일 이유)

1.6 WHEN spot-detail-required-info.test.tsx의 "Special characters in content" Edge Case를 실행하면 THEN `containsRequiredInfo` 함수가 HTML 이스케이프된 특수문자(`&`, `<`, `>`)를 `textContent`에서 찾지 못해 FAIL한다

### Expected Behavior (Correct)

2.1 WHEN SpotPin 관련 bug 테스트를 실행하면 THEN 새로운 순수 Leaflet API 구조(이벤트 핸들러가 `marker.on('mouseover')` / `marker.on('mouseout')` 형태, `useUIStore.getState()` 직접 호출)에 맞게 검증이 통과해야 한다

2.2 WHEN SpotPin 관련 preservation 테스트를 실행하면 THEN 순수 Leaflet API 기반 SpotPin의 보존 속성(Z_INDEX 상수, PIN_SIZES 상수, 터치 디바이스 감지, onSelect 콜백 존재)이 소스코드 분석으로 검증되어야 한다

2.3 WHEN 좌표 일치 테스트를 실행하면 THEN SpotPin이 `L.marker(spot.coordinates, ...)` 형태로 좌표를 전달하는지 소스코드 분석 또는 Leaflet mock을 통해 검증되어야 한다

2.4 WHEN PilgrimageMap preservation 테스트를 실행하면 THEN SpotMarkerLayer를 통한 마커 관리 구조에 맞게 MapContainer 안정성, 인터랙션 props, LocationButton, 커스텀 줌 컨트롤이 검증되어야 한다

2.5 WHEN PilgrimageMap bug 테스트를 실행하면 THEN SpotMarkerLayer 기반 구조에서 spots 배열 변경 시 MapContainer 리마운트 없이 안정적으로 동작하는지 검증되어야 한다

2.6 WHEN spot-detail "Special characters in content" Edge Case를 실행하면 THEN HTML 이스케이프 처리된 특수문자(`&amp;` → `&`, `&lt;` → `<`, `&gt;` → `>`)가 `textContent`에서 올바르게 비교되어 테스트가 통과해야 한다

### Unchanged Behavior (Regression Prevention)

3.1 WHEN PilgrimageMap의 MapContainer 인터랙션 props(scrollWheelZoom, doubleClickZoom, dragging, touchZoom 등)를 검증하면 THEN 기존과 동일한 값이 유지되어야 한다

3.2 WHEN PilgrimageMap의 LocationButton GPS 위치 이동 기능을 테스트하면 THEN flyTo 호출이 기존과 동일하게 동작해야 한다

3.3 WHEN PilgrimageMap의 커스텀 줌 컨트롤(Zoom in/Zoom out 버튼)을 검증하면 THEN 기존과 동일하게 렌더링되어야 한다

3.4 WHEN SpotPreview와 BottomSheet 컴포넌트 렌더링을 검증하면 THEN 기존과 동일하게 항상 DOM에 존재해야 한다

3.5 WHEN spot-detail의 Property 3 기본 테스트(필수 정보 포함), Empty photos, Empty related content, Long content Edge Case를 실행하면 THEN 기존과 동일하게 모두 PASS해야 한다

3.6 WHEN SpotPin의 Z_INDEX 상수(base: 0, hovered: 10000)와 PIN_SIZES 상수(base: 48, hovered: 54)를 검증하면 THEN 현재 소스코드의 값과 일치해야 한다

3.7 WHEN SpotPin의 터치 디바이스 감지 로직(`_isTouchDevice`)이 mouseover/mouseout 이벤트 핸들러에서 사용되는지 검증하면 THEN 소스코드에 해당 패턴이 존재해야 한다
