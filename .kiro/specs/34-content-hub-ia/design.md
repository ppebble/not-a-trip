# Design Document: Content Hub IA

## Overview

"Not a Trip" 서비스의 정보 구조(IA)를 재구성하여 작품 중심 탐색 흐름을 서비스의 대표 경로로 승격시킨다. 주요 변경사항:

1. **헤더 네비게이션**: "작품 탐색" 링크 추가 (홈 다음 위치)
2. **작품 목록 페이지** (`/contents`): 전체 작품을 그리드 카드로 탐색
3. **작품 허브 페이지** (`/contents/[name]`): 기존 ContentSpotsClient를 확장하여 개요 → 대표 스팟 → 관련 코스 → 최근 인증 → 전체 스팟 구조로 재구성
4. **랜딩 페이지 진입점**: HeroSection 아래에 목적별 3개 카드 진입점 추가
5. **자동완성 드롭다운**: "작품 페이지로 이동" 부가 링크 추가

## Architecture

### 페이지 구조

```mermaid
graph TD
    A[Header - "작품 탐색" 링크] --> B[/contents - 작품 목록 페이지]
    B --> C[/contents/name - 작품 허브 페이지]
    D[Landing /welcome - EntryPointSection] --> B
    D --> E[/routes]
    D --> F[/gallery]
    G[Map - AutocompleteDropdown] --> C
    C --> H[기존 스팟 목록+지도 뷰]
```

### 신규 페이지

| 경로 | 렌더링 방식 | 설명 |
|------|------------|------|
| `/contents` | Server Component | 작품 목록 페이지 (API 호출 → 그리드 렌더) |
| `/contents/[name]` | Client Component (확장) | 작품 허브 페이지 (기존 ContentSpotsClient 확장) |

### 신규/수정 API

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `GET /api/contents` | GET | 작품 목록 조회 (contentName, contentType, spotCount, imageUrl) |
| `GET /api/contents/[name]/courses` | GET | 작품 관련 코스 조회 |
| `GET /api/checkins?contentName=X&limit=6` | GET | 기존 API 활용 — 작품 최근 인증 |

### 신규 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|---------|------|------|
| `ContentListPage` | `src/app/(main)/contents/page.tsx` | 작품 목록 서버 컴포넌트 |
| `ContentListClient` | `src/components/content/ContentListClient.tsx` | 작품 목록 클라이언트 (필터/검색) |
| `ContentCard` | `src/components/content/ContentCard.tsx` | 작품 카드 컴포넌트 |
| `ContentHubClient` | `src/components/content/ContentHubClient.tsx` | 작품 허브 페이지 (ContentSpotsClient 확장) |
| `EntryPointSection` | `src/components/landing/EntryPointSection.tsx` | 랜딩 페이지 목적별 진입점 |

## Components and Interfaces

### 1. Header 수정

```typescript
// 데스크톱/모바일 네비게이션에 "작품 탐색" 링크 추가
// 활성 상태 판단: pathname.startsWith('/contents')
const isContentsActive = pathname.startsWith('/contents')
```

### 2. ContentListClient

```typescript
interface ContentListItem {
  contentName: string
  contentType: ContentType
  spotCount: number
  imageUrl: string | null
}

interface ContentListClientProps {
  initialContents: ContentListItem[]
}

// 클라이언트 상태: typeFilter, searchQuery
// 필터링은 클라이언트 사이드 (초기 데이터는 서버에서 전체 fetch)
```

### 3. ContentCard

```typescript
interface ContentCardProps {
  content: ContentListItem
}

// 카드 클릭 → /contents/{encodeURIComponent(contentName)}
// 표시: 작품명, 타입 라벨, 스팟 수, 대표 이미지
```

### 4. ContentHubClient (ContentSpotsClient 확장)

```typescript
interface ContentHubClientProps {
  contentName: string
}

// 섹션 구조:
// 1. 개요 (작품명, 타입, 연도, 대표 이미지, 총 스팟 수, 총 인증 수)
// 2. 대표 스팟 (인증 수 상위 3개)
// 3. 관련 코스 (relatedContentNames 매칭)
// 4. 최근 인증 (최대 6개)
// 5. 전체 스팟 보기 링크 → 기존 지도+목록 뷰
```

### 5. EntryPointSection

```typescript
interface EntryPoint {
  icon: string
  title: string
  description: string
  href: string
}

const ENTRY_POINTS: EntryPoint[] = [
  { icon: '🎬', title: '작품으로 찾기', description: '좋아하는 작품의 성지를 탐색하세요', href: '/contents' },
  { icon: '🗺️', title: '코스로 따라가기', description: '큐레이션된 순례 코스를 따라가세요', href: '/routes' },
  { icon: '📸', title: '인증 둘러보기', description: '다른 순례자들의 인증을 구경하세요', href: '/gallery' },
]
```

### 6. AutocompleteDropdown 수정

```typescript
// 각 항목에 "작품 페이지로 이동" 링크 추가
// 기존 onSelect 동작 유지 (지도 필터링)
// 추가 링크 클릭 시 /contents/{encodedName}으로 이동
```

### 7. 뒤로가기 로직

```typescript
function handleBack(router: AppRouterInstance) {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/contents')
  }
}
```

## Data Models

### ContentListItem (API 응답)

```typescript
interface ContentListItem {
  contentName: string       // 작품명
  contentType: ContentType  // 작품 타입 (anime, movie, drama, ...)
  spotCount: number         // 등록된 스팟 수
  imageUrl: string | null   // 대표 이미지 URL
}
```

### GET /api/contents 응답

```typescript
interface ContentsResponse {
  contents: ContentListItem[]
  total: number
}
```

### GET /api/contents/[name]/courses 응답

```typescript
interface ContentCoursesResponse {
  courses: Route[]  // 기존 Route 타입 재사용
  total: number
}
```

### MongoDB Aggregation (작품 목록)

`spot_content_relations` 컬렉션에서 aggregate:

```javascript
db.spot_content_relations.aggregate([
  { $match: { status: 'active' } },
  { $group: {
      _id: { contentName: '$contentName', contentType: '$contentType' },
      spotCount: { $sum: 1 },
      contentId: { $first: '$contentId' }
  }},
  { $sort: { spotCount: -1 } }
])
```

대표 이미지는 기존 `/api/content-images` API 활용.

### 관련 코스 조회

`routes` 컬렉션에서 `relatedContentNames` 필드로 매칭:

```javascript
db.routes.find({
  relatedContentNames: contentName,
  isPublic: true
})
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 헤더 활성 상태 판별

*For any* URL pathname, "작품 탐색" 링크의 활성 상태는 pathname이 `/contents`로 시작하는 경우에만 true여야 하며, 그 외 모든 경로에서는 false여야 한다.

**Validates: Requirements 1.4**

### Property 2: 작품 카드 링크 URL 인코딩

*For any* 작품명(한글, 영문, 특수문자 포함), 해당 작품의 카드 링크 및 자동완성 "작품 페이지로 이동" 링크는 `/contents/${encodeURIComponent(contentName)}`과 동일해야 한다.

**Validates: Requirements 2.4, 5.2**

### Property 3: 작품 타입 필터 정확성

*For any* 작품 목록과 선택된 타입 필터에 대해, 필터링 결과에는 해당 타입의 작품만 포함되어야 하며, 해당 타입의 모든 작품이 누락 없이 포함되어야 한다.

**Validates: Requirements 2.5**

### Property 4: 작품명 검색 필터 정확성

*For any* 작품 목록과 검색 쿼리에 대해, 필터링 결과에는 작품명에 검색 쿼리가 포함된(대소문자 무시) 작품만 나타나야 하며, 매칭되는 모든 작품이 누락 없이 포함되어야 한다.

**Validates: Requirements 2.6**

### Property 5: 대표 스팟 선정 로직

*For any* 스팟 목록(길이 ≥ 3)에 대해, 대표 스팟 섹션에 표시되는 3개 스팟은 인증 수(checkInCount) 기준 상위 3개와 동일해야 한다. 스팟이 3개 미만이면 전체 스팟이 대표 스팟으로 표시되어야 한다.

**Validates: Requirements 3.2, 3.3**

### Property 6: 뒤로가기 네비게이션 결정 로직

*For any* history.length 값에 대해, history.length > 1이면 router.back()이 호출되어야 하고, history.length ≤ 1이면 `/contents`로 이동해야 한다.

**Validates: Requirements 6.2, 6.3**

## Error Handling

### API 에러

| 상황 | 처리 |
|------|------|
| `/api/contents` 조회 실패 | 에러 메시지 표시 + 재시도 버튼 |
| `/api/contents/[name]/courses` 조회 실패 | 관련 코스 섹션 숨김 (graceful degradation) |
| `/api/checkins` 조회 실패 | 최근 인증 섹션에 "불러오기 실패" 표시 |
| 존재하지 않는 작품명 접근 | 빈 상태 + "작품 목록으로 돌아가기" 링크 |

### 이미지 에러

- 대표 이미지 로드 실패 시 플레이스홀더 아이콘 표시 (기존 패턴 유지)
- `onError` 핸들러로 이미지 에러 상태 관리

### 네트워크 에러

- React Query의 `isError` 상태 활용
- 사용자 친화적 에러 메시지 + 재시도 안내

### 빈 상태

| 상황 | 표시 |
|------|------|
| 작품 목록 비어있음 | "등록된 작품이 없습니다" 안내 |
| 필터/검색 결과 없음 | "조건에 맞는 작품이 없습니다" + 필터 초기화 버튼 |
| 관련 코스 없음 | 섹션 자체를 숨김 |
| 최근 인증 없음 | "아직 인증이 없습니다" 안내 |

## Testing Strategy

### 단위 테스트 (Jest + @testing-library/react)

- Header 컴포넌트: "작품 탐색" 링크 존재 및 위치 확인
- ContentCard: 필수 정보 렌더링 확인
- EntryPointSection: 3개 진입점 렌더링 및 링크 확인
- AutocompleteDropdown: "작품 페이지로 이동" 링크 렌더링 확인
- 뒤로가기 버튼 레이블 확인
- 빈 상태 렌더링 확인

### 속성 기반 테스트 (fast-check)

- **Property 1**: 다양한 pathname에 대한 활성 상태 판별 정확성 (최소 100회)
- **Property 2**: 다양한 작품명(유니코드, 특수문자, 공백 포함)에 대한 URL 인코딩 정확성 (최소 100회)
- **Property 3**: 랜덤 작품 목록 + 랜덤 타입 필터에 대한 필터링 정확성 (최소 100회)
- **Property 4**: 랜덤 작품 목록 + 랜덤 검색 쿼리에 대한 검색 정확성 (최소 100회)
- **Property 5**: 랜덤 스팟 목록에 대한 대표 스팟 선정 정확성 (최소 100회)
- **Property 6**: 랜덤 history.length에 대한 뒤로가기 결정 로직 (최소 100회)

각 속성 테스트는 다음 태그 형식으로 주석 처리:
```
// Feature: 34-content-hub-ia, Property {number}: {property_text}
```

### 통합 테스트

- `/api/contents` API: 정상 응답, 빈 결과, DB 에러 시나리오
- `/api/contents/[name]/courses` API: 정상 응답, 작품 없음, DB 에러
- 기존 `/api/checkins?contentName=X` 동작 유지 확인

### PBT 라이브러리

- **fast-check** (프로젝트에 이미 설치됨)
- 각 테스트 최소 100회 반복 실행
