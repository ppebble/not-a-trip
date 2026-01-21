# Design Document: Not a Trip Rebrand

## Overview

기존 "애니메이션 성지순례 맵" 플랫폼을 "Not a Trip"으로 리브랜딩하고, 다양한 카테고리의 특별한 여행지를 지원하도록 확장합니다. 사용자가 직접 스팟을 등록할 수 있는 기능을 추가합니다.

## Architecture Changes

### 카테고리 시스템

```typescript
// 스팟 카테고리 정의
type SpotCategory =
  | 'animation' // 애니메이션/만화
  | 'sports' // 스포츠 (축구, 야구 등)
  | 'movie_drama' // 영화/드라마
  | 'music' // 음악/콘서트
  | 'game' // 게임/e스포츠
  | 'other' // 기타

// 카테고리별 아이콘 및 색상
const CATEGORY_CONFIG = {
  animation: { icon: '🎬', color: '#FF6B6B', label: '애니메이션' },
  sports: { icon: '⚽', color: '#4ECDC4', label: '스포츠' },
  movie_drama: { icon: '🎥', color: '#45B7D1', label: '영화/드라마' },
  music: { icon: '🎵', color: '#96CEB4', label: '음악/콘서트' },
  game: { icon: '🎮', color: '#DDA0DD', label: '게임' },
  other: { icon: '📍', color: '#95A5A6', label: '기타' },
}
```

### 데이터 모델 변경

```typescript
// 기존 MediaInfo → RelatedContent로 확장
interface RelatedContent {
  name: string // 콘텐츠 이름 (작품명, 팀명, 아티스트명 등)
  type: ContentType // 콘텐츠 타입
  year?: number // 연도 (선택)
  additionalInfo?: string // 추가 정보 (에피소드, 시즌 등)
}

type ContentType =
  | 'anime' // 애니메이션
  | 'movie' // 영화
  | 'drama' // 드라마
  | 'sports_team' // 스포츠 팀
  | 'artist' // 아티스트/가수
  | 'game' // 게임
  | 'other' // 기타

// 확장된 Spot 모델
interface Spot {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: Coordinates
  category: SpotCategory // 새로 추가
  relatedContent: RelatedContent[] // relatedMedia에서 변경
  createdAt: Date
  updatedAt: Date
  // 작성자 정보
  authorId?: string // 회원 작성자
  authorName: string // 작성자 이름
  isGuestSpot: boolean // 비회원 등록 여부
  password?: string // 비회원 수정/삭제용 (해시)
}
```

## Components

### SpotRegistrationPage

스팟 등록 페이지 컴포넌트입니다.

```typescript
// src/app/spots/register/page.tsx
interface SpotRegistrationForm {
  name: string
  description: string
  address: string
  coordinates: Coordinates | null
  category: SpotCategory
  photos: File[]
  relatedContent: RelatedContent[]
  // 비회원용
  authorName?: string
  password?: string
}
```

### AddressSearch Component

주소 검색 컴포넌트입니다.

```typescript
interface AddressSearchProps {
  onSelect: (address: string, coordinates: Coordinates) => void
  initialValue?: string
}
```

### LocationPicker Component

지도에서 위치를 선택하는 컴포넌트입니다.

```typescript
interface LocationPickerProps {
  initialCoordinates?: Coordinates
  onLocationChange: (coordinates: Coordinates) => void
  onAddressSuggestion?: (address: string) => void
}
```

### CategoryFilter Component

카테고리 필터 컴포넌트입니다.

```typescript
interface CategoryFilterProps {
  selectedCategories: SpotCategory[]
  onChange: (categories: SpotCategory[]) => void
}
```

## API Routes

### Spot Registration API

```typescript
// POST /api/spots - 스팟 등록
interface CreateSpotInput {
  name: string
  description: string
  address: string
  coordinates: Coordinates
  category: SpotCategory
  photos?: string[]
  relatedContent?: RelatedContent[]
  // 작성자 정보
  authorName?: string
  password?: string // 비회원용
}

// PUT /api/spots/[id] - 스팟 수정
interface UpdateSpotInput {
  name?: string
  description?: string
  address?: string
  coordinates?: Coordinates
  category?: SpotCategory
  photos?: string[]
  relatedContent?: RelatedContent[]
  password?: string // 비회원 수정 시
}

// DELETE /api/spots/[id] - 스팟 삭제
// Body: { password?: string } // 비회원 삭제 시
```

### Category Filter API

```typescript
// GET /api/spots?category=animation,sports
// 카테고리 필터링 지원
```

## UI Changes

### Header 변경사항

- 로고/사이트명: "Not a Trip"
- 네비게이션: 홈 | 커뮤니티 | 스팟 등록 | 로그인/프로필

### 메인 페이지 변경사항

- 카테고리 필터 UI 추가 (상단 또는 사이드바)
- 스팟 핀에 카테고리별 색상/아이콘 적용

### 스팟 등록 페이지 구조

```
┌─────────────────────────────────────────┐
│ 스팟 등록                                │
├─────────────────────────────────────────┤
│ 기본 정보                                │
│ ┌─────────────────────────────────────┐ │
│ │ 스팟 이름 *                          │ │
│ │ [                                 ] │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 카테고리 *                           │ │
│ │ [애니메이션 ▼]                       │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 설명 *                               │ │
│ │ [                                 ] │ │
│ │ [                                 ] │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 위치 정보                                │
│ ┌─────────────────────────────────────┐ │
│ │ 주소 검색                            │ │
│ │ [검색어 입력...        ] [검색]      │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │         [지도 - 클릭하여 위치 선택]    │ │
│ │                 📍                   │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 사진 (최대 5장)                          │
│ [+ 사진 추가] [📷] [📷] [📷]            │
├─────────────────────────────────────────┤
│ 관련 콘텐츠                              │
│ [+ 콘텐츠 추가]                          │
│ ┌─────────────────────────────────────┐ │
│ │ 너의 이름은 (애니메이션, 2016)        │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 작성자 정보 (비회원)                      │
│ [닉네임    ] [비밀번호 *]                │
├─────────────────────────────────────────┤
│                          [취소] [등록]   │
└─────────────────────────────────────────┘
```

## Migration Plan

### 데이터 마이그레이션

1. `relatedMedia` → `relatedContent` 필드명 변경
2. 기존 `type` 값 매핑: anime→anime, drama→drama, movie→movie, other→other
3. 기존 스팟에 `category: 'animation'` 기본값 설정
4. 기존 스팟에 `isGuestSpot: false`, `authorName: 'System'` 설정

## Correctness Properties

### Property 1: 스팟 등록 필수 필드 검증

_For any_ 스팟 등록 요청에서, 이름, 설명, 주소, 좌표, 카테고리가 없으면 등록이 거부되어야 합니다.

**Validates: Requirements 4.2, 4.6**

### Property 2: 카테고리 필터 정확성

_For any_ 카테고리 필터 적용 시, 반환되는 모든 스팟은 선택된 카테고리에 속해야 합니다.

**Validates: Requirements 2.2**

### Property 3: 스팟 수정 권한 검증

_For any_ 스팟 수정 요청에서, 회원은 본인 스팟만, 비회원은 비밀번호 일치 시에만 수정 가능해야 합니다.

**Validates: Requirements 6.2, 6.3**

## Error Handling

| Error Type      | HTTP Status | Response                                         |
| --------------- | ----------- | ------------------------------------------------ |
| 필수 필드 누락  | 400         | `{ error: "Validation failed", details: [...] }` |
| 권한 없음       | 403         | `{ error: "Permission denied" }`                 |
| 스팟 없음       | 404         | `{ error: "Spot not found" }`                    |
| 비밀번호 불일치 | 403         | `{ error: "Invalid password" }`                  |

## Testing Strategy

### Unit Tests

- 스팟 등록 폼 유효성 검사
- 카테고리 필터 로직
- 권한 검증 로직

### Property-Based Tests

- 스팟 등록 필수 필드 검증 (Property 1)
- 카테고리 필터 정확성 (Property 2)
- 스팟 수정 권한 검증 (Property 3)
