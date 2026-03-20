# 지도 UI 버그 수정 Design

## Overview

지도 UI 관련 4가지 버그를 체계적으로 수정합니다:
1. **MapContainer 재사용 에러**: spots prop 변경 시 Leaflet 인스턴스 충돌 → MapContainer를 안정적으로 유지하고 하위 마커만 업데이트
2. **갤러리 피드 레이아웃**: 아이템 수가 적을 때 과도한 크기 → max-width 제한 + 좌측 정렬
3. **RouteMap 타일 깨짐**: setTimeout 기반 invalidateSize 타이밍 불일치 → ResizeObserver 기반 감지
4. **근접 핀 이벤트 충돌**: 근접 핀 간 마우스 이동 시 이벤트 연쇄 → z-index 강화 + debounce 조정

각 버그는 독립적이며, 수정 범위가 명확하게 분리되어 있어 회귀 위험이 낮습니다.

## Glossary

- **Bug_Condition (C)**: 각 버그가 발생하는 조건 — spots 배열 변경, 아이템 수 ≤ 3, 컨테이너 크기 미확정, 근접 핀 호버
- **Property (P)**: 각 버그 조건에서의 기대 동작 — 에러 없는 마커 업데이트, 제한된 크기 표시, 정렬된 타일, 안정적 호버
- **Preservation**: 기존 동작 중 변경되지 않아야 하는 것 — 전체 스팟 표시, 줌/드래그, 4개 이상 그리드, Polyline/Popup, 개별 핀 이벤트
- **MapContainer**: react-leaflet의 지도 컨테이너 컴포넌트. 내부적으로 Leaflet Map 인스턴스를 생성하며, 리마운트 시 기존 인스턴스와 충돌
- **invalidateSize()**: Leaflet Map의 메서드. 컨테이너 DOM 크기가 변경된 후 타일 레이아웃을 재계산
- **ResizeObserver**: 브라우저 API. DOM 요소의 크기 변경을 비동기적으로 감지
- **zIndexOffset**: Leaflet Marker의 속성. 마커의 z-index를 기본값 대비 오프셋으로 조정
- **debounce**: 연속 이벤트 발생 시 마지막 이벤트 후 일정 시간 대기 후 실행하는 패턴

## Bug Details

### Bug Condition

4가지 버그는 각각 독립적인 조건에서 발생합니다.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type UIInteraction
  OUTPUT: { bug1: boolean, bug2: boolean, bug3: boolean, bug4: boolean }
  
  bug1 := input.component == "PilgrimageMap"
          AND input.spotsArray HAS CHANGED
          AND MapContainer ATTEMPTS RE-RENDER
  
  bug2 := input.component == "CheckInGallery"
          AND input.checkinCount IN [1, 2, 3]
          AND input.viewportWidth > singleItemMaxWidth
  
  bug3 := input.component == "RouteMap"
          AND input.containerSizeNotSettled == true
          AND invalidateSize() CALLED AT FIXED_TIMEOUT
  
  bug4 := input.component == "SpotPin"
          AND input.nearbyPinCount >= 2
          AND input.mouseMoveBetweenPins == true
          AND debounceWindow < mouseTransitionTime
  
  RETURN { bug1, bug2, bug3, bug4 }
END FUNCTION
```

### Examples

**버그 1: MapContainer 재사용 에러**
- 사용자가 카테고리 필터 "애니메이션"을 클릭 → spots 배열이 [전체 50개] → [애니메이션 15개]로 변경 → "Map container is being reused by another instance" 에러 발생
- 기대: MapContainer는 그대로 유지, SpotPin 마커만 15개로 업데이트

**버그 2: 갤러리 피드 레이아웃**
- 스팟 상세에서 인증샷이 1개만 있을 때 → grid-cols-2에서 1개 아이템이 50% 너비를 차지하지만 max-width 제한 없음 → 큰 화면에서 과도하게 큰 이미지
- 기대: 아이템 1개일 때 max-width 제한(예: 200px)으로 적절한 크기 유지, 좌측 정렬

**버그 3: RouteMap 타일 깨짐**
- 코스 상세 페이지 진입 → RouteMap 컨테이너가 CSS 트랜지션/레이아웃 계산 중 → setTimeout 300ms 후 invalidateSize() 호출 → 컨테이너 크기가 아직 확정되지 않은 경우 타일 어긋남
- 기대: ResizeObserver로 컨테이너 크기 확정 시점 감지 후 invalidateSize() 호출

**버그 4: 근접 핀 이벤트 충돌**
- 도쿄 아키하바라 주변에 핀 5개가 밀집 → 핀 A에서 핀 B로 마우스 이동 → A의 mouseout(150ms) + B의 mouseover(50ms) 동시 발생 → 미리보기 깜빡임
- 기대: z-index 간격 확대 + debounce 시간 조정으로 안정적 전환

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- 카테고리 필터 없이 전체 스팟 표시 시 모든 핀이 정상 렌더링 (3.1)
- 지도 줌인/줌아웃, 드래그 등 기본 인터랙션 정상 동작 (3.2)
- 갤러리 아이템 4개 이상일 때 기존 grid-cols-2/3/4 반응형 레이아웃 유지 (3.3)
- 갤러리 이미지 클릭 시 CheckInDetailModal 정상 표시 (3.4)
- RouteMap의 Polyline, 번호 마커, 시작 지점 마커 기존 스타일/동작 유지 (3.5)
- RouteMap 스팟 마커 클릭 시 Popup 정상 표시 (3.6)
- 핀이 충분히 떨어져 있을 때 개별 호버/클릭 정상 동작 (3.7)
- 모바일 터치 시 Bottom Sheet 정상 동작 (3.8)
- 현재 위치 버튼 클릭 시 GPS 위치 이동 정상 동작 (3.9)

**Scope:**
각 버그 수정은 해당 컴포넌트 내부로 범위가 한정됩니다. 다른 컴포넌트나 전역 상태(mapStore, uiStore, bottomSheetStore)의 동작에는 영향을 주지 않습니다.

## Hypothesized Root Cause

### 버그 1: MapContainer 재사용 에러

**근본 원인: react-leaflet MapContainer의 불변성**

react-leaflet v4의 `MapContainer`는 내부적으로 Leaflet `Map` 인스턴스를 생성하며, props 변경으로 인한 리렌더링 시 동일 DOM 노드에 새 인스턴스를 생성하려 합니다. 현재 코드에서:

1. `PilgrimageMap` 컴포넌트가 `spots` prop 변경으로 리렌더링됨
2. `MapContainer`에 `key` prop이 없어 React는 동일 컴포넌트로 인식
3. 그러나 내부 Leaflet 인스턴스 상태와 React 상태가 불일치하면 "Map container is being reused" 에러 발생

실제로 react-leaflet의 `MapContainer`는 `center`, `zoom` 등의 props가 **초기값으로만** 사용되며, 이후 변경을 반영하지 않습니다. 문제는 `spots` 변경이 부모 컴포넌트의 리렌더링을 유발하고, dynamic import된 `PilgrimageMap` 전체가 재마운트될 수 있다는 점입니다.

**해결 방향**: MapContainer가 언마운트/리마운트되지 않도록 보장하고, spots 변경은 하위 SpotPin 마커들만 업데이트하도록 구조 유지.

### 버그 2: 갤러리 피드 레이아웃

**근본 원인: CSS Grid의 고정 컬럼 + max-width 미설정**

```tsx
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
```

- `grid-cols-2`는 아이템 수와 무관하게 2컬럼 그리드를 생성
- 아이템 1개일 때 해당 셀이 컨테이너 너비의 50%를 차지
- 큰 화면에서 50%가 과도하게 넓어짐
- 개별 아이템에 `max-width` 제한이 없음

### 버그 3: RouteMap 타일 깨짐

**근본 원인: setTimeout 기반 타이밍의 비결정성**

```tsx
const timer = setTimeout(() => {
  map.invalidateSize()
  // bounds 맞추기...
}, 300)
```

- `setTimeout(300)`은 컨테이너 DOM 크기 확정과 무관한 임의 타이밍
- CSS 트랜지션, 레이아웃 계산, 이미지 로딩 등으로 300ms 내에 크기가 확정되지 않을 수 있음
- `PilgrimageMap`에서도 `setTimeout(100)`으로 동일 패턴 사용 중

### 버그 4: 근접 핀 이벤트 충돌

**근본 원인: z-index 간격 부족 + debounce 타이밍 불균형**

현재 설정:
- `Z_INDEX = { base: 0, selected: 500, hovered: 1000 }`
- mouseover debounce: 50ms, mouseout debounce: 150ms

문제점:
1. 근접 핀들의 z-index가 모두 `base: 0`으로 동일하여 Leaflet이 임의로 이벤트 대상을 결정
2. 핀 A → 핀 B 이동 시: A의 mouseout(150ms 후 실행) 타이머가 B의 mouseover(50ms 후 실행)보다 늦게 완료되어 상태 충돌
3. mouseout 핸들러가 `isPreviewHoveredRef`를 체크하지만, 핀 간 이동 시에는 프리뷰가 아닌 다른 핀 위에 있으므로 닫힘 → 다시 열림 반복

## Correctness Properties

Property 1: Bug Condition - MapContainer 안정성

_For any_ spots 배열 변경(카테고리 필터 전환, 검색 결과 변경 등)에 대해, PilgrimageMap 컴포넌트는 MapContainer를 언마운트하지 않고 동일 Leaflet 인스턴스를 유지하며, 하위 SpotPin 마커들만 새 배열에 맞게 업데이트하여 에러 없이 동작해야 한다(SHALL).

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition - 갤러리 아이템 크기 제한

_For any_ 체크인 갤러리에서 아이템 수가 1~3개인 경우, 각 아이템의 렌더링 너비가 지정된 max-width를 초과하지 않으며 좌측 정렬되어야 한다(SHALL).

**Validates: Requirements 2.3, 2.4**

Property 3: Bug Condition - RouteMap 타일 정렬

_For any_ RouteMap 컴포넌트 마운트 또는 컨테이너 크기 변경 시, ResizeObserver를 통해 컨테이너 크기 확정 시점을 감지한 후 invalidateSize()를 호출하여 타일이 정상 정렬되어야 한다(SHALL).

**Validates: Requirements 2.5, 2.6**

Property 4: Bug Condition - 근접 핀 호버 안정성

_For any_ 근접 핀 간 마우스 이동 시, 강화된 z-index 오프셋과 조정된 debounce 타이밍으로 이벤트 연쇄가 방지되어 미리보기가 안정적으로 전환되어야 한다(SHALL).

**Validates: Requirements 2.7, 2.8**

Property 5: Preservation - 기존 지도/갤러리 동작 유지

_For any_ 버그 조건에 해당하지 않는 입력(전체 스팟 표시, 줌/드래그, 4개 이상 갤러리, Polyline/Popup, 개별 핀 이벤트, 모바일 터치, GPS 이동)에 대해, 수정된 코드는 기존 코드와 동일한 동작을 유지해야 한다(SHALL).

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9**

## Fix Implementation

### Changes Required

#### 버그 1: PilgrimageMap.tsx - MapContainer 안정성 확보

**File**: `src/components/map/PilgrimageMap.tsx`

**Specific Changes**:

1. **MapContainer 리마운트 방지**: `<MapContainer>`에는 spots 등 데이터에 의존하는 동적 key prop을 절대 사용하지 않는다 (안티 패턴: `<MapContainer key={spots.length}>` 등). spots 배열은 오직 `<MapContainer>` 내부의 자식 컴포넌트(개별 `<SpotPin>`)로만 전달되어, 지도 인스턴스 자체는 유지된 채 마커 DOM만 업데이트되도록 데이터 흐름을 강제한다. dynamic import의 `ssr: false` 설정과 부모 컴포넌트의 리렌더링 패턴을 점검하여 MapContainer가 언마운트되지 않음을 보장.

2. **useEffect 내 invalidateSize setTimeout 제거**: `setTimeout(() => { map.invalidateSize() }, 100)` 패턴을 ResizeObserver 기반으로 교체 (버그 3과 동일 패턴 적용).

3. **whenReady 콜백 내 setTimeout 제거**: `whenReady` 콜백에서도 setTimeout 대신 즉시 또는 ResizeObserver 기반으로 변경.

#### 버그 2: CheckInGallery.tsx - 레이아웃 제한

**File**: `src/components/checkin/CheckInGallery.tsx`

**Specific Changes**:

1. **아이템 수 기반 조건부 스타일링**: 아이템 수가 1~3개일 때 그리드 아이템에 `max-w-[200px]` (또는 적절한 값) 클래스 적용.

2. **좌측 정렬**: 아이템 수가 적을 때 그리드 컨테이너에 `justify-items-start` 또는 flex 기반 레이아웃으로 전환하여 좌측 정렬.

3. **스켈레톤 UI 동기화**: 로딩 스켈레톤에도 동일한 max-width 제한 적용하여 레이아웃 시프트 방지.

#### 버그 3: RouteMap.tsx - ResizeObserver 기반 타일 정렬

**File**: `src/components/route/RouteMap.tsx`

**Specific Changes**:

1. **setTimeout 제거**: `setTimeout(() => { map.invalidateSize() }, 300)` 패턴 제거.

2. **ResizeObserver 도입 (Debounce 적용)**: 컨테이너 div에 ref를 연결하고, ResizeObserver로 크기 변경 감지 시 `requestAnimationFrame` 또는 debounce(약 100ms)를 감싸서 `map.invalidateSize()`를 호출한다. 이는 `invalidateSize()` 자체가 지도 내부 타일 구조를 재계산하면서 미세한 픽셀 변동을 일으켜 다시 ResizeObserver를 트리거하는 무한 루프(ResizeLoop Error)를 방지하기 위함이다.

3. **useEffect 클린업**: ResizeObserver의 `disconnect()`를 useEffect 클린업에서 호출하여 메모리 누수 방지.

4. **bounds 맞추기 로직 통합**: invalidateSize() 호출 후 bounds 맞추기 로직을 ResizeObserver 콜백 내에서 실행.

#### 버그 4: SpotPin.tsx - z-index 강화 + debounce 조정

**File**: `src/components/map/SpotPin.tsx`

**Specific Changes**:

1. **z-index 간격 확대**: `Z_INDEX = { base: 0, selected: 500, hovered: 1000 }` → `{ base: 0, selected: 2000, hovered: 5000 }` 등으로 간격을 넓혀 근접 핀 간 z-index 충돌 최소화.

2. **debounce 타이밍 조정**: mouseover debounce를 50ms → 80~100ms로 증가, mouseout debounce를 150ms → 200~250ms로 증가하여 핀 간 전환 시 안정성 확보.

3. **mouseout 핸들러 개선**: mouseout 시 다른 핀 위에 있는지 확인하는 로직 추가. 다른 SpotPin의 mouseover가 이미 트리거된 경우 현재 핀의 closePreview를 스킵.

4. **미리보기 모달 이벤트 통과 (Pointer Events)**: 띄워지는 미리보기(SpotPreview) DOM 요소에 `pointer-events: none` CSS 속성을 적용하여, 커서가 미리보기 모달 위에 있어도 그 아래의 핀(Marker)에 대한 hover 상태가 유지되도록 처리한다. 이는 미리보기 모달이 마우스 커서를 가려서 핀의 mouseout을 강제 유발하는 현상을 방지하기 위한 핵심 조치이다. **주의**: `pointer-events: none`이 적용되면 미리보기 내부의 버튼/링크도 클릭 불가능해지므로, 미리보기는 순수 정보 표시 전용(읽기 전용)으로 유지하고, 상세 페이지 이동 등 실제 상호작용은 핀(Marker) 자체의 클릭 이벤트에서 처리하도록 라우팅/이벤트 구조를 설계한다.

## Testing Strategy

### Validation Approach

테스트 전략은 두 단계로 진행합니다: 먼저 수정 전 코드에서 버그를 재현하는 반례를 확인하고, 수정 후 버그가 해결되었으며 기존 동작이 보존되었는지 검증합니다.

### Exploratory Bug Condition Checking

**Goal**: 수정 전 코드에서 각 버그를 재현하여 근본 원인 분석을 확인/반박합니다.

**Test Plan**: 각 버그 조건을 시뮬레이션하는 테스트를 작성하고, 수정 전 코드에서 실행하여 실패를 관찰합니다.

**Test Cases**:
1. **MapContainer 재사용 테스트**: PilgrimageMap에 spots prop을 변경하며 렌더링 → 에러 발생 확인 (수정 전 코드에서 실패)
2. **갤러리 1개 아이템 크기 테스트**: CheckInGallery에 1개 아이템 렌더링 → 렌더링된 아이템 너비가 max-width 초과 확인 (수정 전 코드에서 실패)
3. **RouteMap 타일 정렬 테스트**: RouteMap 마운트 후 invalidateSize 호출 타이밍 확인 → setTimeout 기반임을 확인 (수정 전 코드에서 실패)
4. **근접 핀 호버 전환 테스트**: 근접 핀 간 빠른 마우스 이동 시뮬레이션 → 이벤트 연쇄 발생 확인 (수정 전 코드에서 실패)

**Expected Counterexamples**:
- Bug 1: spots 배열 변경 시 "Map container is being reused" 에러
- Bug 2: 1개 아이템의 렌더링 너비 > 200px
- Bug 3: invalidateSize()가 컨테이너 크기 확정 전에 호출됨
- Bug 4: 핀 A→B 이동 시 미리보기가 깜빡이거나 잘못된 스팟 표시

### Fix Checking

**Goal**: 버그 조건에 해당하는 모든 입력에 대해 수정된 함수가 기대 동작을 생성하는지 검증합니다.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input).bug1 DO
  result := PilgrimageMap_fixed(input)
  ASSERT NO_ERROR(result) AND markersUpdated(result, input.newSpots)
END FOR

FOR ALL input WHERE isBugCondition(input).bug2 DO
  result := CheckInGallery_fixed(input)
  ASSERT itemWidth(result) <= MAX_WIDTH AND alignment(result) == "left"
END FOR

FOR ALL input WHERE isBugCondition(input).bug3 DO
  result := RouteMap_fixed(input)
  ASSERT tilesAligned(result) AND invalidateSizeCalledAfterResize(result)
END FOR

FOR ALL input WHERE isBugCondition(input).bug4 DO
  result := SpotPin_fixed(input)
  ASSERT previewStable(result) AND correctSpotDisplayed(result)
END FOR
```

### Preservation Checking

**Goal**: 버그 조건에 해당하지 않는 모든 입력에 대해 수정된 함수가 기존 함수와 동일한 결과를 생성하는지 검증합니다.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input).bug1 DO
  ASSERT PilgrimageMap_original(input) = PilgrimageMap_fixed(input)
END FOR

FOR ALL input WHERE NOT isBugCondition(input).bug2 DO
  ASSERT CheckInGallery_original(input) = CheckInGallery_fixed(input)
END FOR

FOR ALL input WHERE NOT isBugCondition(input).bug3 DO
  ASSERT RouteMap_original(input) = RouteMap_fixed(input)
END FOR

FOR ALL input WHERE NOT isBugCondition(input).bug4 DO
  ASSERT SpotPin_original(input) = SpotPin_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing은 preservation checking에 권장됩니다:
- 입력 도메인 전체에 걸쳐 자동으로 많은 테스트 케이스 생성
- 수동 단위 테스트가 놓칠 수 있는 엣지 케이스 포착
- 모든 비버그 입력에 대해 동작이 변경되지 않았음을 강력하게 보장

**Test Plan**: 수정 전 코드에서 비버그 입력에 대한 동작을 먼저 관찰한 후, 해당 동작을 캡처하는 property-based 테스트를 작성합니다.

**Test Cases**:
1. **전체 스팟 표시 보존**: 필터 없이 전체 스팟 렌더링이 수정 전후 동일한지 확인
2. **줌/드래그 보존**: 지도 기본 인터랙션이 수정 전후 동일하게 동작하는지 확인
3. **4개 이상 갤러리 보존**: 아이템 4개 이상일 때 기존 그리드 레이아웃이 유지되는지 확인
4. **Polyline/Popup 보존**: RouteMap의 경로선과 팝업이 수정 전후 동일하게 렌더링되는지 확인
5. **개별 핀 이벤트 보존**: 충분히 떨어진 핀의 호버/클릭이 수정 전후 동일하게 동작하는지 확인
6. **모바일 터치 보존**: Bottom Sheet 동작이 수정 전후 동일한지 확인

### Unit Tests

- PilgrimageMap: spots prop 변경 시 MapContainer 리마운트 여부 확인
- PilgrimageMap: 빠른 카테고리 필터 전환 시 에러 미발생 확인
- CheckInGallery: 아이템 1개일 때 렌더링 너비 ≤ max-width 확인
- CheckInGallery: 아이템 2~3개일 때 각 아이템 너비 ≤ max-width 확인
- CheckInGallery: 아이템 4개 이상일 때 기존 그리드 레이아웃 유지 확인
- RouteMap: ResizeObserver 콜백에서 invalidateSize() 호출 확인
- RouteMap: 컴포넌트 언마운트 시 ResizeObserver disconnect 확인
- SpotPin: z-index 오프셋 값이 기대값과 일치하는지 확인
- SpotPin: debounce 타이밍이 조정된 값과 일치하는지 확인

### Property-Based Tests

- 랜덤 spots 배열(0~100개)을 생성하여 PilgrimageMap이 에러 없이 렌더링되는지 확인
- 랜덤 체크인 수(1~20개)를 생성하여 갤러리 아이템 너비가 항상 max-width 이내인지 확인
- 랜덤 컨테이너 크기(100px~2000px)를 생성하여 RouteMap 타일이 항상 정렬되는지 확인
- 랜덤 핀 좌표(근접/원거리 혼합)를 생성하여 호버 이벤트가 항상 올바른 스팟을 표시하는지 확인

### Integration Tests

- 메인 페이지에서 카테고리 필터를 반복 전환하며 지도가 정상 동작하는지 E2E 확인
- 스팟 상세 페이지에서 인증샷 갤러리가 다양한 아이템 수에서 올바르게 표시되는지 확인
- 코스 상세 페이지에서 RouteMap이 다양한 화면 크기에서 타일이 정상 렌더링되는지 확인
- 밀집 스팟 지역에서 핀 호버/클릭이 안정적으로 동작하는지 확인
