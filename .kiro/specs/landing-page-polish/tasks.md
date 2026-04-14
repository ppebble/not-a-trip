# 구현 계획: 랜딩 페이지 코드 품질 점검 및 실제 데이터 교체

## 개요

코드 품질 개선(ErrorBoundary, console.warn, GLOBE_CONFIG, mascotProp 에러 핸들링)을 먼저 수행하고, 이후 실제 데이터 교체(Globe 25개+, Proof 12개+, Category Stories)를 진행한다. 모든 실제 데이터는 웹 검색으로 검증 후 사용한다. 단순 반복 치환은 Gemini CLI로 위임한다.

## Tasks

- [x] 1. Globe3D 코드 품질 개선
  - [x] 1.1 ErrorBoundary 폴백을 GlobeFallback2D로 교체
    - `ErrorBoundaryFallback.render()`에서 `return null` → `return <GlobeFallback2D />`로 변경
    - 상위 `Globe3D` 컴포넌트의 `hasError` 상태 기반 폴백은 기존 유지 (이중 안전장치)
    - _Requirements: 1.1_

  - [x] 1.2 매직 넘버 5개를 GLOBE_CONFIG 객체로 통합
    - `GLOBE_RADIUS`, `AUTO_ROTATE_SPEED`, `RESUME_DELAY`, `DRAG_SENSITIVITY`, `MIN_NODE_DISTANCE` → 단일 `GLOBE_CONFIG` 객체로 추출
    - `Object.freeze()` + `as const` 적용하여 런타임 불변성 보장
    - 각 속성에 JSDoc 주석으로 용도와 단위 명시
    - 기존 상수 참조를 `GLOBE_CONFIG.radius`, `GLOBE_CONFIG.autoRotateSpeed` 등으로 일괄 교체 (Gemini CLI `bulk-replace` 위임 가능)
    - _Requirements: 1.2, 1.3_

  - [ ]* 1.3 Globe3D 단위 테스트 작성
    - `GLOBE_CONFIG` 객체에 5개 속성(radius, autoRotateSpeed, resumeDelay, dragSensitivity, minNodeDistance) 존재 확인
    - ErrorBoundary 에러 발생 시 `GlobeFallback2D` 렌더링 확인 (null이 아님)
    - 테스트 파일: `src/components/landing/__tests__/Globe3D.test.tsx`
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. StorytellingSection console.warn 제거 및 CategoryCard 에러 핸들링
  - [x] 2.1 useGSAPAnimation 훅의 console.warn 제거
    - `catch (error)` → `catch` 로 변경 (미사용 변수 제거)
    - `console.warn('GSAP 로드 실패, CSS 폴백 적용:', error)` 라인 삭제
    - CSS 폴백 처리 로직(opacity: 1, transform: none)은 그대로 유지
    - _Requirements: 2.1, 2.2_

  - [x] 2.2 CategoryCard mascotProp 이미지 에러 핸들링 추가
    - `mascotError` useState 추가
    - mascotProp `<Image>` 에 `onError={() => setMascotError(true)}` 핸들러 추가
    - 에러 시 `CATEGORY_EMOJI` 매핑 기반 이모지 폴백 표시
    - `CATEGORY_EMOJI` Record 상수 정의: animation→🎬, sports→⚽, movie_drama→🎥, music→🎵, game→🎮, other→📍
    - _Requirements: 3.4_

  - [ ]* 2.3 StorytellingSection 및 CategoryCard 단위 테스트 작성
    - GSAP import 실패 시 `console.warn` 미호출 확인
    - GSAP import 실패 시 `.gsap-card` 요소에 opacity:1, transform:none 적용 확인
    - CategoryCard mascotProp 이미지 에러 시 카테고리 이모지 폴백 표시 확인
    - 테스트 파일: `src/components/landing/__tests__/StorytellingSection.test.tsx`, `src/components/landing/__tests__/CategoryCard.test.tsx`
    - _Requirements: 2.1, 2.2, 3.4_

- [ ] 3. 체크포인트 — 코드 품질 개선 검증
  - `npm run type-check` 및 `npm run build` 통과 확인
  - 모든 테스트 통과 확인, 문제 발생 시 사용자에게 문의

- [x] 4. Globe 데이터 포인트 분리 및 실제 데이터 교체
  - [x] 4.1 globeData.ts 파일 생성 및 HeroSection 연결
    - `src/components/landing/data/globeData.ts` 신규 생성
    - `GlobeDataPoint` 인터페이스를 `HeroSection.tsx`에서 `globeData.ts`로 이동 (또는 재export)
    - HeroSection의 인라인 `GLOBE_DATA_POINTS` 상수 제거 → `globeData.ts`에서 import
    - Globe3D에 Props 전달 방식 유지 (Waterfall 방지)
    - _Requirements: 4.7_

  - [x] 4.2 Globe 데이터 포인트 25개 이상 실제 데이터 작성
    - 웹 검색으로 각 성지순례 명소의 정확한 좌표(소수점 4자리+) 검증
    - 6개 카테고리 균형 배분 (카테고리당 최소 4개)
    - 대륙별 분포: 아시아 8~10, 유럽 5~6, 북미 4~5, 남미 2, 오세아니아 1~2, 중동/아프리카 1~2
    - label: 실제 명소의 정확한 이름 사용 (웹 검색 검증)
    - thumbnail: 카테고리 아이콘 경로 유지 (`/icons/categories/*.webp`)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.1, 7.2_

  - [ ]* 4.3 Globe 데이터 PBT 및 단위 테스트 작성
    - **Property 1: Globe 좌표 유효성 및 정밀도**
    - **Validates: Requirements 4.1, 7.2**
    - **Property 2: 이미지 경로 일관성** (Globe 데이터 thumbnail 검증)
    - **Validates: Requirements 4.5**
    - 단위 테스트: 25개 이상 확인, 6개 카테고리 모두 포함, 대륙 분포(양수/음수 위도·경도 존재) 확인
    - 테스트 파일: `src/components/landing/__tests__/data/globeData.test.ts`
    - _Requirements: 4.2, 4.3, 4.6_

- [x] 5. 소셜 프루프 실제 데이터 교체
  - [x] 5.1 proofData.ts 실제 데이터 12개 이상으로 교체
    - 웹 검색으로 각 spotName이 실제 성지순례/팬 방문 명소인지 검증
    - 12개 이상 카드, 6개 카테고리 각 최소 2개 균형 배분
    - comment: 해당 스팟에 대한 사실적이고 구체적인 한국어 후기 톤 문장 (10자 이상)
    - image: 카테고리 아이콘 경로 유지 (`/icons/categories/*.webp`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.3_

  - [ ]* 5.2 소셜 프루프 데이터 PBT 및 단위 테스트 작성
    - **Property 2: 이미지 경로 일관성** (Proof 데이터 image 검증)
    - **Validates: Requirements 5.5**
    - **Property 3: 소셜 프루프 코멘트 최소 품질**
    - **Validates: Requirements 5.3**
    - 단위 테스트: 12개 이상 확인, 6개 카테고리 각 최소 2개 확인
    - 테스트 파일: `src/components/landing/__tests__/data/proofData.test.ts`
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [ ] 6. 카테고리 스토리 description 실제 스팟 이름 포함으로 교체
  - [ ] 6.1 categoryStories.ts description 교체 및 TODO 주석 추가
    - 웹 검색으로 각 카테고리의 대표 성지순례 명소 확인
    - 각 카테고리 description에 실제 유명 스팟 이름 1~2개 포함하는 구체적 문장으로 교체
    - title은 현재 값 유지
    - mascotProp, spotImage에 `// TODO: 실제 마스코트 소품/스팟 이미지로 교체` 주석 추가
    - _Requirements: 6.1, 6.2, 6.3, 7.4_

  - [ ]* 6.2 카테고리 스토리 단위 테스트 작성
    - 6개 카테고리 title이 기존 값과 동일한지 확인
    - 각 description이 비어있지 않고 구체적인 스팟 이름을 포함하는지 확인
    - 테스트 파일: `src/components/landing/__tests__/data/categoryStories.test.ts`
    - _Requirements: 6.1, 6.3_

- [ ] 7. 최종 체크포인트 — 전체 검증
  - `npm run type-check` 및 `npm run build` 통과 확인
  - 모든 테스트 통과 확인, 문제 발생 시 사용자에게 문의

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 Requirements를 참조하여 추적성 확보
- 체크포인트에서 점진적 검증 수행
- Property 테스트는 설계 문서의 Correctness Properties를 검증
- 단위 테스트는 특정 예시 및 엣지 케이스를 검증
- 모든 실제 데이터(좌표, 스팟 이름)는 웹 검색으로 팩트 체크 후 사용 (AI 환각 방지)
- 단순 반복 치환 작업은 Gemini CLI `bulk-replace`로 위임 가능
