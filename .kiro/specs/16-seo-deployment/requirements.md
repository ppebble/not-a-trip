# Requirements Document

## Introduction

Not a Trip 플랫폼의 SEO 최적화 및 운영/배포 환경 구축을 정의한다. 현재 시스템은 루트 레이아웃에 정적 메타데이터만 설정되어 있으며, 동적 메타데이터(generateMetadata), Open Graph 이미지, sitemap, robots.txt, 구조화된 데이터(JSON-LD)가 모두 미구현 상태이다. 검색 엔진 노출을 극대화하고, Vercel 배포 및 커스텀 도메인 연결을 통해 실제 서비스 런칭을 준비하는 것이 목표이다.

## Glossary

- **SEO_System**: Not a Trip 플랫폼의 검색 엔진 최적화를 담당하는 메타데이터, sitemap, robots.txt, JSON-LD 등의 통합 시스템.
- **Metadata_Generator**: Next.js 15의 `generateMetadata` 함수를 활용하여 각 페이지별 동적 메타데이터를 생성하는 모듈.
- **OG_Image_Generator**: Next.js의 `ImageResponse` API를 활용하여 Open Graph 이미지를 동적으로 생성하는 모듈.
- **Sitemap_Generator**: Next.js의 `sitemap.ts` 규약을 활용하여 검색 엔진 크롤러용 XML 사이트맵을 생성하는 모듈.
- **JSON_LD_Renderer**: 구조화된 데이터(Schema.org JSON-LD)를 페이지에 삽입하는 모듈.
- **Spot_Page**: 스팟 상세 페이지 (`/spots/[id]`).
- **Route_Page**: 코스 상세 페이지 (`/routes/[id]`).
- **Community_Page**: 커뮤니티 게시글 상세 페이지 (`/community/[id]`).
- **Gallery_Page**: 갤러리 페이지 (`/gallery`).
- **Profile_Page**: 사용자 프로필 페이지 (`/profile/[id]`).
- **Deployment_System**: Vercel 호스팅 플랫폼 기반의 배포 및 도메인 관리 시스템.
- **Analytics_System**: Google Analytics 4 (GA4) 기반의 사용자 행동 분석 시스템.
- **Base_URL**: 프로덕션 환경의 기본 도메인 URL (예: `https://not-a-trip.com`).

## Requirements

### Requirement 1: 스팟 상세 페이지 동적 메타데이터 생성

**User Story:** As a 검색 엔진 사용자, I want 스팟 상세 페이지가 검색 결과에 스팟 이름, 설명, 대표 이미지와 함께 표시되길 원한다, so that 검색만으로 관심 있는 스팟을 발견할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 Spot_Page에 접근하면, THE Metadata_Generator SHALL 해당 스팟의 이름을 `<title>` 태그에 "{스팟명} | Not a Trip" 형식으로 설정한다.
2. WHEN 사용자가 Spot_Page에 접근하면, THE Metadata_Generator SHALL 해당 스팟의 description 필드를 `<meta name="description">` 태그에 설정한다.
3. WHEN 사용자가 Spot_Page에 접근하면, THE Metadata_Generator SHALL Open Graph 메타 태그(og:title, og:description, og:image, og:url, og:type)를 설정한다.
4. WHEN 사용자가 Spot_Page에 접근하면, THE Metadata_Generator SHALL Twitter Card 메타 태그(twitter:card, twitter:title, twitter:description, twitter:image)를 설정한다.
5. IF 스팟 데이터 조회에 실패하면, THEN THE Metadata_Generator SHALL 기본 메타데이터(사이트 제목, 기본 설명)를 반환한다.
6. IF 스팟의 description 필드가 비어 있으면, THEN THE Metadata_Generator SHALL 카테고리와 주소 정보를 조합하여 대체 설명을 생성한다.

### Requirement 2: 코스 및 커뮤니티 페이지 동적 메타데이터 생성

**User Story:** As a 검색 엔진 사용자, I want 코스 상세 페이지와 커뮤니티 게시글이 검색 결과에 적절한 제목과 설명으로 표시되길 원한다, so that 다양한 콘텐츠를 검색으로 발견할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 Route_Page에 접근하면, THE Metadata_Generator SHALL 해당 코스의 이름을 "{코스명} | Not a Trip" 형식으로 title에 설정한다.
2. WHEN 사용자가 Route_Page에 접근하면, THE Metadata_Generator SHALL 해당 코스의 설명과 포함된 스팟 수를 description에 설정한다.
3. WHEN 사용자가 Community_Page에 접근하면, THE Metadata_Generator SHALL 해당 게시글의 제목을 "{게시글 제목} | Not a Trip 커뮤니티" 형식으로 title에 설정한다.
4. WHEN 사용자가 Community_Page에 접근하면, THE Metadata_Generator SHALL 해당 게시글의 본문 앞 150자를 description에 설정한다.
5. IF 코스 또는 게시글 데이터 조회에 실패하면, THEN THE Metadata_Generator SHALL 기본 메타데이터를 반환한다.

### Requirement 3: 정적 페이지 메타데이터 설정

**User Story:** As a 검색 엔진 사용자, I want 메인 페이지, 갤러리, 커뮤니티 목록 등 정적 페이지도 적절한 메타데이터를 가지길 원한다, so that 사이트의 주요 페이지가 검색 결과에 노출된다.

#### Acceptance Criteria

1. THE Metadata_Generator SHALL 메인 페이지(`/`)에 "Not a Trip - 팬들만 아는 특별한 여행지" 형식의 title과 서비스 소개 description을 설정한다.
2. THE Metadata_Generator SHALL Gallery_Page에 "갤러리 | Not a Trip" 형식의 title과 갤러리 소개 description을 설정한다.
3. THE Metadata_Generator SHALL 커뮤니티 목록 페이지(`/community`)에 "커뮤니티 | Not a Trip" 형식의 title과 커뮤니티 소개 description을 설정한다.
4. THE Metadata_Generator SHALL 코스 목록 페이지(`/routes`)에 "코스 | Not a Trip" 형식의 title과 코스 소개 description을 설정한다.
5. THE Metadata_Generator SHALL 모든 정적 페이지에 Open Graph 메타 태그(og:title, og:description, og:image, og:url)를 설정한다.

### Requirement 4: Open Graph 이미지 동적 생성

**User Story:** As a 사용자, I want SNS에 스팟 링크를 공유할 때 스팟 이름, 카테고리, 대표 이미지가 포함된 미리보기 카드가 표시되길 원한다, so that 공유받는 사람이 링크의 내용을 바로 파악할 수 있다.

#### Acceptance Criteria

1. WHEN Spot_Page의 OG 이미지가 요청되면, THE OG_Image_Generator SHALL 스팟 이름, 카테고리 아이콘, 주소 정보를 포함한 1200x630 픽셀 이미지를 생성한다.
2. WHEN Route_Page의 OG 이미지가 요청되면, THE OG_Image_Generator SHALL 코스 이름과 포함된 스팟 수를 포함한 1200x630 픽셀 이미지를 생성한다.
3. THE OG_Image_Generator SHALL Not a Trip 브랜드 로고와 일관된 색상 테마를 OG 이미지에 적용한다.
4. IF 이미지 생성에 필요한 데이터 조회에 실패하면, THEN THE OG_Image_Generator SHALL 기본 브랜드 OG 이미지를 반환한다.

### Requirement 5: XML 사이트맵 생성

**User Story:** As a 검색 엔진 크롤러, I want 사이트의 모든 공개 페이지 URL을 포함한 사이트맵에 접근하고 싶다, so that 사이트의 콘텐츠를 효율적으로 색인할 수 있다.

#### Acceptance Criteria

1. WHEN 검색 엔진 크롤러가 `/sitemap.xml`에 접근하면, THE Sitemap_Generator SHALL 유효한 XML 사이트맵을 반환한다.
2. THE Sitemap_Generator SHALL 정적 페이지(메인, 갤러리, 커뮤니티 목록, 코스 목록) URL을 사이트맵에 포함한다.
3. THE Sitemap_Generator SHALL 모든 공개 스팟 상세 페이지(`/spots/[id]`) URL을 사이트맵에 포함한다.
4. THE Sitemap_Generator SHALL 모든 공개 코스 상세 페이지(`/routes/[id]`) URL을 사이트맵에 포함한다.
5. THE Sitemap_Generator SHALL 모든 공개 커뮤니티 게시글 상세 페이지(`/community/[id]`) URL을 사이트맵에 포함한다.
6. THE Sitemap_Generator SHALL 각 URL에 `lastmod`(마지막 수정일), `changefreq`(변경 빈도), `priority`(우선순위) 속성을 포함한다.
7. THE Sitemap_Generator SHALL 관리자 페이지(`/admin/*`), 인증 페이지(`/auth/*`), 테스트 페이지(`/test/*`) URL을 사이트맵에서 제외한다.

### Requirement 6: robots.txt 구성

**User Story:** As a 검색 엔진 크롤러, I want robots.txt를 통해 크롤링 허용/차단 범위를 확인하고 싶다, so that 사이트 운영자의 의도에 맞게 크롤링할 수 있다.

#### Acceptance Criteria

1. WHEN 검색 엔진 크롤러가 `/robots.txt`에 접근하면, THE SEO_System SHALL 유효한 robots.txt 파일을 반환한다.
2. THE SEO_System SHALL robots.txt에서 `/api/*`, `/admin/*`, `/auth/*`, `/test/*` 경로의 크롤링을 차단한다.
3. THE SEO_System SHALL robots.txt에서 공개 페이지(메인, 스팟, 코스, 커뮤니티, 갤러리) 경로의 크롤링을 허용한다.
4. THE SEO_System SHALL robots.txt에 사이트맵 URL(`{Base_URL}/sitemap.xml`)을 명시한다.

### Requirement 7: 스팟 페이지 구조화된 데이터(JSON-LD) 삽입

**User Story:** As a 검색 엔진 사용자, I want 스팟 정보가 Google 검색 결과에서 리치 스니펫(장소명, 주소, 카테고리)으로 표시되길 원한다, so that 검색 결과에서 스팟 정보를 바로 확인할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 Spot_Page에 접근하면, THE JSON_LD_Renderer SHALL Schema.org `TouristAttraction` 타입의 JSON-LD를 `<script type="application/ld+json">` 태그로 삽입한다.
2. THE JSON_LD_Renderer SHALL JSON-LD에 스팟의 name, description, address, geo(latitude, longitude) 속성을 포함한다.
3. THE JSON_LD_Renderer SHALL JSON-LD에 스팟의 대표 이미지 URL을 image 속성으로 포함한다.
4. THE JSON_LD_Renderer SHALL JSON-LD에 스팟의 카테고리를 additionalType 속성으로 포함한다.
5. IF 스팟의 특정 필드(description, photos)가 비어 있으면, THEN THE JSON_LD_Renderer SHALL 해당 속성을 JSON-LD에서 생략한다.

### Requirement 8: 코스 페이지 구조화된 데이터(JSON-LD) 삽입

**User Story:** As a 검색 엔진 사용자, I want 코스 정보가 검색 결과에서 여행 코스로 인식되길 원한다, so that 코스 검색 시 적절한 결과를 얻을 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 Route_Page에 접근하면, THE JSON_LD_Renderer SHALL Schema.org `TouristTrip` 타입의 JSON-LD를 삽입한다.
2. THE JSON_LD_Renderer SHALL JSON-LD에 코스의 name, description 속성을 포함한다.
3. THE JSON_LD_Renderer SHALL JSON-LD에 코스에 포함된 스팟 목록을 itinerary 속성으로 포함한다.
4. IF 코스의 description 필드가 비어 있으면, THEN THE JSON_LD_Renderer SHALL 포함된 스팟 이름을 조합하여 대체 설명을 생성한다.

### Requirement 9: 웹사이트 및 조직 구조화된 데이터 삽입

**User Story:** As a 검색 엔진, I want 사이트 전체에 대한 구조화된 데이터를 확인하고 싶다, so that 사이트의 정체성과 검색 기능을 정확히 파악할 수 있다.

#### Acceptance Criteria

1. THE JSON_LD_Renderer SHALL 루트 레이아웃에 Schema.org `WebSite` 타입의 JSON-LD를 삽입한다.
2. THE JSON_LD_Renderer SHALL WebSite JSON-LD에 name("Not a Trip"), url(Base_URL) 속성을 포함한다.
3. THE JSON_LD_Renderer SHALL WebSite JSON-LD에 `potentialAction`으로 SearchAction을 포함하여 사이트 내 검색 기능을 명시한다.

### Requirement 10: Vercel 배포 및 환경 설정

**User Story:** As a 개발자, I want 프로젝트를 Vercel에 배포하고 환경 변수를 안전하게 관리하고 싶다, so that 안정적인 프로덕션 환경을 운영할 수 있다.

#### Acceptance Criteria

1. THE Deployment_System SHALL GitHub 리포지토리와 Vercel 프로젝트를 연결하여 `main` 브랜치 푸시 시 자동 배포를 수행한다.
2. THE Deployment_System SHALL `develop` 브랜치 푸시 시 프리뷰 배포를 생성한다.
3. THE Deployment_System SHALL 프로덕션 환경 변수(MONGODB_URI, NEXTAUTH_SECRET, OAuth 클라이언트 키 등)를 Vercel 환경 변수로 관리한다.
4. THE Deployment_System SHALL 프로덕션, 프리뷰, 개발 환경별로 환경 변수를 분리하여 관리한다.
5. IF 빌드 과정에서 오류가 발생하면, THEN THE Deployment_System SHALL 빌드 로그를 통해 오류 원인을 확인할 수 있도록 한다.

### Requirement 11: 커스텀 도메인 연결

**User Story:** As a 서비스 운영자, I want 커스텀 도메인(not-a-trip.com)으로 서비스에 접근할 수 있게 하고 싶다, so that 전문적인 브랜드 이미지를 제공할 수 있다.

#### Acceptance Criteria

1. THE Deployment_System SHALL 커스텀 도메인을 Vercel 프로젝트에 연결한다.
2. THE Deployment_System SHALL 커스텀 도메인에 SSL 인증서를 자동으로 프로비저닝하여 HTTPS 접속을 보장한다.
3. WHEN 사용자가 `www.not-a-trip.com`으로 접근하면, THE Deployment_System SHALL `not-a-trip.com`으로 리다이렉트한다.
4. THE Deployment_System SHALL NEXTAUTH_URL 환경 변수를 커스텀 도메인으로 설정한다.
5. THE Deployment_System SHALL Base_URL을 커스텀 도메인으로 설정하여 sitemap, OG 이미지 등에서 올바른 URL을 사용한다.

### Requirement 12: Google Analytics 4 연동 (선택)

**User Story:** As a 서비스 운영자, I want 사용자 행동 데이터를 수집하고 분석하고 싶다, so that 서비스 개선에 데이터 기반 의사결정을 할 수 있다.

#### Acceptance Criteria

1. WHERE GA4 연동이 활성화된 경우, THE Analytics_System SHALL Google Analytics 4 추적 스크립트를 모든 페이지에 삽입한다.
2. WHERE GA4 연동이 활성화된 경우, THE Analytics_System SHALL GA4 측정 ID를 환경 변수(`NEXT_PUBLIC_GA_MEASUREMENT_ID`)로 관리한다.
3. WHERE GA4 연동이 활성화된 경우, THE Analytics_System SHALL 페이지 뷰 이벤트를 자동으로 추적한다.
4. WHERE GA4 연동이 활성화된 경우, THE Analytics_System SHALL 프로덕션 환경에서만 추적 스크립트를 활성화한다.
5. IF GA4 측정 ID 환경 변수가 설정되지 않으면, THEN THE Analytics_System SHALL 추적 스크립트를 삽입하지 않고 정상적으로 페이지를 렌더링한다.
