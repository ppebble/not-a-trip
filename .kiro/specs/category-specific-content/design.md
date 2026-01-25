# Design Document: 카테고리별 콘텐츠 섹션

## Overview

스팟 상세 페이지에서 카테고리에 따라 적합한 콘텐츠 섹션을 표시합니다. 외부 링크 시스템을 통해 공식 사이트, 예매 페이지 등으로 쉽게 연결할 수 있습니다.

## Architecture Changes

### 데이터 모델 확장

```typescript
// 외부 링크 타입
type ExternalLinkType = 'official' | 'ticket' | 'schedule' | 'sns' | 'other'

// 외부 링크 인터페이스
interface ExternalLink {
  id: string
  type: ExternalLinkType
  label: string // "공식 홈페이지", "티켓 예매" 등
  url: string // https://...
  icon?: string // 선택적 아이콘
}

// 링크 타입별 설정
const LINK_TYPE_CONFIG = {
  official: { label: '공식 홈페이지', icon: '🏠', color: '#3B82F6' },
  ticket: { label: '티켓 예매', icon: '🎫', color: '#10B981' },
  schedule: { label: '일정 확인', icon: '📅', color: '#F59E0B' },
  sns: { label: 'SNS', icon: '📱', color: '#8B5CF6' },
  other: { label: '기타', icon: '🔗', color: '#6B7280' },
}

// 확장된 Spot 모델
interface Spot {
  // ... 기존 필드
  externalLinks?: ExternalLink[] // 새로 추가
}
```

### 카테고리별 섹션 매핑

```typescript
// 카테고리별 표시할 섹션
const CATEGORY_SECTIONS = {
  animation: ['scenes'], // 작품 속 장면
  movie_drama: ['scenes'], // 작품 속 장면
  sports: ['events'], // 이벤트 정보 (경기 일정)
  music: ['events'], // 이벤트 정보 (공연 정보)
  game: ['scenes', 'events'], // 둘 다
  other: ['info'], // 일반 정보
}

// 섹션별 헤더 텍스트
const SECTION_HEADERS = {
  scenes: {
    animation: '작품 속 장면',
    movie_drama: '작품 속 장면',
    game: '게임 속 장면',
  },
  events: {
    sports: '경기 일정',
    music: '공연 정보',
    game: 'e스포츠 경기',
  },
}
```

## Components

### SpotContentSection

카테고리에 따라 적절한 섹션을 렌더링하는 컨테이너 컴포넌트

```typescript
interface SpotContentSectionProps {
  spot: Spot
  category: SpotCategory
}

// 사용 예시
<SpotContentSection spot={spot} category={spot.category} />
```

### EventInfoSection

스포츠/음악 카테고리용 이벤트 정보 섹션

```typescript
interface EventInfoSectionProps {
  spotId: string
  category: 'sports' | 'music' | 'game'
  externalLinks: ExternalLink[]
}
```

### ExternalLinkCard

외부 링크를 표시하는 카드 컴포넌트

```typescript
interface ExternalLinkCardProps {
  link: ExternalLink
  onClick?: () => void
}
```

### ExternalLinkForm

외부 링크 추가/수정 폼 컴포넌트

```typescript
interface ExternalLinkFormProps {
  links: ExternalLink[]
  onChange: (links: ExternalLink[]) => void
  category: SpotCategory
}
```

## UI Design

### 이벤트 정보 섹션 레이아웃

```
┌─────────────────────────────────────────┐
│ ⚽ 경기 일정                             │
├─────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐         │
│ │ 🏠 공식 홈페이지 │ │ 🎫 티켓 예매   │         │
│ │ FC 바르셀로나  │ │ 티켓마스터    │         │
│ │ [바로가기 →]  │ │ [바로가기 →]  │         │
│ └─────────────┘ └─────────────┘         │
│ ┌─────────────┐                         │
│ │ 📅 경기 일정   │                         │
│ │ 라리가 공식   │                         │
│ │ [바로가기 →]  │                         │
│ └─────────────┘                         │
├─────────────────────────────────────────┤
│ 💡 팁: 경기 당일은 혼잡할 수 있으니        │
│     미리 예매하세요!                      │
└─────────────────────────────────────────┘
```

### 외부 링크 추가 폼

```
┌─────────────────────────────────────────┐
│ 외부 링크 추가                           │
├─────────────────────────────────────────┤
│ 링크 타입                                │
│ [공식 홈페이지 ▼]                        │
│                                         │
│ 링크 이름                                │
│ [FC 바르셀로나 공식 사이트          ]    │
│                                         │
│ URL                                     │
│ [https://www.fcbarcelona.com      ]    │
│                                         │
│              [취소] [추가]               │
└─────────────────────────────────────────┘
```

## API Changes

### Spot API 확장

```typescript
// PUT /api/spots/[id] - externalLinks 필드 추가
interface UpdateSpotInput {
  // ... 기존 필드
  externalLinks?: ExternalLink[]
}

// 유효성 검사
- URL 형식 검증 (https:// 시작)
- 최대 10개 링크 제한
- 중복 URL 방지
```

## Data Management Strategy

### 방안: 하이브리드 접근 (외부 링크 + 사용자 기여)

**1단계 (MVP)**: 외부 링크만 제공

- 스팟 작성자가 공식 사이트, 예매 페이지 링크 추가
- 구현 간단, 유지보수 쉬움
- 데이터 정확성 보장 (공식 사이트 연결)

**2단계 (확장)**: 사용자 이벤트 등록 (향후)

- 커뮤니티에서 "다가오는 이벤트" 등록 기능
- 좋아요/신고 시스템으로 품질 관리

**3단계 (고도화)**: API 연동 (향후)

- 인기 스팟에 한해 실시간 일정 연동
- Football-Data.org, Ticketmaster API 등

## Error Handling

| Error Type      | HTTP Status | Response                                |
| --------------- | ----------- | --------------------------------------- |
| 잘못된 URL 형식 | 400         | `{ error: "Invalid URL format" }`       |
| 링크 개수 초과  | 400         | `{ error: "Maximum 10 links allowed" }` |
| 중복 URL        | 400         | `{ error: "Duplicate URL" }`            |

## Testing Strategy

### Unit Tests

- URL 유효성 검사 로직
- 카테고리별 섹션 매핑 로직
- ExternalLink 컴포넌트 렌더링

### Integration Tests

- 스팟 등록/수정 시 외부 링크 저장
- 스팟 상세 페이지에서 카테고리별 섹션 표시
