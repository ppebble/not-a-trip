# Design Document: 성지순례 코스/루트 시스템 (Pilgrimage Route)

## Overview

성지순례 코스 시스템은 유저가 여러 스팟을 순서대로 묶어 코스를 생성하고, 다른 유저들이 이를 탐색·따라가기할 수 있는 기능이다. 핵심은 스팟의 **순서 보장**, 현장에서의 **따라가기 모드(네비게이션)**, 그리고 **오프라인 캐싱**을 통한 네트워크 없는 환경에서의 사용성 확보이다.

### 주요 설계 결정

1. **순서 보장 배열(Ordered Array)**: MongoDB 문서 내 `spots` 배열의 인덱스 순서를 코스 순서로 사용한다. 별도 `order` 필드 없이 배열 인덱스 자체가 순서를 의미하며, 순서 변경 시 배열을 재배치한다.
2. **Haversine 기반 거리 계산**: 기존 `geo-utils.ts`의 `calculateDistance`를 재활용하여 스팟 간 직선거리를 계산하고, 도보 시간은 `직선거리 × 1.3 / 평균보행속도(4km/h)`로 추정한다. 정확한 경로는 외부 지도 앱(구글맵/야후재팬맵)으로 연결한다.
3. **Service Worker 프리패치**: 08번 스펙의 PWA 인프라(`public/sw.js`)를 확장하여, 코스 시작/저장 시 해당 코스 내 스팟 데이터와 썸네일을 `CacheStorage`에 프리패치한다.
4. **Zustand 진행 상태 관리**: `courseProgressStore`로 현재 진행 중인 코스, 현재 목표 스팟 인덱스, 인증 완료 스팟 목록을 관리한다.

## Architecture

```mermaid
graph TB
    subgraph Client ["클라이언트 (Next.js App Router)"]
        RP[코스 목록 페이지<br/>/routes]
        RD[코스 상세 페이지<br/>/routes/[id]]
        RC[코스 생성 페이지<br/>/routes/create]
        NM[따라가기 모드<br/>NavigationMode]
        
        subgraph Stores ["Zustand Stores"]
            CPS[courseProgressStore]
            MS[mapStore]
        end
        
        subgraph Hooks ["Custom Hooks"]
            UG[useGeolocation]
            UCR[useRouteNavigation]
            URC[useRouteCache]
        end
        
        subgraph SW ["Service Worker"]
            SWC[Route Cache<br/>ROUTE_CACHE]
        end
    end
    
    subgraph Server ["서버 (API Routes)"]
        AR[/api/routes]
        ARD[/api/routes/[id]]
        ARB[/api/routes/[id]/bookmark]
        ARC[/api/routes/[id]/complete]
    end
    
    subgraph DB ["MongoDB"]
        RC_DB[(routes)]
        RB_DB[(route_bookmarks)]
        RCO_DB[(route_completions)]
    end
    
    RP --> AR
    RD --> ARD
    RC --> AR
    NM --> CPS
    NM --> UG
    NM --> UCR
    UCR --> CPS
    URC --> SWC
    
    AR --> RC_DB
    ARD --> RC_DB
    ARB --> RB_DB
    ARC --> RCO_DB
```

### 페이지 구조

| 경로 | 설명 |
|------|------|
| `/routes` | 코스 목록 (탐색, 필터, 정렬) |
| `/routes/create` | 코스 생성 |
| `/routes/[id]` | 코스 상세 (지도 + 스팟 목록) |
| `/routes/[id]/edit` | 코스 수정 (작성자만) |

### API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/routes` | 코스 목록 조회 (필터, 정렬, 페이지네이션) |
| `POST` | `/api/routes` | 코스 생성 |
| `GET` | `/api/routes/[id]` | 코스 상세 조회 |
| `PUT` | `/api/routes/[id]` | 코스 수정 |
| `DELETE` | `/api/routes/[id]` | 코스 삭제 |
| `POST` | `/api/routes/[id]/bookmark` | 코스 저장/해제 |
| `POST` | `/api/routes/[id]/complete` | 코스 완주 기록 |
| `GET` | `/api/routes/recommended` | 추천 코스 조회 |


## Components and Interfaces

### 1. 페이지 컴포넌트

#### `RouteListPage` (`src/app/routes/page.tsx`)
- 코스 목록 표시 (카드 형태)
- 정렬: 인기순(북마크+완주), 최신순, 소요시간순
- 필터: 작품별, 지역별, 소요시간별
- 무한 스크롤 페이지네이션

#### `RouteDetailPage` (`src/app/routes/[id]/page.tsx`)
- 지도에 전체 동선 표시 (Polyline)
- 스팟 목록을 순서대로 표시
- 스팟 간 이동 거리/시간 표시
- "코스 시작" / "코스 저장" 버튼
- 코스 제작자 정보

#### `RouteCreatePage` (`src/app/routes/create/page.tsx`)
- 코스 기본 정보 입력 (이름, 설명, 예상 소요시간, 난이도)
- 스팟 검색/선택 UI
- 드래그 앤 드롭으로 스팟 순서 변경
- 지도에서 직접 스팟 선택
- 공개/비공개 설정
- 미리보기

### 2. 핵심 컴포넌트

#### `RouteCard` (`src/components/route/RouteCard.tsx`)
- 코스 카드 (목록용)
- 코스명, 스팟 수, 예상 시간, 난이도, 북마크 수 표시

#### `RouteMap` (`src/components/route/RouteMap.tsx`)
- Leaflet 기반 코스 지도
- 스팟 마커 + 순서 번호 표시
- 스팟 간 Polyline 연결
- 현재 위치 표시 (따라가기 모드)

#### `SpotOrderList` (`src/components/route/SpotOrderList.tsx`)
- 스팟 순서 목록 (생성/수정 시 드래그 앤 드롭)
- 스팟 간 거리/시간 표시
- 외부 지도 앱 연결 버튼

#### `NavigationPanel` (`src/components/route/NavigationPanel.tsx`)
- 따라가기 모드 하단 패널
- 현재 목표 스팟 정보
- 다음 스팟까지 거리/시간
- 진행률 바
- 인증(Check-in) 버튼
- 코스 종료 버튼

#### `RouteFilterBar` (`src/components/route/RouteFilterBar.tsx`)
- 작품별, 지역별, 소요시간별 필터 UI

### 3. Custom Hooks

#### `useRouteNavigation` (`src/hooks/useRouteNavigation.ts`)
```typescript
interface UseRouteNavigationReturn {
  /** 현재 진행 중인 코스 */
  activeRoute: Route | null
  /** 현재 목표 스팟 인덱스 */
  currentSpotIndex: number
  /** 인증 완료한 스팟 ID 목록 */
  checkedSpotIds: string[]
  /** 진행률 (0-100) */
  progress: number
  /** 다음 스팟까지 거리 (m) */
  distanceToNext: number | null
  /** 다음 스팟까지 예상 시간 (분) */
  estimatedTimeToNext: number | null
  /** 코스 시작 */
  startRoute: (route: Route) => void
  /** 스팟 인증 완료 처리 */
  checkInSpot: (spotId: string) => void
  /** 다음 스팟으로 이동 */
  moveToNextSpot: () => void
  /** 코스 종료 */
  endRoute: () => void
  /** 코스 완주 여부 */
  isCompleted: boolean
}
```

#### `useRouteCache` (`src/hooks/useRouteCache.ts`)
```typescript
interface UseRouteCacheReturn {
  /** 코스 데이터 프리패치 */
  prefetchRoute: (route: Route) => Promise<void>
  /** 캐시 상태 확인 */
  isCached: boolean
  /** 캐싱 진행률 */
  cacheProgress: number
}
```

### 4. Zustand Store

#### `courseProgressStore` (`src/stores/courseProgressStore.ts`)
```typescript
interface CourseProgressState {
  /** 현재 진행 중인 코스 ID */
  activeRouteId: string | null
  /** 현재 진행 중인 코스 데이터 */
  activeRoute: Route | null
  /** 현재 목표 스팟 인덱스 (0-based) */
  currentSpotIndex: number
  /** 인증 완료한 스팟 ID Set */
  checkedSpotIds: Set<string>
  /** 코스 시작 시간 */
  startedAt: Date | null
  /** 네비게이션 활성 여부 */
  isNavigating: boolean
}

interface CourseProgressActions {
  /**
   * 코스 시작
   * - 기존 Check-in 기록(GET /api/checkins?userId=...)을 조회하여
   *   코스 내 이미 인증된 스팟을 checkedSpotIds에 자동 포함시킨다.
   */
  startRoute: (route: Route) => void
  /**
   * 스팟 인증 완료 처리
   * ⚠️ 주의: 반드시 07번 스펙의 Check-in API(POST /api/checkins) 호출이
   * 성공한 후에만 실행되어야 한다. 이 액션은 프론트엔드 상태만 업데이트하며,
   * 실제 DB 기록은 Check-in API가 담당한다.
   * 
   * 호출 흐름:
   * 1. POST /api/checkins → 성공 응답 수신
   * 2. checkInSpot(spotId) → courseProgressStore 상태 업데이트
   */
  checkInSpot: (spotId: string) => void
  moveToNextSpot: () => void
  endRoute: () => void
  resetProgress: () => void
}
```


## Data Models

### Route (코스)

```typescript
/** 코스 난이도 */
type RouteDifficulty = 'easy' | 'moderate' | 'hard'

/** 코스 내 스팟 정보 (순서는 배열 인덱스로 보장) */
interface RouteSpot {
  /** 스팟 ID (spots 컬렉션 참조) */
  spotId: string
  /** 스팟명 (비정규화, 조회 성능용) */
  spotName: string
  /** 좌표 (비정규화, 지도 표시용) */
  coordinates: { lat: number; lng: number }
  /** 썸네일 URL (비정규화, 오프라인 캐싱용) */
  thumbnailUrl: string
  /** 이전 스팟으로부터의 거리 (m), 첫 스팟은 null */
  distanceFromPrev: number | null
  /** 이전 스팟으로부터의 예상 도보 시간 (분), 첫 스팟은 null */
  walkTimeFromPrev: number | null
  /** 스팟별 메모 (선택) */
  note?: string
  /**
   * 스팟 유효성 플래그 (비정규화)
   * - true: 정상 (기본값)
   * - false: 원본 스팟이 삭제되었거나 09번 스펙의 '소실됨' 상태
   * 
   * 코스 상세 조회 API에서 spots 컬렉션과 대조하여 갱신한다.
   * 클라이언트는 이 값이 false인 스팟을 '소실됨' UI로 표시하고,
   * 해당 스팟을 건너뛰어 이전→다음 스팟 간 거리를 재계산한다.
   */
  isAvailable?: boolean
}

/** 코스 문서 */
interface Route {
  id: string
  /** 코스명 */
  name: string
  /** 코스 설명 */
  description: string
  /** 예상 총 소요시간 (분) */
  estimatedDuration: number
  /** 난이도 */
  difficulty: RouteDifficulty
  /** 스팟 목록 (배열 인덱스 = 순서) */
  spots: RouteSpot[]
  /** 총 거리 (m) */
  totalDistance: number
  /** 관련 작품명 목록 */
  relatedContentNames: string[]
  /** 지역 태그 (예: "도쿄", "가마쿠라") */
  regionTag?: string
  /** 공개 여부 */
  isPublic: boolean
  /** 공식 추천 코스 여부 (관리자 설정) */
  isOfficial: boolean
  /** 북마크 수 (비정규화) */
  bookmarkCount: number
  /** 완주 수 (비정규화) */
  completionCount: number
  /** 작성자 ID */
  authorId: string
  /** 작성자 이름 */
  authorName: string
  createdAt: Date
  updatedAt: Date
}
```

### RouteBookmark (코스 저장)

```typescript
interface RouteBookmark {
  id: string
  routeId: string
  userId: string
  createdAt: Date
}
```

### RouteCompletion (코스 완주 기록)

```typescript
interface RouteCompletion {
  id: string
  routeId: string
  userId: string
  /** 완주 시 인증한 스팟 ID 목록 */
  checkedSpotIds: string[]
  /** 소요 시간 (분) */
  duration: number
  completedAt: Date
}
```

### MongoDB 컬렉션 및 인덱스

```typescript
// db.ts COLLECTIONS에 추가
ROUTES: 'routes',
ROUTE_BOOKMARKS: 'route_bookmarks',
ROUTE_COMPLETIONS: 'route_completions',
```

**인덱스 설계:**

```javascript
// routes 컬렉션
db.routes.createIndex({ isPublic: 1, createdAt: -1 })
db.routes.createIndex({ isPublic: 1, bookmarkCount: -1 })
db.routes.createIndex({ isPublic: 1, estimatedDuration: 1 })
db.routes.createIndex({ relatedContentNames: 1 })
db.routes.createIndex({ regionTag: 1 })
db.routes.createIndex({ authorId: 1 })
db.routes.createIndex({ isOfficial: 1 })

// route_bookmarks 컬렉션
db.route_bookmarks.createIndex({ userId: 1, routeId: 1 }, { unique: true })
db.route_bookmarks.createIndex({ routeId: 1 })

// route_completions 컬렉션
db.route_completions.createIndex({ userId: 1, routeId: 1 })
db.route_completions.createIndex({ routeId: 1 })
```

### 스팟 간 거리/시간 계산 로직

기존 `src/lib/geo-utils.ts`의 `calculateDistance` (Haversine)를 활용한다.

```typescript
// src/lib/route-utils.ts

import { calculateDistance } from '@/lib/geo-utils'

/** 도보 보정 계수 (직선거리 → 실제 도보거리 근사) */
const WALK_FACTOR = 1.3
/** 평균 도보 속도 (m/분) */
const WALK_SPEED_M_PER_MIN = 80 // ≈ 4.8km/h

/** 두 좌표 간 예상 도보 시간 (분) */
export function estimateWalkTime(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const distance = calculateDistance(lat1, lng1, lat2, lng2)
  const walkDistance = distance * WALK_FACTOR
  return Math.ceil(walkDistance / WALK_SPEED_M_PER_MIN)
}

/** 코스 내 스팟 배열에 거리/시간 정보 채우기 */
export function calculateRouteDistances(
  spots: { coordinates: { lat: number; lng: number } }[]
): { distanceFromPrev: number | null; walkTimeFromPrev: number | null }[] {
  return spots.map((spot, i) => {
    if (i === 0) return { distanceFromPrev: null, walkTimeFromPrev: null }
    const prev = spots[i - 1]
    const distance = calculateDistance(
      prev.coordinates.lat, prev.coordinates.lng,
      spot.coordinates.lat, spot.coordinates.lng
    )
    const walkTime = estimateWalkTime(
      prev.coordinates.lat, prev.coordinates.lng,
      spot.coordinates.lat, spot.coordinates.lng
    )
    return { distanceFromPrev: Math.round(distance), walkTimeFromPrev: walkTime }
  })
}
```

### Service Worker 확장 (오프라인 캐싱)

기존 `public/sw.js`에 코스 전용 캐시를 추가한다.

```javascript
// sw.js에 추가
const ROUTE_CACHE = `not-a-trip-route-v${CACHE_VERSION}`

// VALID_CACHES에 ROUTE_CACHE 추가

// 메시지 핸들러 추가
self.addEventListener('message', (event) => {
  // 코스 프리패치 요청
  if (event.data && event.data.type === 'PREFETCH_ROUTE') {
    event.waitUntil(prefetchRouteData(event.data.payload))
  }
})

/**
 * 코스 데이터 프리패치
 * - 코스 내 각 스팟의 상세 정보
 * - 스팟 썸네일 이미지
 */
async function prefetchRouteData(payload) {
  const { routeId, spots } = payload
  const cache = await caches.open(ROUTE_CACHE)
  
  const requests = []
  
  // 코스 상세 API 캐싱
  requests.push(`/api/routes/${routeId}`)
  
  // 각 스팟 상세 API + 썸네일 캐싱
  for (const spot of spots) {
    requests.push(`/api/spots/${spot.spotId}`)
    if (spot.thumbnailUrl) {
      requests.push(spot.thumbnailUrl)
    }
  }
  
  await Promise.allSettled(
    requests.map(async (url) => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response)
        }
      } catch { /* 오프라인이면 무시 */ }
    })
  )
}
```

클라이언트에서 프리패치를 트리거하는 유틸리티:

```typescript
// src/lib/route-cache.ts

export async function prefetchRouteForOffline(route: Route): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  
  const registration = await navigator.serviceWorker.ready
  registration.active?.postMessage({
    type: 'PREFETCH_ROUTE',
    payload: {
      routeId: route.id,
      spots: route.spots.map(s => ({
        spotId: s.spotId,
        thumbnailUrl: s.thumbnailUrl,
      })),
    },
  })
}
```


## Correctness Properties

*속성(Property)은 시스템의 모든 유효한 실행에서 참이어야 하는 특성 또는 동작이다. 속성은 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 한다.*

### Property 1: 코스 생성 라운드트립

*For any* 유효한 코스 데이터(코스명, 설명, 예상 소요시간, 난이도, 스팟 목록, 공개 여부)를 사용하여 코스를 생성한 후 해당 코스를 조회하면, 모든 필드가 입력한 값과 동일해야 하며, 특히 스팟 목록의 순서가 보존되어야 한다.

**Validates: Requirements 1.2, 1.5**

### Property 2: 도보 시간 계산의 단조성

*For any* 두 쌍의 좌표 (A, B)와 (A, C)에 대해, A-B 간 직선거리가 A-C 간 직선거리보다 크면, A-B 간 예상 도보 시간도 A-C 간 예상 도보 시간보다 크거나 같아야 한다. 또한 동일 좌표 간 거리는 0이고 도보 시간도 0이어야 한다.

**Validates: Requirements 1.4, 3.3**

### Property 3: 코스 목록 정렬 정확성

*For any* 코스 목록과 정렬 기준(인기순, 최신순, 소요시간순)에 대해, 정렬된 결과의 인접한 두 항목은 해당 정렬 기준의 순서를 위반하지 않아야 한다. (인기순: bookmarkCount + completionCount 내림차순, 최신순: createdAt 내림차순, 소요시간순: estimatedDuration 오름차순)

**Validates: Requirements 2.1, 4.2**

### Property 4: 필터링 결과의 조건 충족

*For any* 코스 목록과 필터 조건(작품명, 지역, 소요시간 범위, 공식 추천 여부)에 대해, 필터링된 결과의 모든 항목은 해당 필터 조건을 만족해야 한다. (예: 작품명 필터 시 relatedContentNames에 해당 작품 포함, 공식 추천 필터 시 isOfficial === true)

**Validates: Requirements 2.2, 4.1, 4.3**

### Property 5: 북마크 토글 라운드트립

*For any* 유저와 코스에 대해, 북마크를 추가하면 해당 유저의 북마크 목록에 코스가 포함되고, 다시 해제하면 목록에서 제거되어야 한다. 또한 북마크 추가/해제 시 코스의 bookmarkCount가 각각 1 증가/감소해야 한다.

**Validates: Requirements 2.4**

### Property 6: 네비게이션 시작 시 상태 초기화 (과거 인증 반영)

*For any* 코스에 대해 startRoute를 호출하면, isNavigating이 true가 되고, currentSpotIndex가 0이며, activeRouteId가 해당 코스 ID와 일치해야 한다. 또한 해당 유저의 기존 Check-in 기록(POST /api/checkins로 생성된 기록)을 조회하여, 코스 내 이미 인증된 스팟은 자동으로 checkedSpotIds에 포함되어야 한다.

**Validates: Requirements 3.1**

### Property 7: 진행률 계산 정확성

*For any* N개의 스팟을 가진 코스에서 M개(0 ≤ M ≤ N)의 스팟을 인증했을 때, 진행률은 정확히 (M / N) * 100이어야 하며, 0 이상 100 이하의 범위여야 한다.

**Validates: Requirements 3.4**

### Property 8: 완주 판정 정확성 (과거 인증 포함)

*For any* 코스에 대해, 코스 내 유효한 스팟(`isAvailable !== false`)의 모든 인증이 완료되었을 때만 완주로 판정되어야 한다. 하나라도 유효한 미인증 스팟이 있으면 완주가 아니어야 한다. 과거 Check-in 기록(코스 시작 이전에 인증한 기록)도 유효한 인증으로 인정하며, `isAvailable: false`인 소실/삭제 스팟은 완주 판정 대상에서 제외한다.

**Validates: Requirements 3.5**

### Property 9: 오프라인 프리패치 URL 완전성

*For any* 코스에 대해, 프리패치 대상 URL 목록은 코스 상세 API URL, 코스 내 모든 스팟의 상세 API URL, 그리고 썸네일 URL이 있는 모든 스팟의 썸네일 URL을 포함해야 한다.

**Validates: Requirements 3.6**

## Error Handling

### API 에러 처리

| 상황 | HTTP 상태 | 응답 |
|------|-----------|------|
| 코스 미발견 | 404 | `{ error: "코스를 찾을 수 없습니다" }` |
| 미인증 유저의 코스 생성 | 401 | `{ error: "로그인이 필요합니다" }` |
| 권한 없는 코스 수정/삭제 | 403 | `{ error: "권한이 없습니다" }` |
| 필수 필드 누락 | 400 | `{ error: "필수 항목을 입력해주세요", fields: [...] }` |
| 스팟 최소 2개 미만 | 400 | `{ error: "코스에는 최소 2개의 스팟이 필요합니다" }` |
| 비공개 코스 타인 접근 | 403 | `{ error: "비공개 코스입니다" }` |
| 존재하지 않는 스팟 ID 포함 | 400 | `{ error: "유효하지 않은 스팟이 포함되어 있습니다" }` |

### 클라이언트 에러 처리

- **코스 내 스팟 소실/삭제**: 코스 상세 조회 시 spots 컬렉션과 대조하여 삭제되었거나 09번 스펙의 '소실됨/접근 불가' 상태인 스팟은 `isAvailable: false`로 마킹한다. RouteMap과 NavigationPanel은 해당 스팟을 '소실됨' 아이콘(회색 마커 + 취소선)으로 표시하고, 네비게이션 시 해당 스팟을 건너뛰어 이전 유효 스팟에서 다음 유효 스팟으로의 거리/시간을 재계산하여 안내한다. 완주 판정 시에도 `isAvailable: false`인 스팟은 인증 대상에서 제외한다.
- **위치 권한 거부**: 따라가기 모드 시작 시 위치 권한이 거부되면, 권한 요청 안내 모달 표시. 기존 `useGeolocation` 훅의 에러 핸들링 활용.
- **오프라인 상태**: 코스 생성/수정은 온라인에서만 가능. 조회는 캐시된 데이터로 제공. `networkStore`의 `isOnline` 상태 활용.
- **GPS 신호 불안정**: 따라가기 모드에서 GPS 정확도가 낮을 때(accuracy > 100m) 경고 표시.
- **Service Worker 미지원**: 프리패치 실패 시 무시하고 온라인 모드로 동작.

## Testing Strategy

### 속성 기반 테스트 (Property-Based Testing)

**라이브러리**: `fast-check` (TypeScript/JavaScript용 PBT 라이브러리)

각 속성 테스트는 최소 100회 반복 실행하며, 설계 문서의 속성 번호를 참조하는 태그를 포함한다.

**태그 형식**: `Feature: 10-pilgrimage-route, Property {number}: {property_text}`

| 속성 | 테스트 대상 함수/모듈 | 생성기 |
|------|----------------------|--------|
| Property 1 | 코스 CRUD API | 임의의 코스명, 설명, 스팟 배열 생성 |
| Property 2 | `estimateWalkTime`, `calculateDistance` | 임의의 좌표 쌍 생성 |
| Property 3 | 코스 목록 정렬 로직 | 임의의 코스 배열 + 정렬 기준 |
| Property 4 | 코스 필터링 로직 | 임의의 코스 배열 + 필터 조건 |
| Property 5 | 북마크 API | 임의의 유저 ID + 코스 ID |
| Property 6 | `courseProgressStore.startRoute` | 임의의 Route 객체 |
| Property 7 | 진행률 계산 함수 | 임의의 N(스팟 수), M(인증 수) |
| Property 8 | 완주 판정 로직 | 임의의 코스 + 인증 스팟 부분집합 |
| Property 9 | `prefetchRouteForOffline` URL 생성 | 임의의 Route 객체 |

### 단위 테스트 (Unit Testing)

**라이브러리**: `vitest`

단위 테스트는 구체적인 예제, 엣지 케이스, 에러 조건에 집중한다.

- **코스 생성 검증**: 필수 필드 누락 시 에러, 스팟 1개 이하 시 에러
- **거리 계산**: 동일 좌표 → 0m, 알려진 좌표 쌍의 거리 검증
- **정렬**: 빈 목록, 단일 항목 목록, 동일 값 항목 정렬
- **필터링**: 빈 필터 → 전체 반환, 매칭 없는 필터 → 빈 배열
- **북마크**: 중복 북마크 방지, 존재하지 않는 코스 북마크 시 에러
- **진행률**: 스팟 0개 코스 엣지 케이스, 전체 인증 시 100%
- **완주 판정**: 빈 코스, 중복 인증 처리
- **프리패치**: 썸네일 없는 스팟 처리, 빈 스팟 목록

