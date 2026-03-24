# 요구사항 문서

## 소개

마스코트 캐릭터를 기반으로 웹페이지의 전체 컬러 팔레트, 디자인 시스템, 그리고 시각적 에셋을 개편한다. 마스코트에서 추출한 청아하고 부드러운 파스텔 톤으로 기존 Navy 기반 팔레트를 완전히 교체하며, 컬러값이 자주 변경될 수 있으므로 CSS 변수/토큰 기반의 유연한 구조로 설계한다. 현재 분산되어 있는 컬러 정의(tailwind.config.ts, globals.css, spot.ts, 인라인 클래스)를 중앙 집중화하여 일관성과 유지보수성을 확보한다. 색상 변경뿐 아니라 지도 마커, 빈 상태/에러 일러스트, 로딩 애니메이션 등 마스코트 UI 에셋을 적용하여 브랜드 정체성을 완성한다.

## 용어 사전

- **Design_Token_System**: CSS 커스텀 프로퍼티(변수)와 Tailwind 설정을 통해 컬러, 타이포그래피, 간격 등 디자인 값을 중앙에서 관리하는 시스템
- **Color_Palette**: Primary, Secondary, Neutral, Text 등 역할별로 분류된 전체 컬러 체계
- **Design_Token_File**: 모든 디자인 토큰을 한 곳에서 정의하는 중앙 설정 파일
- **Semantic_Color**: 특정 hex 값이 아닌 용도(예: primary, secondary, surface)에 따라 이름 붙여진 컬러 변수
- **Category_Color**: 스팟 카테고리(animation, sports 등)별로 지정된 구분 컬러
- **Dark_Mode**: 사용자 시스템 설정에 따라 어두운 배경과 밝은 텍스트로 전환되는 테마
- **Header**: 페이지 상단에 고정된 네비게이션 바 컴포넌트
- **Bottom_Navigation**: 모바일 화면 하단에 고정된 네비게이션 바 컴포넌트
- **Tailwind_Config**: Tailwind CSS의 테마 확장 설정 파일 (tailwind.config.ts)
- **Globals_CSS**: 전역 CSS 커스텀 프로퍼티를 정의하는 파일 (globals.css)
- **SpotPin**: 지도 위에 스팟 위치를 표시하는 커스텀 마커 컴포넌트
- **CurrentLocationMarker**: 사용자의 현재 위치를 표시하는 지도 마커 컴포넌트
- **Mascot_Asset**: 마스코트 캐릭터를 활용한 UI 에셋 (일러스트, 아이콘, 애니메이션 등)
- **Border_Radius_Token**: 컴포넌트의 둥글기(border-radius)를 중앙에서 관리하는 디자인 토큰

## 요구사항

### 요구사항 1: 디자인 토큰 중앙 집중화

**사용자 스토리:** 개발자로서, 모든 디자인 값을 한 곳에서 관리하고 싶다. 그래야 컬러 변경 시 여러 파일을 수정하지 않아도 된다.

#### 인수 조건

1. THE Design_Token_System SHALL 모든 컬러 토큰을 단일 Design_Token_File에서 정의한다
2. THE Tailwind_Config SHALL Design_Token_File에서 정의된 CSS 커스텀 프로퍼티를 참조하여 컬러를 설정한다
3. THE Globals_CSS SHALL Design_Token_File의 CSS 커스텀 프로퍼티를 :root에서 선언한다
4. WHEN 컬러값을 변경할 때, THE Design_Token_System SHALL Design_Token_File 한 곳만 수정하면 전체 앱에 반영되도록 한다
5. THE Design_Token_System SHALL 컬러를 역할 기반 Semantic_Color 이름으로 정의한다 (예: --color-primary, --color-surface)

### 요구사항 2: 마스코트 기반 컬러 팔레트 적용

**사용자 스토리:** 디자이너로서, 마스코트 캐릭터에서 추출한 파스텔 톤 컬러로 앱 전체의 시각적 정체성을 통일하고 싶다.

#### 인수 조건

1. THE Color_Palette SHALL Primary 컬러로 Crystal Blue 계열을 사용한다 (주요 버튼, 활성 핀, 링크)
2. THE Color_Palette SHALL Secondary 컬러로 Lavender Bloom 계열을 사용한다 (강조 효과, 호버 상태, 특별 업적)
3. THE Color_Palette SHALL Neutral 컬러로 Pure White, Ghost Ivory, Soft Blush를 포함한다 (배경, 카드, 알림)
4. THE Color_Palette SHALL Text 컬러로 Midnight Grey 계열을 사용한다
5. THE Color_Palette SHALL 각 기본 컬러에 대해 밝기 단계별 변형(50~900 shade)을 제공한다
6. WHEN 컬러값이 변경될 때, THE Design_Token_System SHALL CSS 변수 값만 교체하면 전체 팔레트가 갱신되도록 한다
7. THE Design_Token_System SHALL 마스코트의 부드러운 테마에 맞춰 글로벌 Border_Radius_Token (--radius-sm, --radius-md, --radius-lg, --radius-xl) 값을 기존보다 둥글게(rounded-xl, rounded-2xl 수준으로) 상향 조정하여 포함한다

### 요구사항 3: 기존 Navy 팔레트 마이그레이션

**사용자 스토리:** 개발자로서, 기존 Navy 기반 컬러를 새 마스코트 팔레트로 안전하게 교체하고 싶다.

#### 인수 조건

1. THE Design_Token_System SHALL 기존 navy-50 ~ navy-900 CSS 변수를 새 Primary 컬러 shade로 교체한다
2. THE Tailwind_Config SHALL 기존 navy 컬러 팔레트 정의를 새 Semantic_Color 기반 정의로 교체한다
3. THE Design_Token_System SHALL 기존 하드코딩된 slate, blue 계열 Tailwind 클래스를 Semantic_Color 변수 기반 클래스로 교체한다
4. IF 마이그레이션 중 기존 컬러 참조가 누락될 경우, THEN THE Design_Token_System SHALL 빌드 시점에 해당 참조를 감지할 수 있도록 한다

### 요구사항 4: Header 컴포넌트 디자인 개편

**사용자 스토리:** 사용자로서, 마스코트 테마에 맞는 밝고 부드러운 Header를 보고 싶다.

#### 인수 조건

1. THE Header SHALL 배경색으로 Semantic_Color의 surface 컬러를 사용한다 (기존 slate-900 교체)
2. THE Header SHALL 텍스트 색상으로 Semantic_Color의 text 컬러를 사용한다 (기존 slate-300/white 교체)
3. THE Header SHALL 네비게이션 링크의 호버 상태에 Secondary 컬러를 사용한다
4. THE Header SHALL 로그인 버튼에 Primary 컬러를 사용한다 (기존 blue-600 교체)
5. THE Header SHALL 하단 보더에 Semantic_Color의 border 컬러를 사용한다 (기존 slate-700 교체)
6. THE Header SHALL 좌측 상단 서비스명(로고) 영역에 텍스트와 함께 작은 마스코트 얼굴 아이콘(또는 로고 에셋)을 배치한다

### 요구사항 5: 버튼 시스템 디자인 개편

**사용자 스토리:** 사용자로서, 일관된 버튼 스타일을 통해 직관적으로 인터랙션할 수 있기를 원한다.

#### 인수 조건

1. THE Design_Token_System SHALL Primary 버튼에 Primary 컬러를 사용한다 (기존 navy-600 교체)
2. THE Design_Token_System SHALL Secondary 버튼에 Secondary 컬러를 사용한다
3. THE Design_Token_System SHALL Destructive 버튼에 별도의 danger 시맨틱 컬러를 사용한다
4. THE Design_Token_System SHALL 버튼 호버 상태에 해당 컬러의 어두운 shade를 사용한다
5. THE Design_Token_System SHALL 버튼 비활성 상태에 해당 컬러의 밝은 shade와 낮은 불투명도를 사용한다
6. THE Design_Token_System SHALL 버튼 포커스 링에 Primary 컬러를 사용한다 (기존 navy-500 교체)

### 요구사항 6: 카테고리 및 콘텐츠 타입 컬러 토큰화

**사용자 스토리:** 개발자로서, 카테고리별 컬러를 하드코딩 대신 토큰으로 관리하여 일관성을 유지하고 싶다.

#### 인수 조건

1. THE Design_Token_System SHALL CATEGORY_CONFIG의 하드코딩된 hex 컬러를 CSS 변수 참조로 교체한다
2. THE Design_Token_System SHALL CONTENT_TYPE_CONFIG의 하드코딩된 hex 컬러를 CSS 변수 참조로 교체한다
3. THE Design_Token_System SHALL LINK_TYPE_CONFIG의 하드코딩된 hex 컬러를 CSS 변수 참조로 교체한다
4. THE Design_Token_System SHALL 카테고리 컬러를 마스코트 팔레트와 조화로운 파스텔 톤으로 재정의하되, 가독성을 보장하기 위해 배경색(bg)과 텍스트/아이콘 색상(fg)의 쌍(Pair)으로 토큰을 정의한다 (예: --category-anime-bg, --category-anime-fg)
5. WHEN 새로운 카테고리가 추가될 때, THE Design_Token_System SHALL Design_Token_File에 토큰만 추가하면 적용되도록 한다

### 요구사항 7: 폼 및 입력 필드 디자인 개편

**사용자 스토리:** 사용자로서, 입력 필드가 전체 디자인과 일관된 스타일을 가지기를 원한다.

#### 인수 조건

1. THE Design_Token_System SHALL 입력 필드 보더에 Semantic_Color의 border 컬러를 사용한다 (기존 navy-200 교체)
2. THE Design_Token_System SHALL 입력 필드 포커스 상태에 Primary 컬러를 사용한다 (기존 navy-500 교체)
3. THE Design_Token_System SHALL 입력 필드 플레이스홀더 텍스트에 Semantic_Color의 muted 컬러를 사용한다
4. THE Design_Token_System SHALL 에러 상태 입력 필드에 danger 시맨틱 컬러를 사용한다

### 요구사항 8: 카드 및 배경 디자인 개편

**사용자 스토리:** 사용자로서, 카드와 배경이 부드러운 파스텔 톤으로 통일되어 편안한 시각적 경험을 원한다.

#### 인수 조건

1. THE Design_Token_System SHALL 주 배경에 Semantic_Color의 background 컬러를 사용한다 (Pure White)
2. THE Design_Token_System SHALL 카드 배경에 Semantic_Color의 surface 컬러를 사용한다 (Ghost Ivory)
3. THE Design_Token_System SHALL 알림 및 강조 배경에 Semantic_Color의 accent-surface 컬러를 사용한다 (Soft Blush)
4. THE Design_Token_System SHALL 카드 보더에 Semantic_Color의 border 컬러를 사용한다
5. THE Design_Token_System SHALL 로딩 shimmer 효과에 새 팔레트의 Neutral 컬러를 사용한다

### 요구사항 9: 다크 모드 팔레트 대응

**사용자 스토리:** 사용자로서, 다크 모드에서도 마스코트 테마의 정체성이 유지되면서 눈이 편안한 경험을 원한다.

#### 인수 조건

1. THE Design_Token_System SHALL prefers-color-scheme: dark 미디어 쿼리에서 모든 Semantic_Color를 다크 모드 변형으로 재정의한다
2. THE Design_Token_System SHALL 다크 모드 배경에 어두운 톤의 Primary 계열 컬러를 사용한다 (기존 #0a0a0a 교체)
3. THE Design_Token_System SHALL 다크 모드 텍스트에 밝은 톤의 Neutral 컬러를 사용한다 (기존 #ededed 교체)
4. THE Design_Token_System SHALL 다크 모드에서 Primary, Secondary 컬러의 채도와 밝기를 조정하여 가독성을 유지한다
5. THE Design_Token_System SHALL 다크 모드 카테고리 컬러의 대비를 WCAG AA 기준에 맞게 조정한다

### 요구사항 10: 모바일 네비게이션 디자인 개편

**사용자 스토리:** 모바일 사용자로서, 하단 네비게이션이 전체 디자인과 일관된 스타일을 가지기를 원한다.

#### 인수 조건

1. THE Bottom_Navigation SHALL 배경색으로 Semantic_Color의 surface 컬러를 사용한다
2. THE Bottom_Navigation SHALL 활성 아이콘에 Primary 컬러를 사용한다
3. THE Bottom_Navigation SHALL 비활성 아이콘에 Semantic_Color의 muted 컬러를 사용한다
4. THE Bottom_Navigation SHALL 상단 보더에 Semantic_Color의 border 컬러를 사용한다

### 요구사항 11: 스크롤바 및 포커스 스타일 개편

**사용자 스토리:** 사용자로서, 스크롤바와 포커스 인디케이터도 전체 디자인과 조화를 이루기를 원한다.

#### 인수 조건

1. THE Globals_CSS SHALL 스크롤바 트랙에 Semantic_Color의 surface 컬러를 사용한다 (기존 navy-100 교체)
2. THE Globals_CSS SHALL 스크롤바 썸에 Semantic_Color의 muted 컬러를 사용한다 (기존 navy-400 교체)
3. THE Globals_CSS SHALL 포커스 아웃라인에 Primary 컬러를 사용한다 (기존 navy-500 교체)
4. THE Globals_CSS SHALL 로딩 shimmer 그라데이션에 새 Neutral 컬러를 사용한다 (기존 navy-200/100 교체)

### 요구사항 12: 마스코트 기반 커스텀 지도 마커 개편

**사용자 스토리:** 사용자로서, 지도에서 기존의 밋밋한 핀 대신 귀여운 마스코트 테마의 마커를 보고 싶다.

#### 인수 조건

1. THE SpotPin SHALL 기존 SVG 핀 대신 마스코트 테마가 적용된 새로운 커스텀 마커 Mascot_Asset을 사용한다
2. THE SpotPin SHALL 카테고리별로 마커의 색상(Primary/Secondary 토큰) 또는 내부 아이콘이 변경되어 표시되도록 한다
3. THE CurrentLocationMarker SHALL 펄스 효과가 있는 기본 파란 점 대신, 마스코트 얼굴/SD 캐릭터 Mascot_Asset을 사용한다
4. THE SpotPin SHALL 마커 에셋이 로드되지 않을 경우 기존 SVG 핀으로 폴백한다

### 요구사항 13: 마스코트 일러스트 기반 상태 화면 개편

**사용자 스토리:** 사용자로서, 검색 결과가 없거나 에러가 발생했을 때 마스코트 일러스트를 통해 불쾌감 없이 상황을 인지하고 싶다.

#### 인수 조건

1. THE EmptySearchOverlay SHALL 기존 아이콘 대신 돋보기를 든 마스코트 일러스트 Mascot_Asset을 표시한다
2. THE SpotErrorDisplay 및 ErrorBoundary SHALL 에러 발생 시 당황한 마스코트 일러스트 Mascot_Asset과 함께 Semantic_Color의 accent-surface 배경을 표시한다
3. THE 로딩 스피너 SHALL 단순 회전 아이콘 대신 마스코트 테마의 애니메이션 Mascot_Asset(GIF 또는 Lottie)으로 교체하되, Lottie 사용 시 번들 사이즈 최적화를 위해 경량 플레이어(예: @dotlottie/react-player 또는 동급)를 사용한다
4. THE EmptyFilterOverlay SHALL 기존 아이콘 대신 마스코트 일러스트 Mascot_Asset을 표시한다
