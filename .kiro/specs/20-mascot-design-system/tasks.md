# 구현 계획: 마스코트 디자인 시스템

## 개요

Not a Trip의 Navy 기반 시맨틱 컬러 토큰과 카테고리/콘텐츠 타입별 색상 구성을 정리하고, 기존 하드코딩 색상을 CSS 변수와 Tailwind 토큰으로 전환한다. 지도 마커와 마스코트 표현은 동일한 색상 계약을 사용해 라이트/다크 모드에서도 일관된 대비를 유지한다.

## Tasks

- [x] 1. 시맨틱 컬러 토큰 정의
  - `globals.css`에 background, surface, accent-surface, text, muted, border, danger 계열 CSS 변수 정의
  - 카테고리 및 콘텐츠 타입별 bg/fg 토큰 정의
  - Tailwind 설정에서 `rgb(var(--...) / <alpha-value>)` 형태로 참조

- [x] 2. 색상 설정 타입 및 Config 정리
  - `SemanticColorRole`, `ColorShade`, `CategoryColorToken`, `CategoryConfig`, `ContentTypeConfig`, `LinkTypeConfig` 타입 정의
  - Config가 CSS 변수 이름과 UI 라벨을 함께 제공하도록 구성

- [x] 3. 기본 UI 색상 마이그레이션
  - body, 카드, 버튼, 링크, 배지, 바텀시트, 내비게이션의 slate/navy/blue 하드코딩을 시맨틱 토큰으로 교체
  - 기존 primary/secondary/neutral 역할을 명확히 분리

- [x] 4. 다크 모드 색상 정리
  - `@media (prefers-color-scheme: dark)`에서 동일 토큰 이름의 값만 교체
  - 주요 텍스트와 배경 조합이 WCAG AA 기준에 근접하도록 대비 조정

- [x] 5. 지도 마커와 카테고리 색상 통합
  - SpotPin, SpotMarkerLayer, SpotDetailMap에서 카테고리별 색상 토큰 사용
  - 클러스터/호버/선택 상태가 동일한 디자인 시스템을 따르도록 정리

- [ ] 6. 마스코트 자산 최종화
  - `public/mascot/`에 마스코트 자산을 배치하고 실제 UI 적용 지점을 확정
  - SVG 또는 Lottie 사용 여부는 자산 품질과 번들 크기 기준으로 결정

- [ ] 7. 잔여 하드코딩 색상 제거
  - `.tsx`, `.ts`, `.css`에서 `navy-*`, `slate-*`, `blue-*` 직접 사용을 재점검
  - 예외가 필요한 경우 주석으로 사유를 남김

## Verification

- `npm run type-check`
- 주요 랜딩/지도 화면 수동 확인
- 색상 토큰 변경 후 라이트/다크 모드 대비 확인
