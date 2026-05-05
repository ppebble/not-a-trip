# Requirements: Landing Hero Floating Cards

## 소개

랜딩 페이지 히어로 섹션의 Three.js 3D 지구본을 "플로팅 카드 콜라주"로 교체한다. 실제 스팟 사진과 작품명이 표시된 카드들이 다크 배경 위에서 천천히 떠다니는 Pinterest/Dribbble 스타일의 시각적으로 풍부한 레이아웃으로, CSS 애니메이션 기반으로 구현하여 Three.js 의존성을 완전히 제거하고 번들 사이즈를 개선한다.

## 용어 사전

- **FloatingCardsCollage**: 히어로 섹션의 비주얼 영역. 여러 장의 스팟 카드가 떠다니는 콜라주 컴포넌트
- **FloatingCard**: 개별 플로팅 카드. 스팟 이미지 + 작품명 + 카테고리 accent 색상을 표시
- **ShowcaseCard**: 쇼케이스 카드 데이터 타입. 정적 데이터로 관리
- **MascotOverlay**: 마스코트(흰 고양이)를 카드 콜라주 위에 오버레이하는 컴포넌트
- **CardPlacement**: 각 카드의 위치, 크기, 애니메이션 설정을 정의하는 배치 데이터
- **Float Animation**: CSS keyframes 기반의 카드 떠다니기 애니메이션 (translateY + translateX + rotate)

## Requirements

### Requirement 1: FloatingCardsCollage 컴포넌트

#### 인수 조건

1. THE FloatingCardsCollage SHALL 12장의 정적 쇼케이스 카드 데이터(SHOWCASE_CARDS)를 기반으로 FloatingCard를 렌더링한다
2. THE FloatingCardsCollage SHALL 반응형으로 카드 수를 조절한다: 모바일(< 768px) 6장, 태블릿(768px ~ 1024px) 9장, 데스크톱(> 1024px) 12장
3. THE FloatingCardsCollage SHALL 6장 표시 시 6개 카테고리(animation, sports, movie_drama, music, game, other)가 각 1장씩 포함되도록 SHOWCASE_CARDS를 카테고리 순환 배치한다
4. THE FloatingCardsCollage SHALL 각 카드에 고유한 float 애니메이션(딜레이, 주기, 방향)을 부여하여 자연스러운 떠다니기 효과를 제공한다
5. THE FloatingCardsCollage SHALL `reducedMotion=true` 시 모든 카드의 애니메이션을 비활성화하고 정적 배치한다
6. THE FloatingCardsCollage SHALL `role="img"`와 `aria-label="다양한 성지순례 스팟을 보여주는 플로팅 카드 콜라주"` 접근성 속성을 포함한다
7. THE FloatingCardsCollage SHALL MascotOverlay를 카드 콜라주 위에 렌더링한다

### Requirement 2: FloatingCard 컴포넌트

#### 인수 조건

1. THE FloatingCard SHALL Next.js Image 컴포넌트로 스팟 이미지를 렌더링하여 자동 WebP 변환과 lazy loading을 적용한다
2. THE FloatingCard SHALL 카드 하단에 작품명(contentName)을 표시한다
3. THE FloatingCard SHALL 카테고리별 accent 색상을 카드 하단 바 또는 테두리로 표시한다
4. THE FloatingCard SHALL 다크 테마에 어울리는 스타일을 적용한다: 반투명 배경, 미세한 글로우, 둥근 모서리
5. THE FloatingCard SHALL 데스크톱에서 호버 시 `scale(1.05)` 확대와 그림자 강화 효과를 적용한다
6. THE FloatingCard SHALL 이미지 로드 실패 시 카테고리 기본 아이콘(`/icons/categories/{category}.webp`)을 폴백으로 표시한다
7. THE FloatingCard SHALL 3가지 크기 variant(sm, md, lg)를 지원한다

### Requirement 3: MascotOverlay 컴포넌트

#### 인수 조건

1. THE MascotOverlay SHALL 마스코트(흰 고양이) 이미지를 카드 콜라주 우하단에 배치한다
2. THE MascotOverlay SHALL 미세한 float 애니메이션(위아래 2~3px)을 적용한다
3. THE MascotOverlay SHALL `reducedMotion=true` 시 애니메이션을 비활성화하고 정적 배치한다
4. THE MascotOverlay SHALL 모바일에서 크기를 축소하여 카드 콜라주와 겹치지 않도록 한다

### Requirement 4: HeroSection 수정

#### 인수 조건

1. THE HeroSection SHALL Globe3D 및 GlobeFallback2D 대신 FloatingCardsCollage를 렌더링한다
2. THE HeroSection SHALL `isHighEnd` prop을 제거하고 `reducedMotion`만 전달받는다
3. THE HeroSection SHALL 기존 텍스트(h1, p) 및 CTAButton 영역을 그대로 유지한다
4. THE HeroSection SHALL 모바일에서 텍스트 위 + 카드 아래, 데스크톱에서 좌우 배치 레이아웃을 유지한다

### Requirement 5: WelcomePageClient 수정

#### 인수 조건

1. THE WelcomePageClient SHALL HeroSection에 `isHighEnd` prop 전달을 제거한다
2. THE WelcomePageClient SHALL HeroSection에 `reducedMotion` prop만 전달한다
3. THE WelcomePageClient SHALL `useDeviceCapability` 훅의 `isHighEnd` 결과를 HeroSection에 사용하지 않는다 (다른 섹션에서 사용 시 유지)

### Requirement 6: Three.js 의존성 제거

#### 인수 조건

1. THE project SHALL `three`, `@react-three/fiber`, `@react-three/drei` 패키지를 dependencies에서 제거한다
2. THE project SHALL `@types/three` 패키지를 devDependencies에서 제거한다
3. THE project SHALL Globe3D.tsx, GlobeFallback2D.tsx, MascotWalker.tsx, data/globeData.ts 파일을 삭제한다
4. THE project SHALL 삭제된 파일에 대한 모든 import 참조를 제거한다
5. THE project SHALL `npm run type-check` 통과를 확인한다

### Requirement 7: 쇼케이스 카드 데이터

#### 인수 조건

1. THE SHOWCASE_CARDS SHALL 12장의 카드 데이터를 포함한다
2. THE SHOWCASE_CARDS SHALL 6개 카테고리를 균형 배분한다 (카테고리당 2장)
3. THE SHOWCASE_CARDS SHALL 카테고리 순환 배치한다: [anim, sports, movie, music, game, other, anim, sports, movie, music, game, other]
4. THE SHOWCASE_CARDS SHALL 각 카드에 id, spotName, contentName, category, imageUrl 필드를 포함한다
5. THE SHOWCASE_CARDS SHALL 이미지로 `/images/showcase/` 디렉토리의 정적 WebP 파일을 참조한다

### Requirement 8: CSS 애니메이션

#### 인수 조건

1. THE float animation SHALL CSS keyframes로 구현한다 (JavaScript 애니메이션 라이브러리 미사용)
2. THE float animation SHALL GPU 가속 속성(`transform`, `opacity`)만 사용하여 60fps를 유지한다
3. THE float animation SHALL 각 카드마다 다른 duration(6~8.5초)과 delay(0~2.5초)를 적용한다
4. THE float animation SHALL `ease-in-out` 타이밍과 `alternate` 방향으로 부드러운 왕복 움직임을 제공한다
5. THE float animation SHALL `prefers-reduced-motion: reduce` 미디어 쿼리를 존중한다
6. THE FloatingCard SHALL `will-change: transform`을 적용하여 합성 레이어를 생성한다

### Requirement 9: 이미지 최적화

#### 인수 조건

1. THE FloatingCard SHALL Next.js Image 컴포넌트를 사용하여 자동 WebP 변환, lazy loading, srcSet을 적용한다
2. THE showcase images SHALL 최대 400x300px 크기의 WebP 포맷으로 제공한다
3. THE FloatingCard SHALL 각 이미지에 의미 있는 alt 텍스트(`{spotName} - {contentName}`)를 제공한다
