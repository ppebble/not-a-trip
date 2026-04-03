---
inclusion: always
---

# Not a Trip 프로젝트 컨텍스트

## 프로젝트 개요

"Not a Trip"은 일반 관광지가 아닌 특별한 여행지를 공유하고 탐색할 수 있는 웹 플랫폼입니다.
애니메이션 성지순례, 축구 직관, 영화/드라마 촬영지, 콘서트 장소, 게임 관련 장소 등 팬들만 아는 특별한 장소를 사용자들이 직접 등록하고 공유할 수 있습니다.

## GitHub 리포지토리

- owner: `ppebble`
- repo: `not-a-trip`
- default branch: `develop`
- URL: https://github.com/ppebble/not-a-trip

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (native driver, mongoose 미사용)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **State Management**: Zustand
- **Map**: Leaflet (react-leaflet)
- **PWA**: @serwist/next (Service Worker, 프리캐싱, 오프라인 폴백)
- **Monitoring**: Sentry (@sentry/nextjs)
- **Testing**: Jest + @testing-library/react + fast-check (PBT)
- **SEO**: next-sitemap, Google Analytics

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
  | 'sports'    // 스포츠 (축구, 야구 등)
  | 'movie_drama' // 영화/드라마
  | 'music'     // 음악/콘서트
  | 'game'      // 게임/e스포츠
  | 'other'     // 기타
```

## 주요 API 엔드포인트

- `GET/POST /api/spots` — 스팟 목록/등록
- `GET/PUT/DELETE /api/spots/[id]` — 스팟 상세/수정/삭제
- `GET/POST /api/spots/[id]/scenes` — 장면 목록/등록
- `GET/POST /api/posts` — 게시글 목록/등록
- `GET /api/spots/[id]/facilities` — 주변 편의시설

## 폴더 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── api/               # API Routes
│   ├── auth/              # 인증 페이지
│   ├── community/         # 커뮤니티 페이지
│   ├── offline/           # 오프라인 폴백 페이지 (PWA)
│   └── spots/             # 스팟 관련 페이지
├── components/
│   ├── common/            # 공통 컴포넌트
│   ├── community/         # 커뮤니티 컴포넌트
│   ├── layout/            # 레이아웃 (Header 등)
│   ├── map/               # 지도 관련 컴포넌트
│   ├── pwa/               # PWA 컴포넌트 (SerwistRegistration, InstallPromptListener 등)
│   └── spot/              # 스팟 관련 컴포넌트
├── hooks/                 # Custom Hooks
├── lib/                   # 유틸리티 및 설정
├── stores/                # Zustand 스토어
├── sw.ts                  # Serwist Service Worker 소스
└── types/                 # TypeScript 타입 정의
```

## 환경 변수

```env
MONGODB_URI=mongodb://localhost:27017/anime-pilgrimage
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
```
