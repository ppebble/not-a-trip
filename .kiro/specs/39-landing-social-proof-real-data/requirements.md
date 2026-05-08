# Requirements Document

## Introduction

랜딩 페이지의 소셜프루프 섹션(`SocialProofSection`)은 현재 `proofData.ts`의 하드코딩된 카테고리 아이콘 이미지(`/icons/categories/*.webp`)를 사용하고 있으며, `fetchShowcaseSpots.ts`도 DB 스팟이 부족할 때 정적 fallback 비중이 크다. 이 기능은 소셜프루프 섹션을 실제 DB 스팟 데이터 기반으로 전환하여 방문자에게 실제 성지순례 장소의 사진을 보여주는 것을 목표로 한다.

구체적으로는 다음을 수행한다:
1. `GET /api/spots/showcase` API 엔드포인트를 신규 생성하여 카테고리별 대표 스팟(thumbnailUrl 있는 것 우선)을 반환한다.
2. `fetchShowcaseSpots.ts`의 `fetchProofImages` 함수를 실제 API 호출 방식으로 교체하여 정적 fallback 의존도를 낮춘다.
3. `proofData.ts`의 이미지 필드를 실제 스팟 `thumbnailUrl`로 연결한다.
4. API 실패 시 기존 카테고리 아이콘(`/icons/categories/*.webp`)으로 graceful degradation한다.

## Glossary

- **Showcase_API**: `GET /api/spots/showcase` 엔드포인트. 카테고리별 대표 스팟 데이터를 반환한다.
- **SocialProof_Section**: 랜딩 페이지의 소셜프루프 슬라이더 섹션 (`SocialProofSection` 컴포넌트).
- **ProofData**: 소셜프루프 카드 1장에 표시되는 데이터 구조 (`proofData.ts`의 `ProofData` 인터페이스).
- **ProofImages**: 카테고리별 스팟 사진 URL 배열 (`Record<SpotCategory, string[]>`).
- **ThumbnailUrl**: 스팟의 `photos[0]` 필드. 실제 사용자가 업로드한 사진 URL.
- **Placeholder_Photo**: `picsum.photos/seed/` 또는 `/icons/` 경로로 시작하는 임시 이미지 URL.
- **Category_Icon_Fallback**: `/icons/categories/{category}.webp` 경로의 카테고리 아이콘. API 실패 시 사용.
- **Spot_Document**: MongoDB `spots` 컬렉션의 문서. `id`, `name`, `photos`, `category` 등을 포함한다.
- **SpotCategory**: `animation | sports | movie_drama | music | game | other` 중 하나의 카테고리 값.
- **REAL_SPOT_PHOTO_FALLBACKS**: `realSpotPhotoFallbacks.ts`에 정의된 스팟 ID별 Wikimedia 이미지 URL 매핑.

## Requirements

### Requirement 1: Showcase API 엔드포인트 생성

**User Story:** As a 랜딩 페이지 서버 컴포넌트, I want to call a dedicated API endpoint to get representative spot data per category, so that I can display real spot thumbnails in the social proof section.

#### Acceptance Criteria

1. THE Showcase_API SHALL respond to `GET /api/spots/showcase` requests.
2. WHEN the Showcase_API receives a request, THE Showcase_API SHALL return a JSON array of spot objects, each containing `id`, `name`, `category`, and `thumbnailUrl` fields.
3. WHEN querying spots, THE Showcase_API SHALL prioritize spots where `photos[0]` exists and is not a Placeholder_Photo.
4. THE Showcase_API SHALL return at most 4 spots per SpotCategory, covering all 6 categories.
5. IF no spots with valid ThumbnailUrl exist for a category, THEN THE Showcase_API SHALL omit that category from the response (empty array for that category is acceptable).
6. IF the database query fails, THEN THE Showcase_API SHALL return HTTP 500 with a JSON error body `{ "error": "Failed to fetch showcase spots" }`.
7. THE Showcase_API SHALL complete the database query within 3000ms under normal load.

---

### Requirement 2: fetchProofImages 함수 실제 API 호출로 교체

**User Story:** As a 랜딩 페이지 서버 컴포넌트, I want fetchProofImages to call the Showcase API instead of querying the database directly, so that the data fetching logic is decoupled from the DB layer and testable via HTTP.

#### Acceptance Criteria

1. WHEN `fetchProofImages` is called in a server context, THE fetchProofImages SHALL call `GET /api/spots/showcase` to retrieve spot data.
2. WHEN the Showcase_API returns valid data, THE fetchProofImages SHALL transform the response into `Record<SpotCategory, string[]>` format where each value is an array of ThumbnailUrl strings.
3. WHEN the Showcase_API returns an empty array for a category, THE fetchProofImages SHALL use an empty array `[]` for that category in the result.
4. IF the Showcase_API call fails (network error or non-2xx response), THEN THE fetchProofImages SHALL return the Category_Icon_Fallback record `{ animation: '/icons/categories/animation.webp', ... }`.
5. THE fetchProofImages SHALL filter out Placeholder_Photo URLs from the API response before returning.
6. WHERE the application is running in a server-side context (Next.js Server Component), THE fetchProofImages SHALL use an absolute URL constructed from `process.env.NEXTAUTH_URL` or `http://localhost:3000` as the base.

---

### Requirement 3: proofData.ts 이미지 필드 실제 thumbnailUrl 연결

**User Story:** As a 소셜프루프 섹션 방문자, I want to see real spot photos instead of category icons in the social proof cards, so that I can get a genuine sense of the places other fans have visited.

#### Acceptance Criteria

1. WHEN `SocialProof_Section` renders, THE SocialProof_Section SHALL display ThumbnailUrl images from ProofImages in ProofData cards where available.
2. WHEN ProofImages contains at least one URL for a card's SpotCategory, THE SocialProof_Section SHALL replace the card's `image` field with the corresponding ThumbnailUrl.
3. WHEN ProofImages is empty for a card's SpotCategory, THE SocialProof_Section SHALL retain the existing `image` value from ProofData (Category_Icon_Fallback).
4. THE SocialProof_Section SHALL distribute ProofImages across cards of the same category in round-robin order (카테고리 내 카드 순서대로 순환 배분).
5. WHEN a ThumbnailUrl fails to load in the browser, THE ProofCard SHALL display the `ImageFallback` component (📍 이모지).

---

### Requirement 4: API 실패 시 Graceful Degradation

**User Story:** As a 랜딩 페이지 방문자, I want the social proof section to always display something meaningful even when the API is unavailable, so that my experience is not broken by backend failures.

#### Acceptance Criteria

1. IF the Showcase_API is unavailable, THEN THE fetchProofImages SHALL return Category_Icon_Fallback URLs for all categories without throwing an error.
2. IF Category_Icon_Fallback URLs are used, THEN THE SocialProof_Section SHALL render normally with category icon images instead of real spot photos.
3. WHILE the Showcase_API response is being awaited, THE WelcomePage SHALL not block rendering of other sections (Promise.all 병렬 처리 유지).
4. IF a spot's ThumbnailUrl is a Placeholder_Photo, THEN THE fetchProofImages SHALL exclude that URL from the ProofImages result.
5. THE fetchProofImages SHALL log a warning to the server console when falling back to Category_Icon_Fallback, including the error reason.

---

### Requirement 5: 카테고리별 스팟 이미지 우선순위 및 품질

**User Story:** As a 랜딩 페이지 방문자, I want to see the most visually representative spot photos, so that the social proof section looks authentic and appealing.

#### Acceptance Criteria

1. WHEN multiple spots exist for a category, THE Showcase_API SHALL sort results to prioritize spots with non-Placeholder ThumbnailUrl first.
2. THE Showcase_API SHALL return at most 4 spots per category to limit response payload size.
3. WHEN a spot has a ThumbnailUrl that is a Placeholder_Photo, THE Showcase_API SHALL still include the spot but mark it as lower priority (정렬 후순위).
4. THE Showcase_API SHALL include `REAL_SPOT_PHOTO_FALLBACKS` resolution logic: IF a spot's `photos[0]` is a Placeholder_Photo AND the spot ID exists in `REAL_SPOT_PHOTO_FALLBACKS`, THEN THE Showcase_API SHALL use the Wikimedia URL from `REAL_SPOT_PHOTO_FALLBACKS` as the `thumbnailUrl`.
5. THE Showcase_API SHALL return only spots where `thumbnailUrl` is non-null and non-empty after fallback resolution.
