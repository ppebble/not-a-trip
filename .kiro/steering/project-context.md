# Not a Trip 프로젝트 컨텍스트

## 프로젝트 개요

"Not a Trip"은 일반 관광지가 아닌 특별한 여행지를 공유하고 탐색할 수 있는 웹 플랫폼입니다.
애니메이션 성지순례, 축구 직관, 영화/드라마 촬영지, 콘서트 장소, 게임 관련 장소 등 팬들만 아는 특별한 장소를 사용자들이 직접 등록하고 공유할 수 있습니다.

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (native driver, mongoose 미사용)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Map**: Leaflet (react-leaflet)

## 데이터 모델 요약

### Spot (스팟)

```typescript
interface Spot {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: { lat: number; lng: number }
  category: SpotCategory
  relatedContent: RelatedContent[]
  authorId?: string
  authorName: string
  isGuestSpot: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Scene (작품 속 장면)

- 애니메이션/영화/드라마 카테고리 전용
- 스팟과 연결된 작품 속 장면 이미지

### Post (커뮤니티 게시글)

- 스팟 또는 작품별 커뮤니티 게시글

### Facility (주변 편의시설)

- 스팟 주변의 음식점, 카페, 편의점, 역 등

## 카테고리 시스템

```typescript
type SpotCategory =
  | 'animation' // 애니메이션/만화
  | 'sports' // 스포츠 (축구, 야구 등)
  | 'movie_drama' // 영화/드라마
  | 'music' // 음악/콘서트
  | 'game' // 게임/e스포츠
  | 'other' // 기타

const CATEGORY_CONFIG = {
  animation: { icon: '🎬', color: '#FF6B6B', label: '애니메이션' },
  sports: { icon: '⚽', color: '#4ECDC4', label: '스포츠' },
  movie_drama: { icon: '🎥', color: '#45B7D1', label: '영화/드라마' },
  music: { icon: '🎵', color: '#96CEB4', label: '음악/콘서트' },
  game: { icon: '🎮', color: '#DDA0DD', label: '게임' },
  other: { icon: '📍', color: '#95A5A6', label: '기타' },
}
```

## 관련 Spec 목록

| Spec 이름                 | 설명                                      | 상태   |
| ------------------------- | ----------------------------------------- | ------ |
| anime-pilgrimage-map      | 초기 프로젝트 설정                        | 완료   |
| not-a-trip-rebrand        | 리브랜딩 및 카테고리 확장                 | 진행중 |
| category-specific-content | 카테고리별 콘텐츠 섹션 (외부 링크 시스템) | 예정   |

### category-specific-content Spec 요약

- **목적**: 카테고리별로 적합한 콘텐츠 섹션 표시
- **주요 기능**:
  - 애니메이션/영화/드라마 → "작품 속 장면" 섹션
  - 스포츠/음악 → "이벤트 정보" 섹션 (외부 링크)
  - 게임 → 둘 다 표시
- **데이터 관리**: 외부 링크 시스템 (공식 홈페이지, 티켓 예매 등)

## 주요 API 엔드포인트

- `GET/POST /api/spots` - 스팟 목록/등록
- `GET/PUT/DELETE /api/spots/[id]` - 스팟 상세/수정/삭제
- `GET/POST /api/spots/[id]/scenes` - 장면 목록/등록
- `GET/POST /api/posts` - 게시글 목록/등록
- `GET /api/spots/[id]/facilities` - 주변 편의시설

## 폴더 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── api/               # API Routes
│   ├── auth/              # 인증 페이지
│   ├── community/         # 커뮤니티 페이지
│   └── spots/             # 스팟 관련 페이지
├── components/            # React 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   ├── community/        # 커뮤니티 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── map/              # 지도 관련 컴포넌트
│   └── spot/             # 스팟 관련 컴포넌트
├── hooks/                 # Custom Hooks
├── lib/                   # 유틸리티 및 설정
├── stores/                # Zustand 스토어
└── types/                 # TypeScript 타입 정의
```

## 환경 변수

```env
MONGODB_URI=mongodb://localhost:27017/anime-pilgrimage
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
```
