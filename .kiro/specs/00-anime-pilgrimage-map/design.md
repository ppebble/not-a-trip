# Design Document: Anime Pilgrimage Map

## Overview

애니메이션 성지순례 스팟 공유 웹 플랫폼의 설계 문서입니다. Next.js App Router 기반 풀스택 구조로, TanStack Query로 서버 상태 관리, Zustand로 클라이언트 상태 관리를 합니다. 지도 서비스는 Leaflet을 활용하고, 네이비 테마의 UI와 반응형 디자인을 적용합니다.

## Tech Stack

| Category           | Technology                               |
| ------------------ | ---------------------------------------- |
| Framework          | Next.js 15 (App Router)                  |
| Language           | TypeScript                               |
| Server State       | TanStack Query v5                        |
| Client State       | Zustand                                  |
| Styling            | Tailwind CSS 또는 PandaCSS (사용자 선택) |
| Map                | Leaflet + react-leaflet                  |
| Database           | MongoDB                                  |
| Linting/Formatting | ESLint, Prettier (사용자 별도 설정)      |

## Architecture

```mermaid
graph TB
    subgraph Frontend["Frontend (Next.js App Router)"]
        Pages[Pages/Routes]
        Components[React Components]
        TanStackQuery[TanStack Query]
        Zustand[Zustand Store]
    end

    subgraph API["Next.js API Routes"]
        SpotsAPI[/api/spots]
        PostsAPI[/api/posts]
        FacilitiesAPI[/api/facilities]
    end

    subgraph Database["Database"]
        MongoDB[(MongoDB)]
    end

    subgraph External["External Services"]
        Leaflet[Leaflet Maps]
    end

    Pages --> Components
    Components --> TanStackQuery
    Components --> Zustand
    TanStackQuery --> API
    Components --> Leaflet

    SpotsAPI --> MongoDB
    PostsAPI --> MongoDB
    FacilitiesAPI --> MongoDB
```

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # 메인 지도 페이지
│   ├── spots/
│   │   └── [id]/
│   │       └── page.tsx     # 스팟 상세 페이지
│   ├── community/
│   │   ├── page.tsx         # 게시판 목록
│   │   └── [id]/
│   │       └── page.tsx     # 게시글 상세
│   └── api/                 # API Routes
│       ├── spots/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── facilities/
│       │           └── route.ts
│       └── posts/
│           ├── route.ts
│           └── [id]/
│               ├── route.ts
│               └── comments/
│                   └── route.ts
├── components/              # React Components
│   ├── map/
│   │   ├── PilgrimageMap.tsx
│   │   ├── SpotPin.tsx
│   │   └── SpotPreview.tsx
│   ├── spot/
│   │   ├── SpotDetail.tsx
│   │   └── NearbyFacilities.tsx
│   └── community/
│       ├── PostList.tsx
│       ├── PostDetail.tsx
│       └── CommentSection.tsx
├── hooks/                   # TanStack Query hooks
│   ├── useSpots.ts
│   ├── useSpotDetail.ts
│   └── usePosts.ts
├── stores/                  # Zustand stores
│   ├── mapStore.ts
│   └── uiStore.ts
├── lib/                     # Utilities
│   ├── db.ts               # MongoDB connection
│   └── utils.ts
└── types/                   # TypeScript types
    └── index.ts
```

## Components and Interfaces

### Frontend Components

#### MapPage Component

메인 페이지의 지도 컴포넌트입니다.

```typescript
interface MapPageProps {
  initialCenter?: [number, number]
  initialZoom?: number
}

interface SpotPin {
  id: string
  name: string
  coordinates: [number, number]
  thumbnailUrl: string
}
```

#### SpotPreview Component

핀 클릭 시 표시되는 미리보기 팝업입니다.

```typescript
interface SpotPreviewProps {
  spot: SpotPreviewData
  onClose: () => void
  onDetailClick: (spotId: string) => void
}

interface SpotPreviewData {
  id: string
  name: string
  description: string
  photoUrl: string
  address: string
}
```

#### SpotDetail Component

스팟 상세 정보 페이지입니다.

```typescript
interface SpotDetailProps {
  spotId: string
}

interface SpotDetailData {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: [number, number]
  relatedMedia: MediaInfo[]
  nearbyFacilities: NearbyFacility[]
}

interface MediaInfo {
  title: string
  type: 'anime' | 'drama' | 'movie' | 'other'
  year?: number
}
```

#### NearbyFacilities Component

근처 편의시설 목록 컴포넌트입니다.

```typescript
interface NearbyFacility {
  id: string
  name: string
  type: FacilityType
  distance: number // meters
  address: string
  coordinates: [number, number]
}

type FacilityType =
  | 'restaurant'
  | 'convenience_store'
  | 'cafe'
  | 'station'
  | 'other'
```

#### CommunityBoard Component

커뮤니티 게시판 컴포넌트입니다.

```typescript
interface Post {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  viewCount: number
  commentCount: number
}

interface Comment {
  id: string
  postId: string
  content: string
  author: string
  createdAt: Date
}

interface CreatePostInput {
  title: string
  content: string
}

interface CreateCommentInput {
  postId: string
  content: string
}
```

### Zustand Stores

#### Map Store

지도 관련 클라이언트 상태를 관리합니다.

```typescript
interface MapStore {
  center: [number, number]
  zoom: number
  selectedSpotId: string | null
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  setSelectedSpot: (spotId: string | null) => void
}
```

#### UI Store

UI 관련 상태를 관리합니다.

```typescript
interface UIStore {
  isPreviewOpen: boolean
  isMobileMenuOpen: boolean
  openPreview: () => void
  closePreview: () => void
  toggleMobileMenu: () => void
}
```

### TanStack Query Hooks

```typescript
// useSpots.ts - 스팟 목록 조회
export function useSpots() {
  return useQuery({
    queryKey: ['spots'],
    queryFn: () => fetch('/api/spots').then((res) => res.json()),
  })
}

// useSpotDetail.ts - 스팟 상세 조회
export function useSpotDetail(spotId: string) {
  return useQuery({
    queryKey: ['spots', spotId],
    queryFn: () => fetch(`/api/spots/${spotId}`).then((res) => res.json()),
    enabled: !!spotId,
  })
}

// usePosts.ts - 게시글 관련
export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then((res) => res.json()),
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePostInput) =>
      fetch('/api/posts', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}
```

### API Routes (Next.js)

#### Spots API

```typescript
// GET /api/spots - 모든 스팟 목록 (핀 표시용)
// GET /api/spots/[id] - 스팟 상세 정보
// GET /api/spots/[id]/facilities - 스팟 근처 편의시설

interface SpotResponse {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: [number, number]
  relatedMedia: MediaInfo[]
}
```

#### Community API

```typescript
// GET /api/posts - 게시글 목록
// GET /api/posts/[id] - 게시글 상세
// POST /api/posts - 게시글 작성
// PUT /api/posts/[id] - 게시글 수정
// DELETE /api/posts/[id] - 게시글 삭제
// GET /api/posts/[id]/comments - 댓글 목록
// POST /api/posts/[id]/comments - 댓글 작성

interface UpdatePostInput {
  title?: string
  content?: string
}
```

## Data Models

### Spot Model

```typescript
interface Spot {
  _id: ObjectId
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  relatedMedia: {
    title: string
    type: string
    year?: number
  }[]
  createdAt: Date
  updatedAt: Date
}
```

### Facility Model

```typescript
interface Facility {
  _id: ObjectId
  name: string
  type: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
}
```

### Post Model

```typescript
interface Post {
  _id: ObjectId
  title: string
  content: string
  author: string
  viewCount: number
  createdAt: Date
  updatedAt: Date
}
```

### Comment Model

```typescript
interface Comment {
  _id: ObjectId
  postId: ObjectId
  content: string
  author: string
  createdAt: Date
}
```

## Correctness Properties

_정확성 속성(Correctness Property)은 시스템의 모든 유효한 실행에서 참이어야 하는 특성입니다. 이는 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 합니다._

### Property 1: 스팟 핀 좌표 일치

_For any_ Spot 데이터, 지도에 표시되는 Spot_Pin의 좌표는 해당 Spot의 저장된 좌표와 정확히 일치해야 합니다.

**Validates: Requirements 1.2**

### Property 2: 스팟 미리보기 필수 정보 포함

_For any_ Spot 데이터로 렌더링된 Spot_Preview는 스팟 이름, 사진, 설명, 주소를 모두 포함해야 합니다.

**Validates: Requirements 2.2**

### Property 3: 스팟 상세 필수 정보 포함

_For any_ Spot 데이터로 렌더링된 Spot_Detail 페이지는 스팟 이름, 사진들, 전체 설명, 주소, 관련 미디어 정보를 모두 포함해야 합니다.

**Validates: Requirements 3.2**

### Property 4: 편의시설 타입별 분류

_For any_ NearbyFacility 목록에 대해, 분류 함수는 모든 시설을 해당 타입(restaurant, convenience_store, cafe, station, other)으로 올바르게 그룹화해야 합니다.

**Validates: Requirements 3.4, 4.2**

### Property 5: 편의시설 필수 정보 포함

_For any_ NearbyFacility 렌더링은 시설 이름, 타입, 스팟으로부터의 거리, 주소를 모두 포함해야 합니다.

**Validates: Requirements 4.1**

### Property 6: 게시글 목록 필수 정보 포함

_For any_ Post 목록 렌더링은 각 게시글의 제목, 작성자, 날짜, 조회수를 모두 포함해야 합니다.

**Validates: Requirements 5.1**

### Property 7: 게시글 유효성 검사

_For any_ 제목 또는 내용이 비어있거나 공백만 있는 CreatePostInput은 거부되어야 하고, 게시글이 생성되지 않아야 합니다.

**Validates: Requirements 5.2**

### Property 8: 댓글 시간순 정렬

_For any_ 댓글 목록에 대해, 표시되는 댓글들은 생성 시간 기준으로 오름차순 정렬되어야 합니다.

**Validates: Requirements 5.4**

### Property 9: 스팟 데이터 직렬화 라운드트립

_For any_ 유효한 Spot 객체에 대해, JSON으로 직렬화한 후 다시 역직렬화하면 원본과 동등한 객체가 생성되어야 합니다.

**Validates: Requirements 6.3**

## Error Handling

### Frontend Error Handling

| Error Type       | Handling Strategy                             |
| ---------------- | --------------------------------------------- |
| API 요청 실패    | 사용자에게 에러 메시지 표시, 재시도 버튼 제공 |
| 지도 로딩 실패   | 대체 메시지 표시, 새로고침 안내               |
| 이미지 로딩 실패 | 기본 플레이스홀더 이미지 표시                 |
| 유효성 검사 실패 | 인라인 에러 메시지 표시                       |

### Backend Error Handling

| Error Type        | HTTP Status | Response                                         |
| ----------------- | ----------- | ------------------------------------------------ |
| 리소스 없음       | 404         | `{ error: "Resource not found" }`                |
| 유효성 검사 실패  | 400         | `{ error: "Validation failed", details: [...] }` |
| 서버 에러         | 500         | `{ error: "Internal server error" }`             |
| 데이터베이스 에러 | 500         | `{ error: "Database error" }`                    |

## Testing Strategy

### Unit Tests

단위 테스트는 개별 컴포넌트와 함수의 특정 동작을 검증합니다.

- 컴포넌트 렌더링 테스트 (React Testing Library)
- API 엔드포인트 테스트 (Supertest)
- 유틸리티 함수 테스트
- 에지 케이스 및 에러 조건 테스트

### Property-Based Tests

속성 기반 테스트는 fast-check 라이브러리를 사용하여 다양한 입력에 대해 보편적 속성을 검증합니다.

**테스트 설정:**

- 라이브러리: fast-check (TypeScript/JavaScript)
- 최소 반복 횟수: 100회
- 각 테스트는 설계 문서의 속성을 참조하는 태그 포함

**테스트 태그 형식:**

```typescript
// Feature: anime-pilgrimage-map, Property 9: 스팟 데이터 직렬화 라운드트립
// Validates: Requirements 6.3
```

### Test Coverage Goals

| Category            | Coverage Target |
| ------------------- | --------------- |
| Core Business Logic | 90%             |
| API Endpoints       | 85%             |
| UI Components       | 80%             |
| Utility Functions   | 95%             |
