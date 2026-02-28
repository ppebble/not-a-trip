# Design Document: 덕후 친화적 편의시설 (Otaku-Friendly Facilities)

## Overview

기존 편의시설 시스템(5개 Legacy_Category)을 확장하여 덕후 특화 5개 카테고리(Otaku_Category)를 추가하고, 유저 제보/마이크로 투표 기반 데이터 검증 시스템을 구축합니다. 기존 `NearbyFacility` 인터페이스와 `/api/spots/[id]/facilities` API를 하위 호환성을 유지하며 확장합니다.

## Architecture

### 데이터 출처(Source) 이원화 전략

편의시설 데이터는 두 가지 출처로 관리합니다:

1. **유저 직접 제보 (Pin-based)**: 코인 로커, 개방 화장실 등 외부 지도 서비스에 없는 시설 → 유저가 지도에 핀을 꽂아 위치와 상세 정보를 직접 입력
2. **외부 장소 태깅 (Overlay)**: 식당, 카페 등 이미 구글맵에 존재하는 장소 → `googlePlaceId`로 매핑하고 덕후 특화 속성(혼밥 가능, 콘센트 유무 등)만 덧붙이는 방식

이 이원화를 통해 데이터 정합성을 유지하고 유저 입력 부담을 최소화합니다.

### 시스템 구성도

```
┌─────────────────────────────────────────────────────┐
│                   Client (Next.js)                   │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ NearbyFacili │  │ FacilityRepo │  │ MicroVote  │ │
│  │ ties.tsx     │  │ rtForm.tsx   │  │ Button.tsx │ │
│  │ (확장)       │  │ (신규)       │  │ (신규)     │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                 │                │         │
│  ┌──────┴─────────────────┴────────────────┴───────┐ │
│  │              useFacilities Hook (확장)            │ │
│  └──────────────────────┬──────────────────────────┘ │
└─────────────────────────┼────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────┐
│                   API Routes                          │
│                                                       │
│  GET /api/spots/[id]/facilities  (확장: type, status) │
│  POST /api/facilities/report     (신규: 제보)         │
│  POST /api/facilities/[id]/vote  (신규: 투표)         │
└─────────────────────────┼────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────┐
│              MongoDB (facilities collection)           │
│                                                       │
│  기존 필드 + otakuDetails + verification + status     │
└───────────────────────────────────────────────────────┘
```

## Data Model

### 확장된 FacilityType (Req 1, 6.1)

```typescript
// src/types/spot.ts - 기존 타입 확장
export type LegacyFacilityType =
  | 'restaurant'
  | 'convenience_store'
  | 'cafe'
  | 'station'
  | 'other'

export type OtakuFacilityType =
  | 'coin_locker'
  | 'solo_dining'
  | 'charging_cafe'
  | 'public_restroom'
  | 'goods_shop'

export type FacilityType = LegacyFacilityType | OtakuFacilityType

export type FacilityStatus = 'active' | 'needs_verification' | 'hidden'

export type GoodsShopSubtype = 'subculture_shop' | 'general_store'
export type LockerSize = 'small' | 'medium' | 'large'
```

### 카테고리별 상세 정보 인터페이스 (Req 6.2~6.6)

```typescript
// src/types/facility.ts (신규 파일)

export interface CoinLockerDetails {
  sizes: LockerSize[]
  prices: Record<LockerSize, number | null>  // 엔화 기준, null = 미등록
  operatingHours: string | null              // "05:00-24:00" 형식
  hasLargeLocker: boolean | null
}

export interface SoloDiningDetails {
  hasCounterSeat: boolean | null
  hasSoloMenu: boolean | null
  isQuickMeal: boolean | null
  isLateNight: boolean | null
}

export interface ChargingCafeDetails {
  hasCharging: boolean | null
  hasWifi: boolean | null
}

export interface PublicRestroomDetails {
  isAccessible: boolean | null
  is24Hours: boolean | null
}

export interface GoodsShopDetails {
  subtype: GoodsShopSubtype
  operatingHours: string | null
}

export type OtakuFacilityDetails =
  | { type: 'coin_locker'; details: CoinLockerDetails }
  | { type: 'solo_dining'; details: SoloDiningDetails }
  | { type: 'charging_cafe'; details: ChargingCafeDetails }
  | { type: 'public_restroom'; details: PublicRestroomDetails }
  | { type: 'goods_shop'; details: GoodsShopDetails }
```

### 확장된 NearbyFacility 인터페이스 (Req 6.7~6.10)

```typescript
// src/types/spot.ts - 기존 인터페이스 확장
export interface NearbyFacility {
  id: string
  name: string
  type: FacilityType
  distance: number
  address: string
  coordinates: [number, number]
  // 신규 필드
  status: FacilityStatus
  verificationScore: number        // 0~100, 기본값 50
  upvotes: number
  downvotes: number
  googlePlaceId?: string           // 외부 지도 매핑 (선택)
  otakuDetails?: OtakuFacilityDetails  // Otaku_Category 전용 상세 정보
  reportedBy?: string              // 제보자 userId
  createdAt?: string
  updatedAt?: string
}
```

### MongoDB Document 스키마

```typescript
// facilities collection document
interface FacilityDocument {
  _id: ObjectId
  name: string
  type: FacilityType
  address: string
  coordinates: { lat: number; lng: number }
  status: FacilityStatus              // 기본값: 'active'
  verificationScore: number           // 기본값: 50
  upvotes: number                     // 기본값: 0
  downvotes: number                   // 기본값: 0
  googlePlaceId?: string
  otakuDetails?: {
    coin_locker?: CoinLockerDetails
    solo_dining?: SoloDiningDetails
    charging_cafe?: ChargingCafeDetails
    public_restroom?: PublicRestroomDetails
    goods_shop?: GoodsShopDetails
  }
  reportedBy?: string
  createdAt: Date
  updatedAt: Date
}
```

### 투표 기록 컬렉션 (Req 7.8 중복 투표 방지)

MVP 단계에서는 개별 속성(콘센트 유무, 혼밥 가능 여부 등)마다 투표하는 대신, **시설 단위(Facility-level) 단일 투표**로 통일합니다. "이 편의시설 정보가 정확한가요? 👍/👎" 형태로 시설 전체에 대해 1인 1투표만 허용합니다. 이를 통해 DB 연산 복잡도를 낮추고, upvotes/downvotes가 시설 전체 레벨에서 일관되게 관리됩니다.

```typescript
// facility_votes collection document
interface FacilityVoteDocument {
  _id: ObjectId
  facilityId: string
  userId: string
  value: boolean          // true = 정확해요(👍), false = 아니에요(👎)
  createdAt: Date
  updatedAt: Date
}

// 복합 유니크 인덱스: { facilityId, userId } → 시설당 1인 1투표 보장
```

## API Design

### 1. GET /api/spots/[id]/facilities (확장) — Req 7.1, 7.2, 7.5

기존 API를 확장하여 `type` 쿼리 파라미터와 `status` 필터링을 추가합니다.

```
GET /api/spots/[id]/facilities?type=coin_locker&radius=2&limit=50
```

**변경 사항:**
- `type` 파라미터 추가: 특정 카테고리만 필터링
- `status` 필터 자동 적용: `hidden` 상태 제외
- 응답에 `otakuDetails`, `status`, `verificationScore` 포함

**응답 예시:**
```json
[
  {
    "id": "abc123",
    "name": "아키하바라역 코인 로커",
    "type": "coin_locker",
    "distance": 150,
    "address": "東京都千代田区...",
    "coordinates": [35.6984, 139.7731],
    "status": "active",
    "verificationScore": 85,
    "upvotes": 12,
    "downvotes": 2,
    "otakuDetails": {
      "type": "coin_locker",
      "details": {
        "sizes": ["small", "medium", "large"],
        "prices": { "small": 300, "medium": 500, "large": 700 },
        "operatingHours": "05:00-24:00",
        "hasLargeLocker": true
      }
    }
  }
]
```

### 2. POST /api/facilities/report (신규) — Req 7.3, 7.4

```
POST /api/facilities/report
Content-Type: application/json
```

**요청 Body:**
```json
{
  "name": "이케부쿠로 코인 로커",
  "type": "coin_locker",
  "coordinates": { "lat": 35.7295, "lng": 139.7109 },
  "address": "東京都豊島区...",
  "googlePlaceId": "ChIJ...",
  "otakuDetails": {
    "sizes": ["small", "large"],
    "prices": { "small": 300, "large": 700 },
    "operatingHours": "05:00-24:00",
    "hasLargeLocker": true
  }
}
```

**필수 필드:** `name`, `type`, `coordinates`
**응답:** 201 Created + 생성된 facility 객체
**에러:** 400 Bad Request + 누락 필드 목록

### 3. POST /api/facilities/[id]/vote (신규) — Req 7.6, 7.7, 7.8

시설 단위(Facility-level) 단일 투표. "이 편의시설 정보가 정확한가요?"에 대한 👍/👎 투표입니다.

```
POST /api/facilities/[id]/vote
Content-Type: application/json
```

**요청 Body:**
```json
{
  "value": true
}
```

- `value`: `true` = 정확해요(👍), `false` = 아니에요(👎)

**처리 로직:**
1. `facility_votes` 컬렉션에서 `{ facilityId, userId }` 조회
2. 기존 투표 존재 → 값 업데이트 (중복 누적 방지, 토글 가능)
3. 신규 투표 → 새 문서 삽입
4. `facilities` 컬렉션의 `upvotes`/`downvotes` 재계산
5. `verificationScore` 재계산: `Math.round((upvotes / (upvotes + downvotes)) * 100)` (투표 0건이면 50)
6. `verificationScore` 임계치 확인 → 필요 시 `status` 변경

**응답:**
```json
{
  "verificationScore": 78,
  "upvotes": 14,
  "downvotes": 4
}
```

## Verification Score & Status 관리 (Req 5.11, 6.8, 6.9)

### 점수 계산

```
verificationScore = upvotes + downvotes > 0
  ? Math.round((upvotes / (upvotes + downvotes)) * 100)
  : 50  // 투표 없으면 기본 50
```

### 상태 전이 규칙

```
active → needs_verification:
  downvotes - upvotes >= 5 (downvotes가 5개 이상 더 많을 때)

needs_verification → hidden:
  verificationScore < 20 (신뢰도 20% 미만)

hidden/needs_verification → active:
  관리자 수동 복원 (향후 admin API로 확장)
```

## UI Components

### 1. FACILITY_CONFIG 확장 (Req 1.2)

```typescript
// src/components/spot/NearbyFacilities.tsx 내 FACILITY_CONFIG 확장
const FACILITY_CONFIG: Record<FacilityType, { label: string; icon: string; color: string }> = {
  // Legacy
  restaurant:        { label: '음식점',      icon: '🍽️', color: 'bg-orange-100 ...' },
  convenience_store: { label: '편의점',      icon: '🏪', color: 'bg-blue-100 ...' },
  cafe:              { label: '카페',        icon: '☕', color: 'bg-amber-100 ...' },
  station:           { label: '역/정류장',   icon: '🚉', color: 'bg-green-100 ...' },
  other:             { label: '기타',        icon: '📍', color: 'bg-gray-100 ...' },
  // Otaku (신규)
  coin_locker:       { label: '코인 로커',   icon: '🔐', color: 'bg-purple-100 ...' },
  solo_dining:       { label: '혼밥 식당',   icon: '🍜', color: 'bg-rose-100 ...' },
  charging_cafe:     { label: '충전/와이파이', icon: '🔌', color: 'bg-cyan-100 ...' },
  public_restroom:   { label: '화장실',      icon: '🚻', color: 'bg-teal-100 ...' },
  goods_shop:        { label: '굿즈/잡화',   icon: '🛍️', color: 'bg-pink-100 ...' },
}
```

### 2. FacilityCard 확장 (Req 2, 3, 4)

기존 `FacilityCard` 컴포넌트에 카테고리별 상세 정보 렌더링을 추가합니다.

```
┌─────────────────────────────────────────┐
│ 🔐 아키하바라역 코인 로커    150m       │
│ 東京都千代田区...                        │
│ ┌─────────────────────────────────────┐ │
│ │ 소형 ¥300 │ 중형 ¥500 │ 대형 ¥700 │ │
│ │ 🧳 대형 로커 있음  ⏰ 05:00-24:00  │ │
│ └─────────────────────────────────────┘ │
│ ✅ 신뢰도 85%  👍12 👎2               │
│ [콘센트 있나요? 예/아니오]              │
└─────────────────────────────────────────┘
```

카테고리별 상세 렌더링:
- `coin_locker`: 크기별 가격 테이블, 대형 로커 유무 배지, 이용 시간
- `solo_dining`: "1인 OK" 태그, 카운터석/1인 메뉴 유무, 빠른 식사/심야 배지
- `charging_cafe`: 충전/와이파이 유무 아이콘
- `public_restroom`: 접근성/24시간 유무 아이콘
- `goods_shop`: 매장 유형 배지(서브컬처/잡화), 영업시간

### 3. FacilityFilter 컴포넌트 (Req 1.4, 1.5)

카테고리 필터 칩 UI를 NearbyFacilities 상단에 추가합니다.

```
┌─────────────────────────────────────────────────┐
│ [전체] [🍽️음식점] [🏪편의점] ... [🔐로커]      │
│ [🍜혼밥] [🔌충전] [🚻화장실] [🛍️굿즈]         │
└─────────────────────────────────────────────────┘
```

- 칩 클릭 → 해당 카테고리만 필터링
- 다시 클릭 → 필터 해제 (전체 표시)
- 복수 선택 가능

### 4. FacilityReportForm 컴포넌트 (Req 5.1~5.9)

모달 형태의 제보 폼. 데이터 출처 이원화 전략에 따라 **투트랙 입력 UI**를 제공하며, 카테고리 선택에 따라 동적 필드가 표시됩니다.

**Step 1: 장소 입력 방식 선택 (투트랙)**

```
┌─────────────────────────────────────────┐
│ 편의시설 제보                    [X]    │
│                                         │
│ 장소를 어떻게 등록하시겠어요?           │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ [🔍 구글맵 장소 검색]              │ │
│ │  식당, 카페 등 이미 있는 장소에     │ │
│ │  덕후 정보만 추가                   │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [📍 지도에 직접 핀 꽂기]           │ │
│ │  코인 로커, 화장실 등 지도에        │ │
│ │  없는 장소를 새로 등록              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

- **구글맵 검색 탭**: 구글 Places Autocomplete로 장소 검색 → 선택 시 `googlePlaceId`, 이름, 주소, 좌표 자동 입력 → 유저는 카테고리와 덕후 특화 속성만 추가 입력
- **직접 핀 탭**: 지도에서 위치를 직접 클릭하여 핀 설정 → 이름, 주소, 카테고리, 상세 정보 모두 직접 입력

**Step 2: 카테고리 및 상세 정보 입력**

```
┌─────────────────────────────────────────┐
│ 편의시설 제보                    [X]    │
│                                         │
│ 📍 선택된 장소: 아키하바라역 앞         │
│    東京都千代田区... (자동 입력)         │
│                                         │
│ 카테고리*: [▼ 코인 로커    ]            │
│                                         │
│ ── 코인 로커 상세 정보 ──               │
│ 크기: [☑소형] [☑중형] [☑대형]          │
│ 가격: 소형[300] 중형[500] 대형[700]     │
│ 이용시간: [05:00-24:00]                 │
│ 대형 로커: [☑ 있음]                     │
│                                         │
│           [제보하기]                     │
└─────────────────────────────────────────┘
```

### 5. MicroVoteButton 컴포넌트 (Req 5.10)

FacilityCard 하단에 표시되는 시설 단위 단일 투표 UI. 개별 속성이 아닌 시설 전체 정보의 정확성을 검증합니다.

```
┌──────────────────────────────────────────────┐
│ 이 정보가 정확한가요?  [👍 정확해요] [👎 아니에요] │
└──────────────────────────────────────────────┘
```

- 시설당 1인 1투표 (재투표 시 기존 값 토글/업데이트)
- 이미 투표한 경우 선택 상태 하이라이트 표시
- 투표 후 verificationScore 실시간 업데이트
- 로그인하지 않은 유저에게는 로그인 유도 메시지 표시

## File Structure (신규/변경 파일)

```
src/
├── types/
│   ├── spot.ts                          # FacilityType, NearbyFacility 확장
│   └── facility.ts                      # 카테고리별 상세 인터페이스 (신규)
├── lib/
│   └── facility-utils.ts                # groupFacilitiesByType 확장
├── app/api/
│   ├── spots/[id]/facilities/route.ts   # GET 확장 (type, status 필터)
│   └── facilities/
│       ├── report/route.ts              # POST 제보 API (신규)
│       └── [id]/vote/route.ts           # POST 투표 API (신규)
├── components/spot/
│   ├── NearbyFacilities.tsx             # FACILITY_CONFIG 확장, 필터 추가
│   ├── FacilityCard.tsx                 # 카테고리별 상세 렌더링 확장
│   ├── FacilityFilter.tsx               # 카테고리 필터 칩 (신규)
│   ├── FacilityReportForm.tsx           # 제보 폼 모달 (신규)
│   └── MicroVoteButton.tsx              # 마이크로 투표 버튼 (신규)
└── hooks/
    └── useSpotDetail.ts                 # useNearbyFacilities 확장
```

## Correctness Properties

### Property 1: 카테고리 분류 무결성

모든 편의시설은 정확히 하나의 FacilityType에 속해야 하며, groupFacilitiesByType 함수는 입력된 모든 시설을 누락 없이 분류해야 한다.

```
∀ facilities: NearbyFacility[] →
  sum(grouped[type].length for type in FacilityType) === facilities.length
```

### Property 2: 하위 호환성

Legacy_Category 편의시설은 otakuDetails 필드 없이도 정상 렌더링되어야 한다.

```
∀ facility where facility.type ∈ LegacyFacilityType →
  render(facility) succeeds regardless of otakuDetails presence
```

### Property 3: 투표 중복 방지 불변식

동일 유저가 동일 시설에 대해 투표하면, facility_votes 컬렉션에는 항상 최대 1개의 문서만 존재해야 한다.

```
∀ (facilityId, userId) →
  count(facility_votes where facilityId AND userId) <= 1
```

### Property 4: Verification Score 범위 불변식

verificationScore는 항상 0~100 범위이며, upvotes + downvotes가 0이면 50이어야 한다.

```
∀ facility →
  0 <= facility.verificationScore <= 100
  AND (facility.upvotes + facility.downvotes === 0 → facility.verificationScore === 50)
```

### Property 5: Status 필터링 일관성

API 응답에 status가 'hidden'인 편의시설이 포함되어서는 안 된다.

```
∀ response from GET /api/spots/[id]/facilities →
  response.every(f => f.status !== 'hidden')
```

### Property 6: 제보 필수 필드 검증

name, type, coordinates 중 하나라도 누락되면 400 에러를 반환해야 한다.

```
∀ request to POST /api/facilities/report →
  missing(name OR type OR coordinates) → response.status === 400
```
