# 구현 계획: 마스코트 기반 디자인 시스템 개편

## 개요

기존 Navy 기반 컬러 팔레트를 마스코트 파스텔 톤으로 전면 교체하고, CSS 커스텀 프로퍼티 기반 디자인 토큰 시스템을 구축한다. globals.css → tailwind.config.ts → 컴포넌트 순서로 토큰 참조 체인을 완성하고, 카테고리/콘텐츠 Config를 토큰화하며, 마스코트 에셋 및 Lottie 로딩을 적용한다.

## Tasks

- [x] 1. 디자인 토큰 시스템 기반 구축
  - [x] 1.1 globals.css에 CSS 커스텀 프로퍼티 정의
    - `:root`에 Primary(Crystal Blue), Secondary(Lavender Bloom), Neutral(Ghost Ivory/Soft Blush) 컬러의 50~900 shade를 RGB 숫자값으로 정의
    - 시맨틱 역할 토큰 정의 (`--color-background`, `--color-surface`, `--color-accent-surface`, `--color-text`, `--color-text-secondary`, `--color-muted`, `--color-border`, `--color-danger`, `--color-danger-surface`)
    - ⚠️ 시맨틱 토큰의 중첩 `var()` 참조 문제 검증: `rgb(var(...) / <alpha-value>)` 패턴과 호환되도록 시맨틱 토큰도 직접 RGB 숫자값 저장 방식 채택
    - 카테고리 컬러 bg/fg 쌍 정의 (`--category-anime-bg/fg`, `--category-sports-bg/fg` 등 6개 카테고리)
    - 콘텐츠 타입 컬러 bg/fg 쌍 정의 (`--content-anime-bg/fg` 등 7개 타입)
    - 링크 타입 컬러 정의 (`--link-official`, `--link-ticket`, `--link-schedule`, `--link-sns`, `--link-other`)
    - Border Radius 토큰 정의 (`--radius-sm: 0.5rem`, `--radius-md: 0.75rem`, `--radius-lg: 1rem`, `--radius-xl: 1.5rem`)
    - 기존 `--navy-*`, `--background`, `--foreground` 변수 제거
    - _Requirements: 1.1, 1.3, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 6.4_

  - [x] 1.2 tailwind.config.ts에서 CSS 변수 참조로 테마 확장
    - 기존 `navy` 팔레트 정의 제거
    - `primary`, `secondary`, `neutral` 컬러를 `rgb(var(--color-*) / <alpha-value>)` 패턴으로 정의 (50~900 + DEFAULT)
    - 시맨틱 역할 컬러 추가 (`background`, `surface`, `accent-surface`, `text-primary`, `text-secondary`, `muted`, `border`, `danger`, `danger-surface`)
    - `borderRadius` 확장 (`sm`, `md`, `lg`, `xl`을 CSS 변수 참조)
    - 기존 `background`, `foreground` 정의를 새 시맨틱 컬러로 교체
    - _Requirements: 1.2, 1.4, 2.6, 2.7, 3.2_

  - [ ]* 1.3 Property 1 속성 테스트 — 토큰 시스템 무결성
    - **Property 1: 토큰 시스템 무결성 — Tailwind 컬러 설정의 CSS 변수 참조**
    - tailwind.config.ts의 모든 컬러 값이 `rgb(var(--...) / <alpha-value>)` 패턴이고, 참조된 CSS 변수가 globals.css `:root`에 정의되어 있는지 검증
    - **Validates: Requirements 1.1, 1.2, 1.5**

  - [ ]* 1.4 Property 3 속성 테스트 — 컬러 shade 완전성
    - **Property 3: 컬러 shade 완전성**
    - primary, secondary, neutral 각 팔레트에 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 총 10개 shade가 모두 정의되어 있는지 검증
    - **Validates: Requirements 2.5**

- [x] 2. 디자인 토큰 타입 정의 및 Config 토큰화
  - [x] 2.1 디자인 토큰 타입 파일 생성
    - `src/types/design-tokens.ts` 생성
    - `SemanticColorRole`, `ColorShade`, `CategoryColorToken`, `CategoryConfig`, `ContentTypeConfig`, `LinkTypeConfig` 타입 정의
    - _Requirements: 1.5, 6.4_

  - [x] 2.2 CATEGORY_CONFIG, CONTENT_TYPE_CONFIG, LINK_TYPE_CONFIG 토큰화
    - `src/types/spot.ts`의 `CategoryConfig` 인터페이스: `color` → `bgColor` + `fgColor` 변경
    - `ContentTypeConfig` 인터페이스: `color` → `bgColor` + `fgColor` 변경
    - `LinkTypeConfig` 인터페이스: `color` 필드를 CSS 변수 참조로 변경
    - `CATEGORY_CONFIG` 값을 `var(--category-*-bg/fg)` 참조로 교체
    - `CONTENT_TYPE_CONFIG` 값을 `var(--content-*-bg/fg)` 참조로 교체
    - `LINK_TYPE_CONFIG` 값을 `var(--link-*)` 참조로 교체
    - Config의 `color` 필드를 참조하는 모든 컴포넌트 업데이트 (`bgColor`/`fgColor` 사용)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 2.3 Property 5 속성 테스트 — Config 컬러 토큰화
    - **Property 5: Config 컬러 토큰화 — CSS 변수 참조 및 bg/fg 쌍**
    - CATEGORY_CONFIG, CONTENT_TYPE_CONFIG의 모든 항목이 `bgColor`와 `fgColor` 필드를 가지고, 값이 `var(--...)` 형태인지 검증
    - LINK_TYPE_CONFIG의 `color` 필드가 `var(--...)` 형태인지 검증
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

- [ ] 3. Checkpoint — 토큰 시스템 기반 검증
  - 모든 테스트 통과 확인, 빌드 정상 여부 확인, 사용자에게 질문 사항 확인

- [x] 4. 다크 모드 팔레트 대응
  - [x] 4.1 globals.css 다크 모드 변수 재정의
    - `@media (prefers-color-scheme: dark)` 블록에서 모든 시맨틱 컬러 변수 재정의
    - 다크 모드 배경: 어두운 Primary 계열 (기존 `#0a0a0a` 교체)
    - 다크 모드 텍스트: 밝은 Neutral 계열 (기존 `#ededed` 교체)
    - Primary, Secondary 컬러의 채도/밝기 조정
    - 카테고리/콘텐츠 타입 컬러의 다크 모드 대비 조정 (WCAG AA 기준)
    - 기존 `@media (prefers-color-scheme: dark)` 블록의 `--background`, `--foreground` 제거
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 4.2 Property 6 속성 테스트 — 다크 모드 시맨틱 변수 완전 재정의
    - **Property 6: 다크 모드 시맨틱 변수 완전 재정의**
    - `:root`에서 정의된 모든 시맨틱 컬러 변수가 `@media (prefers-color-scheme: dark)` 블록에서도 재정의되어 있는지 검증
    - **Validates: Requirements 9.1**

  - [ ]* 4.3 Property 7 속성 테스트 — 다크 모드 WCAG AA 대비
    - **Property 7: 다크 모드 카테고리 컬러 WCAG AA 대비**
    - 다크 모드 카테고리 bg/fg 쌍의 대비 비율이 WCAG AA 기준(4.5:1) 이상인지 검증
    - **Validates: Requirements 9.5**

- [x] 5. 글로벌 스타일 및 레이아웃 컴포넌트 마이그레이션
  - [x] 5.1 globals.css 글로벌 스타일 마이그레이션
    - `body` 스타일: `var(--foreground)` → 시맨틱 토큰 참조로 교체
    - 스크롤바 트랙: `var(--navy-100)` → 시맨틱 surface 컬러
    - 스크롤바 썸: `var(--navy-400)` → 시맨틱 muted 컬러
    - 포커스 아웃라인: `var(--navy-500)` → Primary 컬러
    - 로딩 shimmer 그라데이션: `var(--navy-200/100)` → Neutral 컬러
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 5.2 Header 컴포넌트 마이그레이션
    - 배경색: `slate-900` 계열 → `bg-surface` 시맨틱 클래스
    - 텍스트: `slate-300/white` → `text-text-secondary` / `text-text-primary`
    - 호버 상태: Secondary 컬러 적용
    - 로그인 버튼: `blue-600` → `bg-primary`
    - 하단 보더: `slate-700` → `border-border`
    - 좌측 로고 영역에 마스코트 얼굴 아이콘 배치 (에셋 미존재 시 폴백 처리)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 5.3 BottomSheet/모바일 네비게이션 마이그레이션
    - 배경색: `surface` 시맨틱 컬러 적용
    - 활성 아이콘: Primary 컬러
    - 비활성 아이콘: muted 컬러
    - 상단 보더: border 시맨틱 컬러
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 6. Checkpoint — 레이아웃 마이그레이션 검증
  - 모든 테스트 통과 확인, 사용자에게 질문 사항 확인

- [x] 7. 버튼/폼/카드 컴포넌트 마이그레이션
  - [x] 7.1 버튼 시스템 마이그레이션
    - Primary 버튼: `navy-600` → `bg-primary`, 호버 시 어두운 shade
    - Secondary 버튼: Secondary 컬러 적용
    - Destructive 버튼: `danger` 시맨틱 컬러
    - 비활성 상태: 밝은 shade + 낮은 불투명도
    - 포커스 링: `navy-500` → Primary 컬러
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 7.2 폼/입력 필드 마이그레이션
    - 보더: `navy-200` → `border-border`
    - 포커스: `navy-500` → Primary 컬러
    - 플레이스홀더: `text-muted`
    - 에러 상태: `danger` 시맨틱 컬러
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 7.3 카드/배경 컴포넌트 마이그레이션
    - 주 배경: `bg-background` (Pure White)
    - 카드 배경: `bg-surface` (Ghost Ivory)
    - 알림/강조 배경: `bg-accent-surface` (Soft Blush)
    - 카드 보더: `border-border`
    - 로딩 shimmer: Neutral 컬러
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [-] 8. 레거시 컬러 참조 전면 제거
  - [-] 8.1 컴포넌트 소스에서 navy-/slate-/blue- 클래스 제거
    - 모든 `.tsx`, `.ts`, `.css` 파일에서 `navy-*`, `slate-*`, `blue-*` Tailwind 클래스를 시맨틱 클래스로 교체
    - 하드코딩된 hex 컬러값을 CSS 변수 참조로 교체
    - _Requirements: 3.1, 3.3_

  - [ ]* 8.2 Property 4 속성 테스트 — 레거시 컬러 참조 제거
    - **Property 4: 레거시 컬러 참조 제거**
    - 모든 컴포넌트 소스 파일에서 `navy-`, `slate-`, `blue-` 접두사를 가진 Tailwind 클래스 또는 CSS 변수 참조가 존재하지 않는지 검증
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 8.3 Property 2 속성 테스트 — CSS 변수 변경 전파
    - **Property 2: CSS 변수 변경 전파 — 단일 변경점 보장**
    - `:root`에서 CSS 변수 값 변경 시 해당 변수를 참조하는 Tailwind 유틸리티 클래스의 computed style이 변경된 값을 반영하는지 검증 (JSDOM 환경)
    - **Validates: Requirements 1.4, 2.6**

- [ ] 9. 베이스 컬러 팔레트 확정 및 조정
  - [ ] 9.1 사용자와 함께 기본 컬러 방향 확정
    - 현재 적용된 보라 계열 Primary가 어색한 문제 해결
    - 마스코트 캐릭터 레퍼런스 이미지 기반으로 Primary/Secondary/Neutral 기본색 후보 선정
    - 사용자에게 후보 팔레트 제시 및 피드백 수렴
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 9.2 확정된 컬러로 globals.css 팔레트 값 교체
    - `:root` Primary 50~900 RGB 값 교체
    - `:root` Secondary 50~900 RGB 값 교체
    - `:root` Neutral 50~900 RGB 값 교체
    - 시맨틱 역할 토큰 값 재조정 (background, surface, text 등)
    - 카테고리/콘텐츠/링크 타입 컬러 값 재조정
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 9.3 다크 모드 팔레트 값 재조정
    - `@media (prefers-color-scheme: dark)` 블록의 모든 변수 값을 새 팔레트에 맞게 재조정
    - WCAG AA 대비 기준 충족 확인
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 9.4 map.css 하드코딩 hex 값 새 팔레트에 맞게 교체
    - Leaflet 줌 컨트롤, 팝업, 툴팁 등의 hex 값을 새 Primary 계열로 교체
    - _Requirements: 2.1_

  - [ ] 9.5 Checkpoint — 베이스 컬러 조정 검증
    - 전체 UI 시각적 확인 (사용자 피드백)
    - `npm run type-check` 및 `npm run build` 정상 확인

- [ ] 10. Checkpoint — 컬러 마이그레이션 완료 검증
  - 모든 테스트 통과 확인, 빌드 정상 여부 확인, 사용자에게 질문 사항 확인

- [ ] 11. Lottie 로딩 컴포넌트 구현
  - [ ] 11.1 @lottiefiles/dotlottie-react 패키지 설치 및 LottieLoader 컴포넌트 생성
    - `npm install @lottiefiles/dotlottie-react`
    - `src/components/common/LottieLoader.tsx` 생성
    - `next/dynamic`으로 동적 임포트 (SSR 비활성화)
    - 로딩 중 CSS 스피너 폴백 표시
    - Lottie 에러 시 GIF 폴백 → CSS 스피너 최종 폴백 체인 구현
    - _Requirements: 13.3_

- [ ] 12. 마스코트 에셋 기반 상태 화면 및 지도 마커 개편
  - [ ] 12.1 상태 화면 컴포넌트 마스코트 일러스트 적용
    - `EmptySearchOverlay`: 마스코트 일러스트 + 폴백 (기존 SearchIcon)
    - `EmptyFilterOverlay`: 마스코트 일러스트 + 폴백 (기존 FilterIcon)
    - `SpotErrorDisplay`: 마스코트 일러스트 + `accent-surface` 배경 + 폴백 (기존 AlertTriangleIcon)
    - `ErrorBoundary`: 마스코트 일러스트 + `primary` 버튼 + 폴백
    - 로딩 스피너: LottieLoader 컴포넌트 적용 + 폴백 체인
    - `public/mascot/` 디렉토리 생성 및 플레이스홀더 에셋 경로 설정 (실제 에셋은 추후 추가)
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [-] 12.2 SpotPin 지도 마커 마스코트 테마 적용
    - 마스코트 테마 커스텀 마커 에셋 적용 (에셋 미존재 시 기존 SVG divIcon 폴백)
    - 카테고리별 마커 색상을 토큰(`--category-*-bg/fg`) 참조로 변경
    - 2026-05-22: 에셋 미존재 상태에서 SpotPin/SpotMarkerLayer/SpotDetailMap 마커를 시맨틱 토큰 기반으로 우선 마이그레이션 완료
    - _Requirements: 12.1, 12.2, 12.4_

  - [ ] 12.3 CurrentLocationMarker 마스코트 에셋 적용
    - 마스코트 얼굴/SD 캐릭터 에셋 적용 (에셋 미존재 시 기존 파란 점 + 펄스 폴백)
    - _Requirements: 12.3_

  - [ ]* 12.4 Property 8 속성 테스트 — 카테고리별 마커 색상 분화
    - **Property 8: 카테고리별 마커 색상 분화**
    - 각 SpotCategory의 SpotPin 마커가 해당 카테고리의 토큰 색상을 사용하고, 서로 다른 카테고리의 마커가 시각적으로 구분 가능한지 검증
    - **Validates: Requirements 12.2**

- [ ] 13. 최종 Checkpoint — 전체 통합 검증
  - 모든 속성 테스트 및 단위 테스트 통과 확인
  - `npm run type-check` 및 `npm run build` 정상 확인
  - 사용자에게 질문 사항 확인

## Notes

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있음
- 각 태스크는 특정 요구사항을 참조하여 추적 가능
- 체크포인트에서 점진적 검증 수행
- 속성 테스트는 fast-check 라이브러리 사용 (이미 devDependencies에 포함)
- 마스코트 에셋(이미지, Lottie)은 추후 추가 예정 — 모든 에셋 사용처에 폴백 처리 필수
- CSS 변수에 RGB 숫자값만 저장하여 Tailwind 투명도 유틸리티(`bg-primary/50` 등) 지원
- 시맨틱 토큰의 중첩 `var()` 참조 문제는 Task 1.1에서 직접 RGB 값 저장 방식으로 해결
