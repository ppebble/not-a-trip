# 요구사항 문서

## 소개

"Not a Trip" 프로젝트의 랜딩 페이지를 구현한다. 이 페이지는 신규 사용자가 처음 접했을 때 "후킹(Hook) → 몰입 → 전환(앱 설치/지도 탐색)"의 흐름을 통해 서비스의 핵심 가치를 전달하고 행동을 유도하는 역할을 한다. 3D 지구본과 마스코트 캐릭터를 활용한 히어로 섹션, GSAP/Framer Motion 기반의 스크롤 트리거 3D 팝업북 스타일 카테고리 스토리텔링, 소셜 프루프 슬라이더, PWA 설치 유도 전환 영역으로 구성된다. 저사양 기기를 위한 2D 폴백 레이아웃(Graceful Degradation)을 필수로 포함하며, GitHub Homepage, Stripe, Apple Product Pages, Duolingo 등을 레퍼런스로 참고한다. 기존 프로젝트의 CSS 변수 기반 디자인 시스템, 마스코트 디자인 시스템(spec 20), PWA 설치 바텀 시트(spec 21)와 매끄럽게 연동한다.

## 용어 사전

- **Landing_Page**: 신규 사용자가 서비스에 처음 접속했을 때 보게 되는 전용 소개 페이지. 기존 지도 메인 페이지(/)와 별도의 경로로 제공
- **Hero_Section**: 랜딩 페이지 최상단에 위치하며, 3D 지구본 비주얼과 마스코트 환영 인사, 핵심 카피, CTA 버튼으로 구성된 첫인상 영역
- **Globe_3D**: WebGL 기반으로 렌더링되는 인터랙티브 3D 지구본 컴포넌트. GitHub Homepage의 지구본을 레퍼런스로 하며, 데이터 포인트 연결 효과와 마우스 반응 애니메이션을 포함
- **CTA_Button**: Call-To-Action 버튼. 사용자에게 단일 핵심 행동("지도 탐색하기" 또는 "성지순례 시작하기")을 유도하는 버튼
- **Storytelling_Section**: 카테고리별(animation, sports, movie_drama, music, game, other) 매력을 스크롤 트리거 애니메이션으로 보여주는 기능 소개 영역
- **Scroll_Animation**: 사용자의 스크롤 위치에 따라 요소들이 3D 팝업북처럼 나타나는 효과. GSAP ScrollTrigger 또는 Framer Motion을 활용
- **Mascot_Curator**: 마스코트 캐릭터가 각 카테고리의 큐레이터 역할을 하며 소품(돋보기, 응원봉 등)을 활용해 기능을 설명하는 일러스트 요소
- **Social_Proof_Section**: 실제 사용자 인증샷이나 인기 게시글을 슬라이더 형태로 보여주는 커뮤니티 신뢰 영역. 초기에는 더미 데이터 또는 마스코트 일러스트로 대체 가능
- **Conversion_Section**: PWA 설치를 유도하는 전환 영역. 기존 "여권 발급받기" 바텀 시트/플로팅 배너와 연동
- **Fallback_Layout**: 저사양 기기(WebGL 미지원, 저성능 GPU 등)를 위한 가벼운 2D 일러스트 기반 대체 레이아웃
- **Device_Capability_Detector**: 사용자 기기의 WebGL 지원 여부, GPU 성능 등을 감지하여 3D 또는 2D 레이아웃을 분기하는 유틸리티
- **Install_Bottom_Sheet**: 기존 PWA spec(21-pwa-setup)에서 구현된 "Not a Trip 여권 발급받기 (앱 설치)" 바텀 시트 컴포넌트
- **Mascot_Design_System**: 기존 spec(20-mascot-design-system)에서 구축된 마스코트 캐릭터 기반 디자인 시스템
- **Semantic_Color**: CSS 변수 기반 시맨틱 컬러 토큰 (bg-surface, text-main-text, border-border 등)
- **Floating_CTA**: 스크롤 시 화면에 지속적으로 노출되는 플로팅 CTA 버튼 또는 배너

## 요구사항

### 요구사항 1: 히어로 섹션 (Hero Section)

**사용자 스토리:** 신규 방문자로서, 페이지에 접속한 첫 3초 안에 서비스의 핵심 가치를 직관적으로 이해하고 탐색을 시작하고 싶다.

#### 인수 조건

1. THE Hero_Section SHALL "관광지가 아닌 성지를 탐험하세요"와 같은 명확한 가치 제안 카피를 화면 중앙에 표시한다
2. THE Hero_Section SHALL Globe_3D 컴포넌트를 배경 또는 주요 비주얼 요소로 렌더링한다
3. THE Globe_3D SHALL 마우스 위치에 반응하는 회전 및 그라데이션 애니메이션을 제공한다 (Stripe 레퍼런스 참고)
4. THE Globe_3D SHALL 전 세계 성지순례 포인트를 데이터 포인트로 표시하고 연결선 효과를 렌더링한다 (GitHub Homepage 레퍼런스 참고)
5. THE Hero_Section SHALL Mascot_Design_System의 마스코트 캐릭터가 환영 인사를 하는 일러스트 또는 애니메이션을 Globe_3D 옆에 배치한다
6. THE Hero_Section SHALL 단일 CTA_Button("지도 탐색하기" 또는 "성지순례 시작하기")을 제공하여 사용자를 지도 메인 페이지로 이동시킨다
7. THE CTA_Button SHALL Semantic_Color의 Primary 컬러를 사용하고, 호버 시 시각적 피드백을 제공한다
8. WHEN 사용자가 CTA_Button을 클릭할 때, THE Landing_Page SHALL 지도 메인 페이지(/map 또는 PWA가 캐싱하는 기본 경로)로 클라이언트 사이드 라우팅(next/link 또는 useRouter)을 통해 네비게이션한다
9. THE Landing_Page의 진입 경로는 /welcome(또는 프로젝트에서 합의한 전용 경로)으로 설정하며, 신규 유저가 처음 접속했을 때만 노출되도록 기존 지도 페이지와 분리한다

### 요구사항 2: 카테고리 스토리텔링 섹션 (Storytelling Section)

**사용자 스토리:** 방문자로서, 스크롤을 내리면서 각 카테고리(애니메이션, 스포츠, 영화 등)의 매력을 시각적으로 몰입감 있게 경험하고 싶다.

#### 인수 조건

1. THE Storytelling_Section SHALL 6개 카테고리(animation, sports, movie_drama, music, game, other)를 순서대로 소개하는 개별 섹션을 포함한다
2. THE Storytelling_Section SHALL 각 카테고리 섹션이 스크롤 위치에 따라 3D 팝업북 스타일로 나타나는 Scroll_Animation을 적용한다 (Apple Product Pages 레퍼런스 참고)
3. THE Scroll_Animation SHALL GSAP ScrollTrigger 또는 Framer Motion 라이브러리를 활용하여 구현한다
4. THE Storytelling_Section SHALL 각 카테고리 섹션에 Mascot_Curator를 배치하여 해당 카테고리를 소개하는 역할을 부여한다
5. THE Mascot_Curator SHALL 카테고리에 맞는 소품(애니메이션: 돋보기, 스포츠: 응원봉, 음악: 헤드폰 등)을 활용한 일러스트를 표시한다
6. THE Storytelling_Section SHALL 각 카테고리의 대표 스팟 이미지 또는 일러스트를 함께 표시하여 시각적 스토리텔링을 완성한다
7. THE Storytelling_Section SHALL 각 카테고리 섹션에 해당 카테고리의 Semantic_Color 기반 Category_Color를 배경 또는 강조색으로 적용한다
8. WHEN 사용자가 특정 카테고리 섹션의 "더 보기" 링크를 클릭할 때, THE Storytelling_Section SHALL 해당 카테고리가 선택된 상태로 지도 메인 페이지로 이동한다
9. THE Scroll_Animation 적용 시, 모바일 기기의 렌더링 부하를 방지하기 위해 모든 3D Transform 애니메이션에 하드웨어 가속(will-change: transform, translate3d(0,0,0))을 강제 적용하여 프레임 드랍을 방지한다

### 요구사항 3: 소셜 프루프 섹션 (Social Proof Section)

**사용자 스토리:** 방문자로서, 다른 사용자들의 성지순례 경험을 보고 커뮤니티의 활발함과 재미를 느끼고 싶다.

#### 인수 조건

1. THE Social_Proof_Section SHALL 사용자 인증샷 또는 인기 게시글을 가로 슬라이더 형태로 표시한다
2. THE Social_Proof_Section SHALL 초기 단계에서 실제 데이터가 부족할 경우 마스코트 일러스트 기반 더미 카드로 대체하여 표시한다
3. THE Social_Proof_Section SHALL "함께 덕질하는 즐거움"과 같은 커뮤니티 가치를 강조하는 카피를 포함한다
4. THE Social_Proof_Section SHALL 슬라이더가 자동 스크롤되며, 사용자가 수동으로 좌우 스와이프할 수 있도록 한다
5. THE Social_Proof_Section SHALL 각 카드에 카테고리 태그, 스팟 이름, 사용자 코멘트(또는 더미 텍스트)를 포함한다
6. THE Social_Proof_Section SHALL Semantic_Color의 surface 및 border 토큰을 사용하여 프로젝트 디자인 시스템과 일관된 카드 스타일을 적용한다

### 요구사항 4: 전환 영역 (Conversion Section) 및 PWA 설치 유도

**사용자 스토리:** 방문자로서, 랜딩 페이지를 탐색하는 동안 자연스럽게 앱 설치를 유도받고, 쉽게 설치를 진행하고 싶다.

#### 인수 조건

1. THE Conversion_Section SHALL 스크롤 끝 부분에 PWA 설치를 유도하는 전용 영역을 표시한다
2. THE Conversion_Section SHALL 마스코트 캐릭터가 여권을 들고 있는 일러스트와 함께 "나만의 여권을 발급받고 성지순례를 시작하세요"와 같은 설치 유도 카피를 포함한다
3. THE Conversion_Section SHALL 설치 버튼 클릭 시 기존 Install_Bottom_Sheet 컴포넌트를 호출하여 PWA 설치 프로세스를 시작한다
4. THE Landing_Page SHALL 스크롤 시 화면 하단에 지속적으로 노출되는 Floating_CTA를 제공한다
5. THE Floating_CTA SHALL Hero_Section이 뷰포트를 벗어난 시점부터 표시되고, Conversion_Section이 뷰포트에 진입하면 숨긴다
6. WHEN 사용자가 Floating_CTA를 클릭할 때, THE Landing_Page SHALL 지도 메인 페이지(/)로 이동하거나 Install_Bottom_Sheet를 호출한다
7. WHILE 앱이 이미 Standalone 모드로 실행 중일 때, THE Conversion_Section SHALL PWA 설치 유도 대신 "지도 탐색하기" CTA만 표시한다
8. THE Floating_CTA SHALL 모바일 기기에서 브라우저 하단 툴바 및 홈 인디케이터에 가려지지 않도록 CSS 환경 변수(env(safe-area-inset-bottom))를 적용하여 안전한 여백을 확보한다

### 요구사항 5: Graceful Degradation (저사양 기기 폴백)

**사용자 스토리:** 저사양 기기 사용자로서, 3D 효과가 지원되지 않더라도 핵심 콘텐츠를 문제없이 탐색하고 서비스의 가치를 이해하고 싶다.

#### 인수 조건

1. THE Device_Capability_Detector SHALL 페이지 로드 시 WebGL 지원 여부와 GPU 렌더링 성능을 감지한다
2. IF 사용자 기기가 WebGL을 지원하지 않거나 GPU 성능이 낮을 경우, THEN THE Landing_Page SHALL Globe_3D 대신 정적 2D 지구본 일러스트를 표시하는 Fallback_Layout으로 전환한다
3. IF 사용자 기기가 저사양으로 감지될 경우, THEN THE Storytelling_Section SHALL 3D 팝업북 Scroll_Animation 대신 단순 페이드인/슬라이드인 CSS 애니메이션을 적용한다
4. THE Fallback_Layout SHALL 히어로 카피, CTA 버튼, 카테고리 소개, 소셜 프루프, 전환 영역 등 모든 핵심 콘텐츠를 동일하게 포함한다
5. THE Fallback_Layout SHALL 2D 마스코트 일러스트를 사용하여 3D 버전과 동일한 브랜드 경험을 제공한다
6. THE Device_Capability_Detector SHALL 감지 결과를 세션 동안 캐싱하여 페이지 내 반복 감지를 방지한다

### 요구사항 6: 반응형 레이아웃 및 디자인 시스템 연동

**사용자 스토리:** 사용자로서, 모바일, 태블릿, 데스크톱 어떤 기기에서든 랜딩 페이지가 최적화된 레이아웃으로 표시되기를 원한다.

#### 인수 조건

1. THE Landing_Page SHALL 모바일(768px 미만), 태블릿(768px~1024px), 데스크톱(1024px 이상) 3단계 반응형 레이아웃을 제공한다
2. THE Landing_Page SHALL 프로젝트의 CSS 변수 기반 Semantic_Color 토큰(bg-surface, text-main-text, border-border 등)을 사용하여 스타일링한다
3. THE Landing_Page SHALL 사용자의 라이트/다크 모드 설정과 무관하게 항상 다크 모드 테마로 렌더링한다. `(landing)` Route Group layout에서 `dark` 클래스를 강제 적용한다
4. THE Hero_Section SHALL 모바일에서 Globe_3D의 크기를 축소하고 카피와 CTA를 세로 배치로 전환한다
5. THE Storytelling_Section SHALL 모바일에서 카테고리 섹션을 세로 스크롤 카드 형태로 전환한다
6. THE Social_Proof_Section SHALL 모바일에서 슬라이더 카드 크기를 조정하여 한 번에 1개 카드가 표시되도록 한다
7. THE Landing_Page SHALL Tailwind CSS 유틸리티 클래스와 프로젝트의 기존 borderRadius 토큰(--radius-sm, --radius-md, --radius-lg, --radius-xl)을 활용한다

### 요구사항 7: 성능 및 접근성

**사용자 스토리:** 사용자로서, 랜딩 페이지가 빠르게 로드되고, 스크린 리더 등 보조 기술로도 핵심 콘텐츠에 접근할 수 있기를 원한다.

#### 인수 조건

1. THE Landing_Page SHALL Globe_3D 및 Scroll_Animation 라이브러리(GSAP 또는 Framer Motion)를 동적 임포트(dynamic import)하여 초기 번들 크기를 최소화한다
2. THE Landing_Page SHALL 이미지 에셋에 Next.js Image 컴포넌트를 사용하여 자동 최적화(WebP 변환, lazy loading)를 적용한다
3. THE Landing_Page SHALL 모든 이미지에 의미 있는 alt 텍스트를 제공한다
4. THE Landing_Page SHALL 시맨틱 HTML 태그(section, article, nav, header, footer)를 사용하여 문서 구조를 명확히 한다
5. THE CTA_Button SHALL 키보드 포커스 및 탭 네비게이션을 지원한다
6. THE Scroll_Animation SHALL prefers-reduced-motion 미디어 쿼리를 감지하여, 모션 감소 설정이 활성화된 경우 애니메이션을 비활성화하고 정적 레이아웃을 표시한다
7. THE Landing_Page SHALL 주요 텍스트와 배경 간 색상 대비를 WCAG AA 기준에 맞게 유지한다
