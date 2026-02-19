# Design: Zustand 전역 상태 관리 리팩토링

## Overview

컴포넌트 로컬 상태를 zustand 전역 스토어로 이전하여 상태 관리를 개선합니다.

## 관련 문서

- 요구사항: #[[file:.kiro/specs/zustand-global-state/requirements.md]]
- 기존 스토어: #[[file:src/stores/mapStore.ts]], #[[file:src/stores/uiStore.ts]]

## Architecture

### 새로운 스토어 구조

```
src/stores/
├── mapStore.ts      (기존)
├── uiStore.ts       (기존)
├── likeStore.ts     (신규) - 좋아요 상태 관리
├── authStore.ts     (신규) - 인증 UI 상태 관리
└── filterStore.ts   (신규) - 카테고리 필터 상태 관리
```

## Detailed Design

### 1. likeStore - 좋아요 상태 관리

```typescript
// src/stores/likeStore.ts
interface LikeStore {
  likedSceneIds: Set<string>
  isLoadingLikes: boolean

  setLikedSceneIds: (ids: Set<string>) => void
  addLikedScene: (sceneId: string) => void
  removeLikedScene: (sceneId: string) => void
  toggleLikedScene: (sceneId: string) => void
  setLoadingLikes: (loading: boolean) => void
  resetLikeState: () => void
}
```

**사용처:**

- SceneGallery.tsx
- SceneImageModal.tsx
- useScenes.ts

### 2. authStore - 인증 UI 상태 관리

```typescript
// src/stores/authStore.ts
interface AuthStore {
  isLoggingOut: boolean
  authError: string | null

  setLoggingOut: (value: boolean) => void
  setAuthError: (error: string | null) => void
  clearAuthError: () => void
  resetAuthState: () => void
}
```

**사용처:**

- useAuth.ts
- 로그인/로그아웃 관련 컴포넌트

### 3. filterStore - 카테고리 필터 상태 관리

```typescript
// src/stores/filterStore.ts
interface FilterStore {
  selectedCategories: SpotCategory[]

  setSelectedCategories: (categories: SpotCategory[]) => void
  toggleCategory: (category: SpotCategory) => void
  clearCategories: () => void
  resetFilterState: () => void
}
```

**사용처:**

- CategoryFilter.tsx
- PilgrimageMap.tsx
- useSpots.ts

## Data Flow

### 좋아요 상태 흐름

```
SceneGallery
    │
    ├── useEffect: fetchLikeStatuses
    │       └── likeStore.setLikedSceneIds()
    │
    └── handleLike
            └── toggleLike.mutate()
                    └── onSuccess: likeStore.toggleLikedScene()
```

### 카테고리 필터 흐름

```
CategoryFilter
    │
    └── onClick: filterStore.toggleCategory()
            │
            └── useSpots(filterStore.selectedCategories)
                    └── API 호출
```

## Migration Strategy

1. 새 스토어 파일 생성
2. 기존 컴포넌트에서 로컬 상태를 스토어로 교체
3. 테스트 및 검증
4. 불필요한 로컬 상태 코드 제거

## Correctness Properties

### Property 1: 좋아요 상태 일관성

좋아요 토글 후 스토어 상태와 UI 표시가 일치해야 한다.

```typescript
// 좋아요 토글 후
const isLiked = likeStore.likedSceneIds.has(sceneId)
// UI에서 표시되는 좋아요 상태와 동일해야 함
```

### Property 2: 필터 상태 동기화

필터 변경 시 지도와 목록이 동일한 필터를 적용해야 한다.

```typescript
// CategoryFilter에서 선택한 카테고리
filterStore.selectedCategories
// useSpots에서 사용하는 카테고리와 동일해야 함
```

## Testing Strategy

- 각 스토어의 액션 함수 단위 테스트
- 컴포넌트 통합 테스트 (스토어 연동 확인)
