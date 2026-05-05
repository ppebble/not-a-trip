# Tasks: Landing Hero Floating Cards

## Task 1: 쇼케이스 카드 데이터 및 타입 정의

- [x] 1.1 `src/components/landing/data/showcaseCards.ts`에 ShowcaseCard 인터페이스와 CardPlacement 인터페이스를 정의한다
  - Requirements: 7.4
- [x] 1.2 SHOWCASE_CARDS 정적 데이터 12장을 카테고리 순환 배치로 생성한다 (카테고리당 2장: [anim, sports, movie, music, game, other] × 2)
  - Requirements: 7.1, 7.2, 7.3
- [x] 1.3 CARD_PLACEMENTS 배치 데이터 12개를 정의한다 (top, left, rotate, size, delay, duration, zIndex)
  - Requirements: 8.3
- [x] 1.4 getCategoryAccentColor 유틸 함수를 구현한다 (기존 CATEGORY_CONFIG 활용)
  - Requirements: 2.3

## Task 2: FloatingCard 컴포넌트 구현

- [x] 2.1 `src/components/landing/FloatingCard.tsx`에 FloatingCard 컴포넌트를 구현한다
  - Requirements: 2.1, 2.2, 2.3, 2.4, 2.7
- [x] 2.2 Next.js Image 컴포넌트로 이미지 렌더링 및 onError 폴백 처리를 구현한다
  - Requirements: 2.1, 2.6, 9.1, 9.3
- [x] 2.3 데스크톱 호버 효과(scale + shadow)를 구현한다
  - Requirements: 2.5
- [x] 2.4 3가지 크기 variant(sm: 120×90, md: 160×120, lg: 200×150)를 구현한다
  - Requirements: 2.7

## Task 3: MascotOverlay 컴포넌트 구현

- [x] 3.1 `src/components/landing/MascotOverlay.tsx`에 마스코트 오버레이 컴포넌트를 구현한다
  - Requirements: 3.1, 3.2, 3.3, 3.4

## Task 4: FloatingCardsCollage 컴포넌트 구현

- [x] 4.1 `src/components/landing/FloatingCardsCollage.tsx`에 콜라주 컴포넌트를 구현한다
  - Requirements: 1.1, 1.4, 1.6, 1.7
- [x] 4.2 반응형 카드 수 조절 로직을 구현한다 (모바일 6장, 태블릿 9장, 데스크톱 12장)
  - Requirements: 1.2, 1.3
- [x] 4.3 reducedMotion 처리를 구현한다 (true 시 애니메이션 비활성화)
  - Requirements: 1.5, 8.5

## Task 5: CSS Float 애니메이션 구현

- [x] 5.1 `src/components/landing/floating-cards.css`에 12개 카드별 고유 float keyframes를 정의한다
  - Requirements: 8.1, 8.2, 8.3, 8.4
- [x] 5.2 `will-change: transform` 및 GPU 가속 최적화를 적용한다
  - Requirements: 8.6
- [x] 5.3 `prefers-reduced-motion: reduce` 미디어 쿼리를 추가한다
  - Requirements: 8.5

## Task 6: HeroSection 및 WelcomePageClient 수정

- [x] 6.1 HeroSection에서 Globe3D/GlobeFallback2D를 FloatingCardsCollage로 교체한다
  - Requirements: 4.1, 4.3, 4.4
- [x] 6.2 HeroSection의 `isHighEnd` prop을 제거하고 `reducedMotion`만 사용하도록 수정한다
  - Requirements: 4.2
- [x] 6.3 WelcomePageClient에서 HeroSection에 `isHighEnd` prop 전달을 제거한다
  - Requirements: 5.1, 5.2, 5.3
- [x] 6.4 HeroSkeleton의 지구본 스켈레톤을 카드 콜라주 스켈레톤으로 수정한다

## Task 7: Three.js 의존성 제거 및 파일 정리

- [x] 7.1 Globe3D.tsx, GlobeFallback2D.tsx, MascotWalker.tsx, data/globeData.ts 파일을 삭제한다
  - Requirements: 6.3
- [x] 7.2 삭제된 파일에 대한 모든 import 참조를 제거한다
  - Requirements: 6.4
- [x] 7.3 `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` 패키지를 제거한다 (`npm uninstall`)
  - Requirements: 6.1, 6.2
- [x] 7.4 `npm run type-check`로 타입 에러가 없는지 확인한다
  - Requirements: 6.5

## Task 8: 쇼케이스 이미지 에셋 준비

- [x] 8.1 `/public/images/showcase/` 디렉토리를 생성하고 12장의 placeholder WebP 이미지를 배치한다
  - Requirements: 7.5, 9.2
- [x] 8.2 이미지가 없는 경우를 위한 카테고리별 폴백 이미지 경로를 확인한다
  - Requirements: 2.6

## Task 9: Checkpoint — 변경사항 검증

- [x] 9.1 `npm run type-check` 통과 확인
- [~] 9.2 `npm run build` 성공 확인
- [~] 9.3 Three.js 관련 패키지가 번들에서 제거되었는지 확인
- [~] 9.4 사용자가 직접 앱을 실행하여 히어로 섹션의 플로팅 카드 콜라주를 검증
