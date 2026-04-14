# 요구사항 문서: 랜딩 페이지 코드 품질 점검 및 실제 데이터 교체

## 소개

기존 랜딩 페이지(landing-page spec)의 구현이 완료된 상태에서, 두 가지 후속 작업을 수행한다. 첫째, 코드 품질 이슈(프로덕션 console.warn, ErrorBoundary null 반환, 이미지 에러 핸들링 불일치, 매직 넘버 등)를 점검하고 수정한다. 둘째, 모든 더미/플레이스홀더 데이터를 웹 검색으로 검증된 실제 데이터로 교체한다. 단순 반복 치환 작업은 Gemini CLI(`node .kiro/hooks/run-gemini-cli.js`)로 위임하고, 실제 데이터 수집은 웹 검색을 활용한다.

## 용어 사전

- **Globe_Data_Point**: HeroSection의 3D 지구본에 표시되는 성지순례 포인트. 위도, 경도, 라벨, 카테고리, 썸네일 정보를 포함
- **Proof_Card**: 소셜 프루프 섹션에서 사용자 인증샷/경험을 보여주는 카드. 카테고리 태그, 스팟 이름, 코멘트, 이미지를 포함
- **Category_Story**: 카테고리 스토리텔링 섹션의 설정 데이터. 카테고리별 제목, 설명, 마스코트 소품 이미지, 대표 스팟 이미지, 컬러 토큰을 포함
- **ErrorBoundary**: Globe3D 컴포넌트 내부의 React Error Boundary 클래스 컴포넌트. WebGL 렌더링 에러 발생 시 폴백 UI를 표시하는 역할
- **Gemini_CLI**: 대규모 문자열 치환, 린트 수정 등 단순 반복 작업을 위임하는 CLI 도구. `node .kiro/hooks/run-gemini-cli.js` 스크립트로 실행
- **Fallback_UI**: 에러 발생 시 사용자에게 표시하는 대체 UI. null 반환 대신 의미 있는 시각적 피드백을 제공해야 함
- **Magic_Number**: 코드 내에서 의미 없이 사용되는 하드코딩된 숫자 상수. 설정 객체로 추출하여 의미를 명확히 해야 함

## 요구사항

### 요구사항 1: Globe3D 코드 품질 개선

**사용자 스토리:** 개발자로서, Globe3D 컴포넌트의 에러 처리와 설정 관리를 개선하여 유지보수성과 사용자 경험을 향상시키고 싶다.

#### 인수 조건

1. WHEN ErrorBoundary가 WebGL 렌더링 에러를 감지할 때, THE ErrorBoundary SHALL null 대신 GlobeFallback2D 컴포넌트를 렌더링하여 사용자에게 의미 있는 Fallback_UI를 제공한다
2. THE Globe3D SHALL GLOBE_RADIUS, AUTO_ROTATE_SPEED, RESUME_DELAY, DRAG_SENSITIVITY, MIN_NODE_DISTANCE 상수를 단일 설정 객체(GLOBE_CONFIG)로 통합하여 관리한다
3. THE Globe3D의 GLOBE_CONFIG SHALL 각 속성에 JSDoc 주석으로 용도와 단위를 명시한다

### 요구사항 2: StorytellingSection 코드 품질 개선

**사용자 스토리:** 개발자로서, StorytellingSection의 프로덕션 코드에서 디버깅용 로그를 제거하여 콘솔 출력을 깨끗하게 유지하고 싶다.

#### 인수 조건

1. THE StorytellingSection의 useGSAPAnimation 훅 SHALL GSAP 로드 실패 시 console.warn 호출을 제거하고, 에러 로깅 없이 CSS 폴백 처리만 수행한다
2. THE StorytellingSection의 useGSAPAnimation 훅 SHALL GSAP 로드 실패 시 containerRef 내부의 모든 .gsap-card 요소에 opacity: 1과 transform: none을 적용하여 콘텐츠가 정상 표시되도록 보장한다

### 요구사항 3: 이미지 에러 핸들링 일관성 확보

**사용자 스토리:** 개발자로서, 랜딩 페이지의 모든 이미지 컴포넌트가 동일한 에러 핸들링 패턴을 사용하여 코드 일관성을 확보하고 싶다.

#### 인수 조건

1. THE CategoryCard SHALL 이미지 로드 실패 시 카테고리 컬러 배경에 카테고리 제목 텍스트를 표시하는 폴백을 제공한다 (현재 구현 유지)
2. THE ProofCard SHALL 이미지 로드 실패 시 카테고리 아이콘 이모지(📍) 폴백을 제공한다 (현재 구현 유지)
3. THE CategoryCard와 ProofCard SHALL 이미지 에러 상태를 useState 훅으로 관리하는 동일한 패턴을 사용한다 (현재 구현 유지)
4. THE CategoryCard의 마스코트 소품 이미지(mascotProp) SHALL onError 핸들러를 추가하여 로드 실패 시 카테고리 이모지 또는 기본 아이콘으로 폴백한다

### 요구사항 4: Globe 데이터 포인트 실제 데이터 교체

**사용자 스토리:** 방문자로서, 3D 지구본에 실제 유명 성지순례 스팟이 정확한 좌표와 함께 표시되어 서비스의 글로벌 커버리지를 실감하고 싶다.

#### 인수 조건

1. THE HeroSection SHALL 기존 12개의 근사 좌표 Globe_Data_Point를 웹 검색으로 검증된 정확한 위도/경도 좌표로 교체한다
2. THE HeroSection SHALL Globe_Data_Point를 최소 25개 이상으로 확장하여 전 세계 주요 성지순례 스팟을 포함한다
3. THE Globe_Data_Point SHALL 6개 카테고리(animation, sports, movie_drama, music, game, other)를 균형 있게 포함한다
4. THE Globe_Data_Point의 각 항목 SHALL 실제 성지순례 명소의 정확한 이름을 label로 사용한다 (예: '아키하바라' → '아키하바라 전기거리', '캄프 누' → '캄프 노우')
5. THE Globe_Data_Point의 thumbnail SHALL 카테고리 아이콘(`/icons/categories/*.webp`) 경로를 유지한다 (실제 스팟 이미지 에셋이 준비될 때까지)
6. THE Globe_Data_Point SHALL 아시아, 유럽, 북미, 남미, 오세아니아, 중동/아프리카 등 전 세계 대륙에 골고루 분포한다
7. THE Globe_Data_Point 데이터 SHALL `src/components/landing/data/globeData.ts`로 분리하며, HeroSection에서 직접 import하여 `<Globe3D dataPoints={GLOBE_DATA_POINTS} />`로 Props 전달한다. 25개 좌표 데이터는 수십 KB 수준으로 메인 번들에 큰 영향이 없으며, Globe3D 내부에서 비동기 로드 시 Waterfall(next/dynamic 로드 → 데이터 로드)이 발생하므로 Props 전달 방식을 사용한다

### 요구사항 5: 소셜 프루프 실제 데이터 교체

**사용자 스토리:** 방문자로서, 소셜 프루프 섹션에서 실제 유명 성지순례 스팟의 이름과 사실적인 후기를 보고 서비스의 가치를 느끼고 싶다.

#### 인수 조건

1. THE PROOF_DUMMY_DATA SHALL 기존 8개 더미 카드의 spotName을 웹 검색으로 검증된 실제 유명 성지순례 스팟 이름으로 교체한다
2. THE PROOF_DUMMY_DATA SHALL 카드 수를 최소 12개 이상으로 확장하여 슬라이더의 시각적 풍성함을 확보한다
3. THE PROOF_DUMMY_DATA의 각 카드 SHALL 해당 스팟에 대한 사실적이고 구체적인 comment를 포함한다 (예: 실제 방문 후기 톤의 자연스러운 한국어 문장)
4. THE PROOF_DUMMY_DATA SHALL 6개 카테고리를 최소 2개씩 균형 있게 포함한다
5. THE PROOF_DUMMY_DATA의 image SHALL 카테고리 아이콘(`/icons/categories/*.webp`) 경로를 유지한다 (실제 인증샷 에셋이 준비될 때까지)
6. THE ProofData 인터페이스 SHALL `sceneImage` 필드(선택)를 추가하여 작품 속 장면 이미지 경로를 지원한다
7. THE ProofCard SHALL 스팟 사진(image)과 작품 속 장면(sceneImage)을 함께 표시하며, sceneImage가 없으면 기존 단일 이미지 레이아웃을 유지한다
8. THE ProofCard의 이미지 영역 SHALL 두 이미지를 좌우 또는 오버레이 형태로 비교 표시하여 "현실 vs 작품" 대비 효과를 제공한다

### 요구사항 6: 카테고리 스토리 실제 데이터 보강

**사용자 스토리:** 방문자로서, 각 카테고리 소개에서 실제 유명 스팟 이름이 언급된 구체적인 설명을 보고 탐색 의욕을 느끼고 싶다.

#### 인수 조건

1. THE CATEGORY_STORIES의 각 카테고리 description SHALL 해당 카테고리의 실제 유명 스팟 이름을 1~2개 포함하는 구체적인 문장으로 교체한다 (예: animation → '스즈미야 하루히의 니시노미야, 슬램덩크의 가마쿠라를 직접 걸어보세요')
2. THE CATEGORY_STORIES의 mascotProp과 spotImage SHALL 현재 동일한 카테고리 아이콘을 가리키는 상태를 유지하되, 향후 실제 이미지 에셋 교체를 위한 TODO 주석을 추가한다
3. THE CATEGORY_STORIES의 각 카테고리 title SHALL 현재 값을 유지한다 (이미 적절한 한국어 제목)

### 요구사항 7: AI 환각(Hallucination) 방지 및 데이터 검증 가이드라인

**사용자 스토리:** 개발자로서, AI 에이전트가 생성하는 모든 실제 데이터가 검증된 사실에 기반하여 서비스의 신뢰성을 보장하고 싶다.

#### 인수 조건

1. THE Gemini_CLI 및 AI 에이전트 SHALL 데이터를 생성할 때 반드시 실존하는 장소인지 웹 검색(Search API)을 통해 팩트 체크(Fact-check)를 수행해야 하며, 검증되지 않은 가상의 좌표(Lat/Lng)나 스팟 이름을 임의로 생성(Hallucination)해서는 안 된다
2. THE Globe_Data_Point의 위도/경도 좌표 SHALL 웹 검색 결과에서 확인된 실제 좌표값을 사용하며, 소수점 4자리 이상의 정밀도를 유지한다
3. THE PROOF_DUMMY_DATA의 spotName SHALL 웹 검색으로 해당 장소가 실제 성지순례/팬 방문 명소로 알려져 있음을 확인한 후 사용한다
4. THE CATEGORY_STORIES의 description에 포함되는 스팟 이름 SHALL 웹 검색으로 해당 카테고리의 대표적인 성지순례 명소임을 확인한 후 사용한다
