# Requirements Document

## Introduction

현재 랜딩 페이지와 일부 스팟 쇼케이스 데이터는 실제 장소 사진이 부족할 때 Wikimedia 원격 이미지를 런타임 fallback으로 사용한다. 이 방식은 이미지 원본의 삭제/이동, 외부 rate limit, Next Image Optimizer 요청 증폭 때문에 429/404/500 콘솔 오류를 만들 수 있다.

이 사양은 당장 구현하지 않는 후속 작업으로, 실제 스팟 데이터와 이미지 에셋을 수집·검증·저장·운영하는 기준을 정의한다. 목표는 랜딩, 지도, 상세, 갤러리, 코스 화면이 외부 임시 이미지에 기대지 않고 안정적인 자체 승인 데이터와 자체 호스팅 이미지로 동작하게 만드는 것이다.

구체적으로는 다음을 수행한다:
1. 실제 장소/스팟 데이터 수집 범위와 필수 필드를 표준화한다.
2. 이미지 원본의 라이선스, 출처, 사용 가능 여부를 검증한다.
3. 외부 hotlink 대신 자체 저장소(R2 또는 동등한 공개 CDN)에 최적화된 파생 이미지를 저장한다.
4. 수집 데이터가 운영 DB에 들어가기 전 자동·수동 품질 검수를 통과하게 한다.
5. 기존 Wikimedia fallback 의존도를 제거하고 실패 시 로컬/자체 에셋으로 graceful degradation한다.

## Glossary

- **Real_Spot_Data**: 실제 장소를 설명하는 운영 데이터. `id`, `name`, `category`, `coordinates`, `address`, `relatedContent`, `sourceUrls`, `photos` 등을 포함한다.
- **Source_Evidence**: 장소/작품/사진의 사실성을 확인할 수 있는 출처 URL, 문서, 위키 페이지, 공식 페이지, 사용자 제보 또는 관리자 검수 기록.
- **Licensed_Image**: 사용 조건이 확인된 이미지. 라이선스, 저작자, 출처 페이지, 원본 URL, 수집일을 기록해야 한다.
- **Owned_Image_Asset**: 앱이 직접 제공하는 공개 저장소(R2 또는 동등한 CDN)에 저장된 이미지 URL.
- **External_Hotlink**: `upload.wikimedia.org`, `commons.wikimedia.org`, `picsum.photos`, 임시 placeholder 등 앱이 통제하지 않는 외부 이미지 직접 참조.
- **Image_Derivative**: 원본 이미지에서 생성한 webp/avif 썸네일, 카드용, 상세용 크기 변형 파일.
- **Asset_Manifest**: 이미지별 원본, 파생 파일, 해시, 크기, 라이선스, 검수 상태를 기록하는 데이터 파일 또는 DB 컬렉션.
- **Data_Review_Status**: `draft | needs_review | approved | rejected | archived` 중 하나의 수집/검수 상태.
- **Fallback_Image**: 실제 이미지가 없거나 실패할 때 사용하는 로컬 또는 Owned_Image_Asset 기본 이미지.

## Requirements

### Requirement 1: 실제 스팟 데이터 수집 스키마 정의

**User Story:** As a 데이터 관리자, I want every collected spot to follow one canonical schema, so that landing and app screens can use the data without ad hoc fallback logic.

#### Acceptance Criteria

1. THE Real_Spot_Data SHALL include `id`, `name`, `category`, `coordinates`, `country`, `region`, `address`, `description`, `relatedContent`, `sourceUrls`, `photos`, and `reviewStatus` fields.
2. THE `id` SHALL be stable and SHALL NOT change after approval unless a migration record is created.
3. THE `coordinates` SHALL include latitude and longitude with at least 5 decimal places when available.
4. THE `category` SHALL be one of the existing `SpotCategory` values.
5. THE `sourceUrls` SHALL include at least one Source_Evidence item before `reviewStatus` can become `approved`.
6. IF a spot is based on uncertain fan inference, THEN THE spot SHALL remain `needs_review` and SHALL NOT appear in production showcase surfaces.
7. THE schema SHALL support multiple `relatedContent` entries without treating the first entry as the only truth.

---

### Requirement 2: 이미지 라이선스 및 출처 검증

**User Story:** As a 서비스 운영자, I want every image to carry license and attribution metadata, so that the app can use real photos without legal or attribution ambiguity.

#### Acceptance Criteria

1. THE Licensed_Image SHALL record `originalUrl`, `sourcePageUrl`, `author`, `license`, `licenseUrl`, `collectedAt`, and `reviewStatus`.
2. WHEN an image is collected from Wikimedia Commons, THE pipeline SHALL store the file page URL, not only the raw image URL.
3. WHEN an image license requires attribution, THE Asset_Manifest SHALL preserve attribution text required for future UI or documentation use.
4. IF the license is unknown, non-commercial-only, or incompatible with service use, THEN THE image SHALL be rejected.
5. IF the image source returns 404, 410, 429, or 5xx during validation, THEN THE image SHALL NOT be promoted to `approved`.
6. THE validation process SHALL record the HTTP status and validation timestamp for each checked source.
7. THE app SHALL NOT rely on an approved image unless its license metadata exists.

---

### Requirement 3: 자체 이미지 저장소 및 파생 이미지 생성

**User Story:** As a 랜딩 페이지 방문자, I want images to load from a stable app-controlled CDN, so that external rate limits do not break the page.

#### Acceptance Criteria

1. WHEN an image is approved, THE pipeline SHALL copy it into Owned_Image_Asset storage before production use.
2. THE app SHALL render Owned_Image_Asset URLs for showcase, category, detail, and proof surfaces.
3. THE pipeline SHALL generate at least thumbnail, card, and detail Image_Derivative variants.
4. THE Image_Derivative filenames SHALL include a content hash or version suffix for cache invalidation.
5. THE app SHALL NOT render External_Hotlink URLs in production landing showcase or social proof sections.
6. IF Owned_Image_Asset generation fails, THEN THE image SHALL remain `needs_review` or `rejected` and SHALL NOT be shown in production.
7. THE Next image remotePatterns SHALL only include the approved storage host for collected assets.

---

### Requirement 4: 데이터 품질 검수 및 승격 흐름

**User Story:** As a reviewer, I want a clear review workflow for collected spots and images, so that low-quality or broken data cannot leak into user-facing pages.

#### Acceptance Criteria

1. THE collection workflow SHALL create new spots/images with `reviewStatus = draft` or `needs_review`.
2. A reviewer SHALL be able to approve or reject each spot and each image independently.
3. THE approval check SHALL verify required fields, source evidence, image availability, and license metadata.
4. IF a spot has no approved image, THEN showcase surfaces SHALL use a controlled Fallback_Image instead of External_Hotlink.
5. IF an approved image later fails validation, THEN THE image SHALL be marked `needs_review` or `archived` and removed from production rotation.
6. THE workflow SHALL keep an audit record of reviewer, decision, timestamp, and reason.
7. THE production query SHALL return only `approved` spots and `approved` images for public showcase surfaces.

---

### Requirement 5: 기존 Wikimedia fallback 제거 및 마이그레이션

**User Story:** As a 개발자, I want to remove runtime Wikimedia fallback URLs, so that console noise and external rate-limit failures stop recurring.

#### Acceptance Criteria

1. THE codebase SHALL NOT contain production runtime fallback image URLs pointing to `upload.wikimedia.org` or `commons.wikimedia.org` after migration.
2. WHEN existing `REAL_SPOT_PHOTO_FALLBACKS` data is migrated, THE migration SHALL either replace entries with Owned_Image_Asset URLs or remove the entry.
3. THE migration SHALL include a static test that fails if landing showcase fallback data contains External_Hotlink URLs.
4. THE migration SHALL preserve source attribution metadata outside the runtime image URL field.
5. IF a migrated image cannot be validated or copied, THEN THE affected spot SHALL fall back to a local category/spot placeholder.
6. THE landing page SHALL render without triggering `_next/image` requests to Wikimedia domains.
7. THE app SHALL continue to show meaningful category or spot placeholders when no approved image exists.

---

### Requirement 6: Monitoring and regression checks

**User Story:** As an operator, I want recurring checks for broken image URLs and API failures, so that data drift is caught before users see console floods.

#### Acceptance Criteria

1. THE repository SHALL provide a validation command or script that checks approved image URLs for 200 responses and image content type.
2. THE validation SHALL flag 404, 410, 429, and 5xx responses separately.
3. THE validation SHALL report counts by source host, status code, and affected spot ID.
4. THE CI or scheduled workflow SHOULD run the validation against approved production image metadata.
5. THE app SHALL log image data validation failures in an operator-readable format without spamming client consoles.
6. THE validation SHALL be safe to run repeatedly without mutating production data unless explicitly invoked in repair mode.
7. THE monitoring output SHALL include actionable next steps: replace, archive, retry later, or investigate storage credentials.
