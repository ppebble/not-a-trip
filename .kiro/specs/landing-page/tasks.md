# 구현 계획: 랜딩 페이지 (Landing Page)

## 개요

"Not a Trip" 서비스의 신규 사용자 전용 랜딩 페이지를 구현한다. 라우트 구조 변경(middleware.ts, /map 이전, /welcome 생성)을 먼저 수행하고, 유틸리티 훅 → 정적/단순 컴포넌트 → 복잡한 3D/애니메이션 컴포넌트 → PWA 연동 순서로 점진적으로 구현한다. 모든 컴포넌트는 TypeScript + Tailwind CSS 시맨틱 컬러 토큰을 사용하며, 기존 프로젝트의 디자인 시스템과 일관성을 유지한다.

## Tasks

- [x] 1. 라우트 구조 변경 및 미들웨어 설정
  - [x] 1.1 middleware.ts 생성 — 루트(/) 경로에서 `has_visited` 쿠키 기반 분기 리다이렉트 구현
    - `src/middleware.ts` 파일 생성
    - `has_visited` 쿠키가 `true`이면 `/map`으로, 아니면 `/welcome`으로 리다이렉트
    - `config.matcher`를 `['/']`로 설정하여 루트 경로에만 적용
    - 쿠키 읽기 실패 시 신규 유저로 간주하여 `/welcome`으로 리다이렉트 (에러 처리)
    - _Requirements: 1.9_

  - [x] 1.2 기존 지도 페이지를 /map 경로로 이전
    - `src/app/page.tsx`의 내용을 `src/app/(main)/map/page.tsx`로 이동
    - Route Group `(main)` 디렉토리 생성
    - 기존 import 경로 및 참조 정상 동작 확인
    - _Requirements: 1.9_

  - [x] 1.3 /welcome 랜딩 페이지 라우트 생성
    - `src/app/(landing)/welcome/page.tsx` 서버 컴포넌트 생성 (메타데이터 포함)
    - Route Group `(landing)` 디렉토리 생성
    - `WelcomePageClient` 클라이언트 컴포넌트 스켈레톤 생성 (`src/components/landing/WelcomePageClient.tsx`)
    - CTA 클릭 또는 페이지 이탈 시 `has_visited=true` 쿠키 설정 로직 포함 (만료: 365일)
    - _Requirements: 1.9, 1.8_

- [x] 2. 체크포인트 — 라우트 구조 변경 검증
  - 모든 테스트 통과 확인, `/`, `/welcome`, `/map` 라우팅 정상 동작 확인. 문제 발생 시 사용자에게 문의.

- [x] 3. 유틸리티 훅 구현
  - [x] 3.1 useDeviceCapability 훅 구현
    - `src/hooks/useDeviceCapability.ts` 생성
    - SSR 시 `{ webglSupported: false, gpuTier: 'low', isHighEnd: false, isReady: false }` 반환 (Hydration Mismatch 방지)
    - `useEffect` 내에서만 `sessionStorage` 접근 및 WebGL 컨텍스트 생성
    - `WEBGL_debug_renderer_info` 확장으로 GPU 렌더러 문자열 추출
    - 저성능 GPU 키워드(`SwiftShader`, `llvmpipe`, `Software`, `Microsoft Basic Render`) 매칭
    - 감지 결과를 `sessionStorage`에 캐싱하여 반복 감지 방지
    - `isReady`가 `false`인 동안 2D Fallback 또는 Skeleton 표시
    - _Requirements: 5.1, 5.2, 5.6_

  - [ ]* 3.2 useDeviceCapability 속성 기반 테스트 작성
    - **Property 5: 디바이스 능력 기반 렌더링 모드 분기**
    - **Property 6: 디바이스 감지 결과 세션 캐싱 라운드 트립**
    - **Validates: Requirements 5.2, 5.3, 5.6**

  - [x] 3.3 useScrollPosition 훅 구현
    - `src/hooks/useScrollPosition.ts` 생성
    - `heroRef`, `conversionRef`를 받아 `scrollY`, `heroExited`, `conversionVisible` 상태 반환
    - `IntersectionObserver` 활용하여 섹션 진입/이탈 감지
    - _Requirements: 4.5_

  - [x] 3.4 usePrefersReducedMotion 훅 구현
    - `src/hooks/usePrefersReducedMotion.ts` 생성
    - `prefers-reduced-motion` 미디어 쿼리 감지
    - `matchMedia` 변경 이벤트 리스너로 실시간 반영
    - _Requirements: 7.6_

- [x] 4. 정적/단순 컴포넌트 구현
  - [x] 4.1 CTAButton 컴포넌트 구현
    - `src/components/landing/CTAButton.tsx` 생성
    - `label`, `href`, `variant`, `size` props 지원
    - `next/link` 기반 클라이언트 사이드 라우팅
    - Primary 시맨틱 컬러 사용, 호버 시 시각적 피드백
    - 키보드 포커스 및 탭 네비게이션 지원 (접근성)
    - _Requirements: 1.6, 1.7, 1.8, 7.5_

  - [x] 4.2 GlobeFallback2D 컴포넌트 구현
    - `src/components/landing/GlobeFallback2D.tsx` 생성
    - 정적 2D 지구본 일러스트 표시 (Next.js Image 컴포넌트 사용)
    - 의미 있는 alt 텍스트 제공
    - 반응형 크기 조정 (모바일에서 축소)
    - _Requirements: 5.2, 5.4, 5.5, 7.2, 7.3_

  - [x] 4.3 ProofCard 컴포넌트 구현
    - `src/components/landing/ProofCard.tsx` 생성
    - `categoryTag`, `spotName`, `comment`, `image` props 지원
    - 시맨틱 컬러의 surface 및 border 토큰 사용
    - 이미지 로딩 실패 시 플레이스홀더 표시
    - _Requirements: 3.5, 3.6_

  - [ ]* 4.4 ProofCard 속성 기반 테스트 작성
    - **Property 2: ProofCard 필수 정보 포함**
    - **Validates: Requirements 3.5**

- [x] 5. 체크포인트 — 유틸리티 훅 및 기본 컴포넌트 검증
  - 모든 테스트 통과 확인, 훅 및 기본 컴포넌트 정상 동작 확인. 문제 발생 시 사용자에게 문의.

- [x] 6. 히어로 섹션 구현
  - [x] 6.1 HeroSection 컴포넌트 구현
    - `src/components/landing/HeroSection.tsx` 생성
    - `isHighEnd`, `reducedMotion` props 기반 3D/2D 분기 렌더링
    - 가치 제안 카피("관광지가 아닌 성지를 탐험하세요") 화면 중앙 표시
    - 마스코트 환영 인사 일러스트 배치 (Globe 옆)
    - CTAButton 배치 ("지도 탐색하기" → `/map`)
    - 시맨틱 HTML 태그(`section`, `header`) 사용
    - 모바일에서 Globe 크기 축소, 카피와 CTA 세로 배치 전환
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 6.4, 7.4_

  - [x] 6.2 Globe3D 컴포넌트 구현 (dynamic import)
    - `src/components/landing/Globe3D.tsx` 생성
    - `@react-three/fiber` + `@react-three/drei` 기반 3D 지구본 렌더링
    - `next/dynamic`으로 동적 임포트 (SSR 비활성화, 번들 분리)
    - 마우스 위치 반응 회전 및 그라데이션 애니메이션
    - 성지순례 포인트 데이터 포인트 표시 및 연결선 효과
    - 로딩 실패 시 `GlobeFallback2D`로 자동 전환
    - _Requirements: 1.2, 1.3, 1.4, 7.1_

  - [ ]* 6.3 HeroSection 단위 테스트 작성
    - 가치 제안 카피, CTA 버튼, 마스코트 이미지 존재 확인
    - CTA 클릭 시 `/map` 라우팅 확인
    - _Requirements: 1.1, 1.5, 1.6, 1.8_

- [ ] 7. 카테고리 스토리텔링 섹션 구현
  - [ ] 7.1 카테고리 스토리 설정 데이터 정의
    - `src/components/landing/data/categoryStories.ts` 생성
    - 6개 카테고리(`animation`, `sports`, `movie_drama`, `music`, `game`, `other`) 설정 데이터
    - 각 카테고리별 `title`, `description`, `mascotProp`, `spotImage`, `colorToken` 정의
    - _Requirements: 2.1, 2.5, 2.7_

  - [ ] 7.2 CategoryCard 컴포넌트 구현
    - `src/components/landing/CategoryCard.tsx` 생성
    - 카테고리별 마스코트 큐레이터 소품 이미지 표시
    - 카테고리 시맨틱 컬러 기반 배경/강조색 적용
    - "더 보기" 링크 → `/map?category={category}` 라우팅
    - `isHighEnd` / `reducedMotion` 기반 애니메이션 분기
    - 이미지 로딩 실패 시 카테고리 컬러 배경 텍스트 카드로 폴백
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 7.3 카테고리 링크 라우팅 속성 기반 테스트 작성
    - **Property 1: 카테고리 "더 보기" 링크 라우팅 정확성**
    - **Validates: Requirements 2.8**

  - [ ] 7.4 StorytellingSection 컴포넌트 구현 (GSAP ScrollTrigger)
    - `src/components/landing/StorytellingSection.tsx` 생성
    - GSAP + `@gsap/react`의 `useGSAP()` 훅 필수 사용 (React 18 Strict Mode 호환)
    - `scope` 옵션으로 containerRef 지정하여 컨텍스트 자동 정리
    - 6개 카테고리 섹션을 스크롤 위치에 따라 3D 팝업북 스타일로 표시
    - 모든 3D Transform에 `will-change: transform`, `translate3d(0,0,0)` 하드웨어 가속 적용
    - `reducedMotion === true` 시 GSAP 비활성화, CSS 페이드인/슬라이드인으로 폴백
    - 저사양 기기(`isHighEnd === false`) 시 단순 CSS 애니메이션 적용
    - 모바일에서 세로 스크롤 카드 형태로 전환
    - _Requirements: 2.1, 2.2, 2.3, 2.9, 5.3, 6.5, 7.6_

  - [ ]* 7.5 StorytellingSection 단위 테스트 작성
    - 6개 카테고리 섹션 모두 렌더링 확인
    - 각 카테고리별 올바른 소품 이미지 매핑 확인
    - _Requirements: 2.1, 2.4, 2.5_

- [x] 8. 소셜 프루프 섹션 구현
  - [x] 8.1 소셜 프루프 더미 데이터 정의
    - `src/components/landing/data/proofData.ts` 생성
    - 6~8개 더미 ProofData 카드 (마스코트 일러스트 기반)
    - _Requirements: 3.2_

  - [x] 8.2 SocialProofSection 컴포넌트 구현
    - `src/components/landing/SocialProofSection.tsx` 생성
    - "함께 덕질하는 즐거움" 커뮤니티 가치 카피 포함
    - ProofCard를 가로 슬라이더 형태로 표시
    - 자동 스크롤 + 수동 좌우 스와이프 지원
    - 모바일에서 한 번에 1개 카드 표시
    - 시맨틱 HTML 태그 사용
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.6, 7.4_

  - [ ]* 8.3 SocialProofSection 단위 테스트 작성
    - 더미 데이터 없을 때 마스코트 카드 표시 확인
    - 슬라이더 렌더링 확인
    - _Requirements: 3.2_

- [ ] 9. 체크포인트 — 주요 섹션 구현 검증
  - 모든 테스트 통과 확인, Hero/Storytelling/SocialProof 섹션 정상 렌더링 확인. 문제 발생 시 사용자에게 문의.

- [ ] 10. 전환 영역 및 PWA 연동 구현
  - [ ] 10.1 ConversionSection 컴포넌트 구현
    - `src/components/landing/ConversionSection.tsx` 생성
    - 마스코트 여권 일러스트 + 설치 유도 카피 표시
    - 설치 버튼 클릭 시 기존 `pwaStore.triggerInstall()` 호출
    - `isStandalone === true` 시 PWA 설치 유도 대신 "지도 탐색하기" CTA만 표시
    - 시맨틱 HTML 태그 사용
    - _Requirements: 4.1, 4.2, 4.3, 4.7_

  - [ ]* 10.2 ConversionSection 속성 기반 테스트 작성
    - **Property 4: Standalone 모드 전환 영역 조건부 렌더링**
    - **Validates: Requirements 4.7**

  - [ ] 10.3 FloatingCTA 컴포넌트 구현
    - `src/components/landing/FloatingCTA.tsx` 생성
    - `fixed bottom-0 inset-x-0 z-40 pb-safe-bottom` 레이아웃 적용
    - `visible` prop: `heroExited && !conversionVisible` 조건으로 표시/숨김
    - `isStandalone` 상태에 따라 "지도 탐색하기" 또는 "앱 설치" 동작 분기
    - CSS `env(safe-area-inset-bottom)` 적용으로 모바일 안전 영역 확보
    - _Requirements: 4.4, 4.5, 4.6, 4.8_

  - [ ]* 10.4 FloatingCTA 속성 기반 테스트 작성
    - **Property 3: FloatingCTA 표시 조건 불변식**
    - **Validates: Requirements 4.5**

- [ ] 11. 페이지 통합 및 반응형/접근성 마무리
  - [ ] 11.1 WelcomePageClient 통합 구현
    - `src/components/landing/WelcomePageClient.tsx` 완성
    - `useDeviceCapability`, `useScrollPosition`, `usePrefersReducedMotion` 훅 연결
    - `heroRef`, `conversionRef` 생성 및 각 섹션에 전달
    - 디바이스 능력에 따라 3D/2D 분기 렌더링 통합
    - `isReady === false` 동안 로딩 스켈레톤 표시
    - HeroSection → StorytellingSection → SocialProofSection → ConversionSection 순서 배치
    - FloatingCTA 표시 조건 연결 (`heroExited && !conversionVisible`)
    - _Requirements: 5.2, 5.3, 5.4, 6.1, 6.2, 6.3_

  - [ ] 11.2 반응형 레이아웃 및 다크 모드 고정 적용
    - `src/app/(landing)/layout.tsx`에서 `dark` 클래스를 강제 적용하여 랜딩 페이지 전체를 다크 모드로 고정
    - 모바일(768px 미만), 태블릿(768px~1024px), 데스크톱(1024px 이상) 3단계 반응형 확인
    - Tailwind CSS 유틸리티 클래스 및 기존 borderRadius 토큰 활용
    - 주요 텍스트/배경 색상 대비 WCAG AA 기준 확인
    - _Requirements: 6.1, 6.2, 6.3, 6.7, 7.7_

  - [ ]* 11.3 접근성 및 이미지 alt 텍스트 테스트 작성
    - **Property 7: 이미지 alt 텍스트 존재**
    - **Property 8: prefers-reduced-motion 시 애니메이션 비활성화**
    - 시맨틱 HTML 태그 사용 확인
    - CTA 키보드 접근성 확인
    - **Validates: Requirements 7.3, 7.4, 7.5, 7.6**

- [ ] 12. 최종 체크포인트 — 전체 통합 검증
  - 모든 테스트 통과 확인, 전체 랜딩 페이지 정상 동작 확인. 문제 발생 시 사용자에게 문의.

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 추적성을 위해 특정 요구사항을 참조함
- 체크포인트는 점진적 검증을 보장함
- 속성 기반 테스트는 설계 문서의 정확성 속성(Correctness Properties)을 검증함
- GSAP 사용 시 반드시 `@gsap/react`의 `useGSAP()` 훅을 사용하여 React 18 Strict Mode 호환성 확보
- `useDeviceCapability`는 SSR 시 `isReady: false`를 반환하여 Hydration Mismatch 방지
- FloatingCTA는 `pb-safe-bottom`으로 모바일 안전 영역 확보
- 모든 컴포넌트는 시맨틱 컬러 토큰(`bg-surface`, `text-main-text` 등) 사용 (하드코딩 금지)
- **랜딩 페이지는 라이트/다크 모드 구분 없이 항상 다크 모드로 고정 렌더링** — `(landing)` layout에서 `dark` 클래스 강제 적용
