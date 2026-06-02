# 배포 적합성 검증 요구사항

## 소개

Not a Trip 프로젝트를 프로덕션 환경(Vercel 또는 자체 서버)에 배포하기 전, 빌드 최적화·이미지 도메인·PWA 캐시 전략·SSR/CSR 경계·모바일 성능·SEO·환경 변수·에러 페이지를 체계적으로 검증하여 배포 품질을 보장한다.

## 용어 정의

- **Build_Analyzer**: Next.js 프로덕션 빌드 결과물의 번들 사이즈와 코드 스플리팅 상태를 분석하는 검증 도구
- **Image_Config_Validator**: next.config.ts의 remotePatterns에 등록된 이미지 도메인이 실제 사용 중인지 검증하는 도구
- **PWA_Cache_Validator**: Serwist 기반 서비스 워커의 캐시 전략, 오프라인 동작, 캐시 무효화를 검증하는 도구
- **SSR_CSR_Boundary_Checker**: 서버 컴포넌트와 클라이언트 컴포넌트의 경계가 올바르게 설정되었는지 검증하는 도구
- **Performance_Auditor**: Lighthouse 및 Core Web Vitals 기준으로 모바일 성능을 측정하는 검증 도구
- **SEO_Validator**: 각 페이지의 메타 태그, OG 이미지, sitemap, robots.txt를 검증하는 도구
- **Env_Checker**: 프로덕션 배포에 필수적인 환경 변수의 존재 여부와 형식을 검증하는 도구
- **Error_Page_Validator**: 404, 500, 오프라인 폴백 페이지의 정상 동작을 검증하는 도구
- **Core_Web_Vitals**: LCP(Largest Contentful Paint), FID(First Input Delay), CLS(Cumulative Layout Shift) 지표
- **코드_스플리팅**: 번들을 페이지 단위로 분할하여 초기 로딩 성능을 개선하는 기법

## 요구사항

### 요구사항 1: 프로덕션 빌드 최적화 검증

**사용자 스토리:** 개발자로서, 프로덕션 빌드의 번들 사이즈와 코드 스플리팅 상태를 검증하여 최적의 로딩 성능을 보장하고 싶다.

#### 수용 기준

1. WHEN 프로덕션 빌드가 실행되면, THE Build_Analyzer SHALL 각 페이지별 JavaScript 번들 사이즈를 측정하고 보고한다
2. WHEN 개별 페이지 번들이 200KB(gzip 기준)를 초과하면, THE Build_Analyzer SHALL 해당 페이지와 초과 사이즈를 경고로 출력한다
3. WHEN 프로덕션 빌드가 완료되면, THE Build_Analyzer SHALL 동적 import를 사용하는 컴포넌트가 별도 청크로 분리되었는지 확인한다
4. WHEN 공유 모듈이 여러 페이지에서 사용되면, THE Build_Analyzer SHALL 해당 모듈이 공통 청크로 추출되었는지 확인한다
5. IF 빌드 과정에서 tree-shaking 실패로 미사용 코드가 포함되면, THEN THE Build_Analyzer SHALL 해당 모듈 경로와 예상 절감 사이즈를 보고한다

### 요구사항 2: 이미지 원격 도메인 정리

**사용자 스토리:** 개발자로서, next.config.ts의 remotePatterns에 실제 사용 중인 도메인만 유지하여 보안 노출 면적을 최소화하고 싶다.

#### 수용 기준

1. WHEN Image_Config_Validator가 실행되면, THE Image_Config_Validator SHALL next.config.ts의 remotePatterns에 등록된 모든 도메인 목록을 추출한다
2. WHEN 도메인 목록이 추출되면, THE Image_Config_Validator SHALL 소스 코드와 데이터베이스에서 각 도메인의 실제 사용 여부를 확인한다
3. WHEN 등록된 도메인이 소스 코드와 데이터베이스 어디에서도 사용되지 않으면, THE Image_Config_Validator SHALL 해당 도메인을 제거 대상으로 보고한다
4. WHEN placeholder 또는 테스트 전용 도메인(picsum.photos, via.placeholder.com)이 프로덕션 설정에 포함되면, THE Image_Config_Validator SHALL 해당 도메인을 제거 권고로 표시한다
5. IF 사용자 업로드 이미지를 위한 localhost 패턴이 프로덕션 설정에 포함되면, THEN THE Image_Config_Validator SHALL 프로덕션 스토리지 도메인으로 교체를 권고한다

### 요구사항 3: PWA 캐시 전략 검증

**사용자 스토리:** 사용자로서, 오프라인 상태에서도 이전에 방문한 스팟 정보를 확인할 수 있고, 온라인 복귀 시 최신 데이터로 자동 갱신되길 원한다.

#### 수용 기준

1. WHEN 네트워크가 오프라인 상태이고 사용자가 이전에 방문한 페이지로 이동하면, THE PWA_Cache_Validator SHALL 캐시된 콘텐츠가 정상적으로 표시되는지 확인한다
2. WHEN 네트워크가 오프라인 상태이고 사용자가 방문하지 않은 페이지로 이동하면, THE PWA_Cache_Validator SHALL 오프라인 폴백 페이지(/offline)가 표시되는지 확인한다
3. WHEN 서비스 워커가 업데이트되면, THE PWA_Cache_Validator SHALL skipWaiting과 clientsClaim이 활성화되어 즉시 새 버전이 적용되는지 확인한다
4. WHEN 지도 타일 캐시가 500개 항목을 초과하면, THE PWA_Cache_Validator SHALL ExpirationPlugin이 오래된 항목을 자동 제거하는지 확인한다
5. WHEN 스팟 데이터 API 응답이 캐시되면, THE PWA_Cache_Validator SHALL StaleWhileRevalidate 전략으로 캐시 응답 후 백그라운드 갱신이 수행되는지 확인한다
6. WHEN 사용자가 캐시 초기화 메시지(CLEAR_CACHES)를 전송하면, THE PWA_Cache_Validator SHALL 모든 캐시가 정상적으로 삭제되는지 확인한다
7. WHILE 프리캐시 목록(__SW_MANIFEST)이 로드되면, THE PWA_Cache_Validator SHALL 핵심 정적 자산이 프리캐시에 포함되어 있는지 확인한다

### 요구사항 4: SSR/CSR 경계 검증

**사용자 스토리:** 개발자로서, 서버 컴포넌트와 클라이언트 컴포넌트의 경계가 최적으로 설정되어 불필요한 클라이언트 번들이 포함되지 않도록 하고 싶다.

#### 수용 기준

1. WHEN SSR_CSR_Boundary_Checker가 실행되면, THE SSR_CSR_Boundary_Checker SHALL 'use client' 지시어가 있는 모든 컴포넌트를 식별한다
2. WHEN 클라이언트 컴포넌트가 브라우저 API(window, document, localStorage)를 사용하지 않고 이벤트 핸들러도 없으면, THE SSR_CSR_Boundary_Checker SHALL 해당 컴포넌트를 서버 컴포넌트 전환 후보로 보고한다
3. WHEN 서버 컴포넌트가 클라이언트 전용 라이브러리(leaflet, zustand)를 직접 import하면, THE SSR_CSR_Boundary_Checker SHALL 해당 import를 동적 import 또는 클라이언트 컴포넌트 분리 대상으로 보고한다
4. WHEN 페이지 컴포넌트가 데이터 페칭과 인터랙션을 모두 포함하면, THE SSR_CSR_Boundary_Checker SHALL 데이터 페칭은 서버 컴포넌트, 인터랙션은 클라이언트 컴포넌트로 분리를 권고한다
5. IF 클라이언트 컴포넌트 트리의 최상위에서 대용량 라이브러리를 import하여 하위 모든 컴포넌트가 클라이언트 번들에 포함되면, THEN THE SSR_CSR_Boundary_Checker SHALL 클라이언트 경계를 하위로 이동할 것을 권고한다

### 요구사항 5: 모바일 성능 검증

**사용자 스토리:** 사용자로서, 모바일 환경에서 빠르고 부드러운 경험을 제공받고 싶다.

#### 수용 기준

1. WHEN Performance_Auditor가 모바일 환경에서 랜딩 페이지를 측정하면, THE Performance_Auditor SHALL Lighthouse Performance 점수가 80점 이상인지 확인한다
2. WHEN Performance_Auditor가 LCP를 측정하면, THE Performance_Auditor SHALL LCP가 2.5초 이내인지 확인한다
3. WHEN Performance_Auditor가 CLS를 측정하면, THE Performance_Auditor SHALL CLS가 0.1 이하인지 확인한다
4. WHEN Performance_Auditor가 FID(INP)를 측정하면, THE Performance_Auditor SHALL INP가 200ms 이내인지 확인한다
5. WHEN 이미지가 뷰포트 밖에 위치하면, THE Performance_Auditor SHALL 해당 이미지에 lazy loading이 적용되어 있는지 확인한다
6. WHEN 웹폰트(PretendardVariable.woff2)가 로드되면, THE Performance_Auditor SHALL font-display: swap이 적용되어 FOIT가 발생하지 않는지 확인한다
7. WHEN 지도 컴포넌트가 포함된 페이지를 로드하면, THE Performance_Auditor SHALL Leaflet 라이브러리가 동적 import로 지연 로딩되는지 확인한다

### 요구사항 6: SEO 메타/OG 검증

**사용자 스토리:** 마케터로서, 모든 페이지가 검색 엔진과 소셜 미디어에서 올바르게 표시되도록 메타 태그와 OG 정보가 완전한지 확인하고 싶다.

#### 수용 기준

1. WHEN SEO_Validator가 각 페이지를 검사하면, THE SEO_Validator SHALL title, description, canonical URL이 모두 존재하는지 확인한다
2. WHEN SEO_Validator가 각 페이지를 검사하면, THE SEO_Validator SHALL og:title, og:description, og:image, og:url이 모두 존재하는지 확인한다
3. WHEN 스팟 상세 페이지를 검사하면, THE SEO_Validator SHALL 해당 스팟의 이름, 설명, 대표 이미지가 OG 태그에 동적으로 반영되는지 확인한다
4. WHEN sitemap.ts가 생성하는 사이트맵을 검사하면, THE SEO_Validator SHALL 모든 공개 페이지(스팟, 코스, 커뮤니티)가 포함되어 있는지 확인한다
5. WHEN robots.ts를 검사하면, THE SEO_Validator SHALL 크롤링 허용/차단 규칙이 프로덕션 환경에 적합한지 확인한다
6. IF og:image URL이 상대 경로이거나 접근 불가능한 URL이면, THEN THE SEO_Validator SHALL 해당 페이지와 잘못된 URL을 보고한다
7. WHEN Twitter Card 메타 태그를 검사하면, THE SEO_Validator SHALL twitter:card, twitter:title, twitter:description이 존재하는지 확인한다

### 요구사항 7: 환경 변수 검증

**사용자 스토리:** 개발자로서, 프로덕션 배포 시 필수 환경 변수가 누락되어 런타임 에러가 발생하는 것을 사전에 방지하고 싶다.

#### 수용 기준

1. WHEN Env_Checker가 실행되면, THE Env_Checker SHALL .env.example에 정의된 모든 필수 환경 변수가 프로덕션 환경에 설정되어 있는지 확인한다
2. WHEN MONGODB_URI가 설정되면, THE Env_Checker SHALL 유효한 MongoDB 연결 문자열 형식(mongodb:// 또는 mongodb+srv://)인지 확인한다
3. WHEN AUTH_URL이 설정되면, THE Env_Checker SHALL 프로덕션 도메인 URL(https://)이 올바르게 설정되어 있는지 확인한다
4. WHEN NEXT_PUBLIC_ 접두사 환경 변수를 검사하면, THE Env_Checker SHALL 클라이언트에 노출되어도 안전한 값만 포함되어 있는지 확인한다
5. IF OAuth 관련 환경 변수(CLIENT_ID, CLIENT_SECRET)가 누락되면, THEN THE Env_Checker SHALL 해당 OAuth 프로바이더의 로그인 기능이 비활성화됨을 경고한다
6. WHEN Sentry 관련 환경 변수(DSN, AUTH_TOKEN, ORG, PROJECT)를 검사하면, THE Env_Checker SHALL 모니터링 기능 활성화에 필요한 변수가 모두 설정되어 있는지 확인한다
7. IF AUTH_SECRET이 기본값(your-secret-key-here)이거나 16자 미만이면, THEN THE Env_Checker SHALL 보안 취약 경고를 출력한다

### 요구사항 8: 에러 페이지 검증

**사용자 스토리:** 사용자로서, 에러 상황에서도 일관된 UI와 안내 메시지를 제공받아 혼란 없이 서비스를 이용하고 싶다.

#### 수용 기준

1. WHEN 존재하지 않는 URL로 접근하면, THE Error_Page_Validator SHALL 커스텀 404 페이지가 표시되는지 확인한다
2. WHEN 서버 에러가 발생하면, THE Error_Page_Validator SHALL global-error.tsx가 에러를 캐치하고 사용자 친화적 메시지를 표시하는지 확인한다
3. WHEN 에러 페이지가 표시되면, THE Error_Page_Validator SHALL 홈으로 돌아가기 링크 또는 버튼이 포함되어 있는지 확인한다
4. WHEN 오프라인 상태에서 캐시되지 않은 페이지에 접근하면, THE Error_Page_Validator SHALL /offline 폴백 페이지가 표시되는지 확인한다
5. WHEN 오프라인 폴백 페이지가 표시되면, THE Error_Page_Validator SHALL 네트워크 상태 안내와 재시도 옵션을 제공하는지 확인한다
6. IF global-error.tsx에서 Sentry로 에러를 전송하면, THEN THE Error_Page_Validator SHALL 에러 컨텍스트(URL, 사용자 정보)가 포함되어 전송되는지 확인한다
7. WHEN 에러 페이지의 스타일을 검사하면, THE Error_Page_Validator SHALL 다크 모드와 라이트 모드 모두에서 정상적으로 표시되는지 확인한다
