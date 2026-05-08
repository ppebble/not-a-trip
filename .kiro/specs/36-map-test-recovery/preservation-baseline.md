# Preservation Baseline - 테스트 현재 상태 관찰 결과

> Task 2: 수정 전 코드에서 preservation 테스트들의 PASS/FAIL 상태를 기록합니다.
> 실행일: 2025-05-08

## 요약

| 테스트 파일 | 총 테스트 | PASS | FAIL | 실행 불가 |
|---|---|---|---|---|
| SpotPin.preservation.test.tsx | 6 | 1 | 5 | - |
| SpotPin.bug.test.tsx | (Task 1에서 확인) | - | - | - |
| spot-pin-coordinates.test.tsx | 3 | 0 | 3 | - |
| PilgrimageMap.preservation.test.tsx | 0 (suite fail) | 0 | 0 | ✅ |
| PilgrimageMap.bug.test.tsx | 0 (suite fail) | 0 | 0 | ✅ |
| spot-detail-required-info.test.tsx | 5 | 0 | 5 | - |

---

## 1. SpotPin.preservation.test.tsx

### ✅ PASS (1개 - preservation baseline)

- **`핀 아이콘 크기 상수가 올바르다 (base=48, hovered=54)`**
  - 소스코드 분석 방식으로 PIN_SIZES 상수를 검증
  - 렌더링 불필요, 소스코드 읽기만으로 동작
  - **이 테스트는 수정 후에도 반드시 PASS 유지해야 함**

### ❌ FAIL (5개 - 버그로 인한 실패)

| 테스트명 | 실패 원인 |
|---|---|
| 핀 클릭 시 setSelectedSpot이 올바른 spotId로 호출된다 | `useUIStore.getState is not a function` (store mock 미비) |
| 마커가 올바른 좌표에 렌더링된다 | `useUIStore.getState is not a function` |
| 터치 디바이스 감지 로직이 mouseover/mouseout 핸들러에 존재한다 | `sourceCode.split('handleMouseOver')[1]` → undefined (함수명 변경됨) |
| 기본 상태에서 z-index offset이 0이다 | `useUIStore.getState is not a function` |
| onSelect 콜백이 click 핸들러에서 호출되는 코드가 존재한다 | `sourceCode.split('handleClick')[1]` → undefined (함수명 변경됨) |

**분석**: 
- 렌더링 기반 테스트 3개: SpotPin이 `useUIStore.getState()`를 직접 호출하는데, 테스트의 store mock이 이를 지원하지 않음
- 소스코드 분석 테스트 2개: `handleMouseOver`, `handleClick` 함수명이 인라인 `marker.on(...)` 형태로 변경됨

---

## 2. spot-pin-coordinates.test.tsx

### ❌ FAIL (3개 모두)

| 테스트명 | 실패 원인 |
|---|---|
| Property 1: 스팟 핀 좌표 일치 | `useUIStore.getState is not a function` |
| Property 1 Edge Case: Extreme coordinate values | `useUIStore.getState is not a function` |
| Property 1 Edge Case: Precision boundary values | `useUIStore.getState is not a function` |

**분석**: SpotPin 렌더링 시 `useUIStore.getState()` 호출에서 실패. react-leaflet `<Marker>` mock 기반 좌표 검증이 현재 아키텍처와 호환되지 않음.

---

## 3. PilgrimageMap.preservation.test.tsx

### 🚫 실행 불가 (Test suite failed to run)

**에러**: `ReferenceError: L is not defined`

**원인**: 
- `leaflet.markercluster` 패키지가 전역 `L` 객체를 요구
- `SpotMarkerLayer.tsx`에서 `import 'leaflet.markercluster'`를 하면서 발생
- Jest 환경에서 Leaflet의 전역 `L` 객체가 설정되지 않음
- 테스트 파일의 mock이 `leaflet.markercluster`를 커버하지 못함

**영향**: Property 2-2 ~ 2-6 (MapContainer props, LocationButton, 줌 컨트롤, SpotPreview/BottomSheet) 검증 불가

**수정 후 기대**: `leaflet.markercluster` mock 추가 또는 SpotMarkerLayer mock으로 우회하면 이 테스트들이 실행 가능해져야 함

---

## 4. PilgrimageMap.bug.test.tsx

### 🚫 실행 불가 (Test suite failed to run)

**에러**: `ReferenceError: L is not defined` (동일 원인)

**원인**: PilgrimageMap.preservation.test.tsx와 동일 — `leaflet.markercluster` 전역 L 의존

---

## 5. spot-detail-required-info.test.tsx

### ❌ FAIL (5개 모두)

| 테스트명 | 실패 원인 |
|---|---|
| Property 3: 스팟 상세 필수 정보 포함 | `useSearchParams is not a function` |
| Property 3 Edge Case: Empty photos array handling | `useSearchParams is not a function` |
| Property 3 Edge Case: Empty related content array handling | `useSearchParams is not a function` |
| Property 3 Edge Case: Long content handling | `useSearchParams is not a function` |
| Property 3 Edge Case: Special characters in content | `useSearchParams is not a function` |

**분석**: 
- `SpotDetailClient.tsx`에서 `useSearchParams()`를 호출하는데, Next.js navigation mock이 이를 지원하지 않음
- 모든 테스트가 동일한 이유로 실패 (렌더링 자체가 불가)
- "Special characters" 테스트는 추가로 HTML 엔티티 불일치 문제도 있지만, `useSearchParams` 문제가 먼저 발생

---

## Preservation Baseline 정리

### 수정 후 반드시 PASS 유지해야 하는 테스트

1. **SpotPin.preservation.test**: `핀 아이콘 크기 상수가 올바르다 (base=48, hovered=54)` ✅

### 수정 후 PASS로 전환되어야 하는 테스트 (fix targets)

**SpotPin 관련 (store mock + 소스코드 분석 패턴 수정 필요)**:
- SpotPin.preservation.test의 나머지 5개 테스트
- spot-pin-coordinates.test의 3개 테스트

**PilgrimageMap 관련 (leaflet.markercluster mock + SpotMarkerLayer mock 필요)**:
- PilgrimageMap.preservation.test 전체 (현재 실행 불가)
- PilgrimageMap.bug.test 전체 (현재 실행 불가)

**spot-detail 관련 (useSearchParams mock + HTML 엔티티 처리 필요)**:
- spot-detail-required-info.test 전체 5개

### 환경 문제로 preservation 검증 불가한 항목

| 항목 | 차단 원인 | 해결 방법 |
|---|---|---|
| PilgrimageMap Property 2-2~2-6 | `L is not defined` | `jest.mock('leaflet.markercluster')` 또는 SpotMarkerLayer mock |
| spot-detail Property 3 + Edge Cases | `useSearchParams is not a function` | `next/navigation` mock에 `useSearchParams` 추가 |

---

## 결론

현재 unfixed 코드에서 **유일하게 PASS하는 preservation 테스트**는:
- `SpotPin.preservation.test.tsx`의 **PIN_SIZES 상수 검증** (소스코드 분석 방식)

나머지는 모두 아키텍처 전환(순수 Leaflet API) 또는 환경 mock 부족으로 실패합니다.
Task 3에서 테스트 코드를 수정할 때, 이 PIN_SIZES 상수 검증 테스트가 계속 PASS하는지 확인해야 합니다.
