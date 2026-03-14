# Implementation Plan: SEO 최적화 및 배포 환경 구축

## Overview

메타데이터/JSON-LD 유틸리티 기반을 먼저 구축한 뒤, 스팟 페이지에서 Server/Client Component 분리 패턴을 검증하고, 코스/커뮤니티로 확장한다. 정적 페이지 메타데이터는 layout.tsx 기반으로 별도 처리하며, OG 이미지·사이트맵·robots 구현 후 배포 설정으로 마무리한다.

## Tasks

- [x] 1. SEO 유틸리티 기반 구축
  - [x] 1.1 SEO 환경 변수 설정 및 메타데이터 유틸리티 함수 구현
    - `.env.example`에 `NEXT_PUBLIC_BASE_URL` 환경 변수 추가 (getBaseUrl() 의존성 선행 해결)
    - `.env.local`에 `NEXT_PUBLIC_BASE_URL=http://localhost:3000` 설정 (개발 환경)
    - `src/lib/seo/metadata.ts` 생성
    - `SpotSeoData`, `RouteSeoData`, `PostSeoData` 인터페이스 정의
    - `getBaseUrl()` 함수 구현 — `NEXT_PUBLIC_BASE_URL` 환경 변수 참조, 미설정 시 `http://localhost:3000` 폴백
    - `getDefaultMetadata()` 함수 구현
    - `generateSpotMetadata()`, `generateRouteMetadata()`, `generatePostMetadata()` 함수 구현
    - 스팟 description 비어있을 때 카테고리+주소 조합 폴백 로직 포함
    - 코스 description 비어있을 때 스팟 이름 조합 폴백 로직 포함
    - 게시글 content 150자 truncation 로직 포함
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 11.5_

  - [x] 1.2 JSON-LD 생성 함수 및 JsonLd 컴포넌트 구현
    - `src/lib/seo/json-ld.ts` 생성
    - `generateSpotJsonLd()` — TouristAttraction 타입, name/description/address/geo/image/additionalType 포함, 빈 필드 생략 로직
    - `generateRouteJsonLd()` — TouristTrip 타입, name/description/itinerary 포함, 빈 description 폴백
    - `generateWebSiteJsonLd()` — WebSite 타입, name/url/potentialAction(SearchAction) 포함
    - `src/components/seo/JsonLd.tsx` — `dangerouslySetInnerHTML` 기반 `<script type="application/ld+json">` 렌더링 컴포넌트
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3_

  - [ ]* 1.3 메타데이터 유틸리티 속성 테스트 (P1, P2, P3)
    - **Property 1: 스팟 메타데이터 완전성** — 랜덤 SpotSeoData에 대해 title 형식, description 일치, openGraph/twitter 필드 존재 검증
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
    - **Property 2: 코스 메타데이터 완전성** — 랜덤 RouteSeoData에 대해 title 형식, description에 스팟 수 포함 검증
    - **Validates: Requirements 2.1, 2.2**
    - **Property 3: 게시글 메타데이터 완전성** — 랜덤 PostSeoData에 대해 title 형식, description 150자 이하 검증
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 1.4 JSON-LD 생성 함수 속성 테스트 (P8, P9)
    - **Property 8: 스팟 JSON-LD 완전성** — 랜덤 SpotSeoData에 대해 @type, name, description, address, geo, image, additionalType 검증
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
    - **Property 9: 코스 JSON-LD 완전성** — 랜덤 RouteSeoData에 대해 @type, name, description, itinerary 길이 검증
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 2. Checkpoint - 기반 유틸리티 검증
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. 스팟 상세 페이지 Server/Client Component 분리 및 SEO 적용
  - [x] 3.1 스팟 상세 페이지 리팩토링 — Server Component 래퍼 + Client Component 분리
    - 기존 `src/app/spots/[id]/page.tsx`의 UI 로직을 `src/components/spot/SpotDetailClient.tsx`로 추출 (`'use client'` 유지)
    - `src/app/spots/[id]/page.tsx`를 Server Component로 변환
    - `generateMetadata` 함수 구현 — MongoDB에서 경량 projection으로 스팟 SEO 데이터 조회, `generateSpotMetadata()` 호출
    - 조회 실패 시 `getDefaultMetadata()` 반환
    - Server Component에서 `JsonLd` 컴포넌트로 스팟 JSON-LD 렌더링
    - Server Component에서 `<SpotDetailClient />` import 및 렌더링
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4. Checkpoint - 스팟 페이지 SEO 검증
  - Ensure all tests pass, ask the user if questions arise.
  - 스팟 상세 페이지에서 메타데이터와 JSON-LD가 정상 렌더링되는지 확인

- [x] 5. 코스/커뮤니티 페이지 Server/Client Component 분리 및 SEO 적용
  - [x] 5.1 코스 상세 페이지 리팩토링 — Server Component 래퍼 + Client Component 분리
    - 기존 `src/app/routes/[id]/page.tsx`의 UI 로직을 `src/components/route/RouteDetailClient.tsx`로 추출 (`'use client'` 유지)
    - `src/app/routes/[id]/page.tsx`를 Server Component로 변환
    - `generateMetadata` 함수 구현 — MongoDB에서 경량 projection으로 코스 SEO 데이터 조회, `generateRouteMetadata()` 호출
    - Server Component에서 `JsonLd` 컴포넌트로 코스 JSON-LD 렌더링
    - _Requirements: 2.1, 2.2, 2.5, 8.1, 8.2, 8.3, 8.4_

  - [x] 5.2 커뮤니티 게시글 상세 페이지 리팩토링 — Server Component 래퍼 + Client Component 분리
    - 기존 `src/app/community/[id]/page.tsx`의 UI 로직을 `src/components/community/PostDetailClient.tsx`로 추출 (`'use client'` 유지)
    - `src/app/community/[id]/page.tsx`를 Server Component로 변환
    - `generateMetadata` 함수 구현 — MongoDB에서 경량 projection으로 게시글 SEO 데이터 조회, `generatePostMetadata()` 호출
    - `ObjectId.isValid()` 검증 후 잘못된 ID 시 기본 메타데이터 반환
    - _Requirements: 2.3, 2.4, 2.5_

- [x] 6. 정적 페이지 메타데이터 및 WebSite JSON-LD 적용
  - [x] 6.1 정적 페이지 메타데이터 설정 — 공통 템플릿 + 페이지별 분리
    - 루트 `src/app/layout.tsx`의 metadata를 공통 템플릿으로 변경: `title: { template: '%s | Not a Trip', default: 'Not a Trip - 팬들만 아는 특별한 여행지' }`, 공통 description, 공통 openGraph 설정
    - 메인 페이지(`/`): `src/app/(home)/layout.tsx` Route Group 생성 또는 `src/app/page.tsx`와 짝을 이루는 별도 metadata export 방식으로 메인 전용 메타데이터 설정 (루트 layout에 메인 페이지 메타데이터를 하드코딩하면 하위 페이지가 상속받아 원치 않는 메타데이터가 노출될 수 있으므로 분리)
    - 갤러리(`/gallery`): `src/app/gallery/layout.tsx` 생성, metadata export
    - 커뮤니티 목록(`/community`): `src/app/community/layout.tsx` 생성, metadata export
    - 코스 목록(`/routes`): `src/app/routes/layout.tsx` 생성, metadata export
    - 각 정적 페이지에 Open Graph 메타 태그 포함
    - 참고: `page.tsx`가 `'use client'`여도 같은 디렉토리의 `layout.tsx`에서 metadata를 export할 수 있음
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 6.2 루트 레이아웃에 WebSite JSON-LD 삽입
    - `src/app/layout.tsx`에 `JsonLd` 컴포넌트로 `generateWebSiteJsonLd()` 결과 렌더링
    - SearchAction의 target URL 패턴 설정
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 7. Checkpoint - 전체 메타데이터 검증
  - Ensure all tests pass, ask the user if questions arise.
  - 모든 동적/정적 페이지의 메타데이터, JSON-LD가 정상 동작하는지 확인

- [ ] 8. OG 이미지 동적 생성 구현
  - [ ] 8.1 OG 이미지 API 라우트 구현
    - `src/app/api/og/route.tsx` 생성
    - `export const runtime = 'nodejs'` 설정
    - `next/og`의 `ImageResponse` API 사용하여 1200×630px 이미지 생성
    - 로컬 TTF 폰트(Pretendard Regular, Bold 고정 웨이트) 로드 — `src/assets/fonts/`에 저장, `fs.readFile`로 로드
    - 쿼리 파라미터: `type=spot|route|default`, `id=xxx`
    - 스팟: 이름, 카테고리, 주소 정보 포함
    - 코스: 이름, 스팟 수 포함
    - 기본: Not a Trip 브랜드 이미지
    - `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800` 헤더 설정
    - 데이터 조회 실패 시 기본 브랜드 이미지 반환
    - 폰트 로드 실패 시 시스템 기본 폰트 폴백
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 8.2 각 페이지 메타데이터에 OG 이미지 URL 연결
    - `generateSpotMetadata()`의 openGraph.images에 `/api/og?type=spot&id=xxx` URL 설정
    - `generateRouteMetadata()`의 openGraph.images에 `/api/og?type=route&id=xxx` URL 설정
    - 정적 페이지 metadata의 openGraph.images에 `/api/og?type=default` URL 설정
    - _Requirements: 1.3, 1.4, 4.1, 4.2_

- [ ] 9. 사이트맵 및 robots.txt 구현
  - [ ] 9.1 사이트맵 생성 구현
    - `src/app/sitemap.ts` 생성 — Next.js App Router `sitemap.ts` 규약 사용
    - 정적 페이지 URL 포함 (메인, 갤러리, 코스 목록)
    - MongoDB에서 모든 공개 스팟, 공개 코스, 게시글 ID 조회 (경량 projection)
    - 동적 페이지 URL 생성 (`/spots/{id}`, `/routes/{id}`, `/community/{id}`)
    - 각 엔트리에 `lastModified`, `changeFrequency`, `priority` 속성 포함
    - 관리자/인증/테스트/API 경로 제외
    - DB 연결 실패 시 정적 페이지만 포함한 최소 사이트맵 반환
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 9.2 robots.txt 생성 구현
    - `src/app/robots.ts` 생성 — Next.js App Router `robots.ts` 규약 사용
    - `/api/*`, `/admin/*`, `/auth/*`, `/test/*` 크롤링 차단
    - 공개 페이지 크롤링 허용
    - 사이트맵 URL 명시 (`{Base_URL}/sitemap.xml`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 9.3 사이트맵 속성 테스트 (P5, P6, P7)
    - **Property 5: 사이트맵 엔티티 커버리지** — 랜덤 엔티티 ID 집합에 대해 모든 공개 엔티티 URL 포함 검증
    - **Validates: Requirements 5.3, 5.4, 5.5**
    - **Property 6: 사이트맵 엔트리 속성 완전성** — 모든 엔트리에 url, lastModified, changeFrequency, priority 존재 검증
    - **Validates: Requirements 5.6**
    - **Property 7: 사이트맵 비공개 경로 제외** — 어떤 엔트리 URL도 /admin, /auth, /test, /api 경로를 포함하지 않음 검증
    - **Validates: Requirements 5.7**

- [ ] 10. Checkpoint - OG 이미지 및 사이트맵 검증
  - Ensure all tests pass, ask the user if questions arise.
  - OG 이미지 API 응답, 사이트맵 XML, robots.txt 정상 동작 확인

- [ ] 11. 배포 설정 및 GA4 연동
  - [ ] 11.1 GA4 컴포넌트 구현 및 환경 변수 추가
    - `.env.example`에 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 추가 (`NEXT_PUBLIC_BASE_URL`은 Task 1.1에서 이미 추가됨)
    - `src/components/seo/GoogleAnalytics.tsx` 생성
    - `NEXT_PUBLIC_GA_MEASUREMENT_ID` 환경 변수 확인, 미설정 시 `null` 반환
    - `process.env.NODE_ENV === 'production'`일 때만 스크립트 삽입
    - `next/script`의 `afterInteractive` 전략 사용
    - `src/app/layout.tsx`에 `GoogleAnalytics` 컴포넌트 삽입
    - _Requirements: 10.3, 10.4, 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 12. Final Checkpoint - 전체 빌드 및 최종 검증
  - Ensure all tests pass, ask the user if questions arise.
  - `npm run build` 성공 확인
  - 모든 페이지의 메타데이터, JSON-LD, OG 이미지, 사이트맵, robots.txt 정상 동작 확인

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 각 task는 500줄 이하 PR 원칙에 맞게 분할됨
- 스팟 페이지를 먼저 리팩토링하여 Server/Client Component 분리 패턴을 검증한 뒤 코스/커뮤니티로 확장
- 정적 페이지 메타데이터는 루트 layout.tsx에 공통 템플릿(`title.template`)을 설정하고, 각 페이지별 layout.tsx에서 개별 metadata를 export하는 방식으로 처리
- `NEXT_PUBLIC_BASE_URL` 환경 변수는 Task 1.1에서 선행 설정하여 이후 모든 URL 생성 로직이 안정적으로 동작하도록 보장
- Property 4 (OG 이미지 응답 유효성)는 서버 환경 의존성으로 인해 통합 테스트로 검증 (별도 PBT 미포함)
- Vercel 배포(Req 10.1, 10.2, 10.5), 커스텀 도메인 연결(Req 11.1~11.4)은 Vercel 대시보드에서 수행하는 인프라 작업이므로 코딩 task에서 제외
- Property tests use `fast-check` library (already installed)
- Tag format: `Feature: 16-seo-deployment, Property {number}: {property_text}`
