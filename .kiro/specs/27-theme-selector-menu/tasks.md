# Implementation Plan: Theme Selector Menu

## Overview

기존 `ThemeToggle` 컴포넌트의 순환 방식 테마 전환을 드롭다운 메뉴 방식의 `ThemeSelector`로 리팩토링한다. `DirectionsButton.tsx`의 드롭다운 패턴(useState + useRef + useEffect mousedown 리스너)을 참고하여 구현하며, `THEME_OPTIONS` 상수 배열, 외부 클릭/Escape 키 닫기, 활성 테마 시각적 표시, 접근성 속성을 포함한다.

각 Task는 독립적인 Issue → 브랜치 → 구현 → PR → 머지 단위로 실행된다.

## Tasks

- [x] 1. ThemeSelector 컴포넌트 구현
  - [x] 1.1 `src/components/common/ThemeToggle.tsx`를 ThemeSelector 드롭다운 메뉴로 리팩토링
    - `ThemeOption` 인터페이스 정의 (`value`, `label`, `iconName`)
    - `THEME_OPTIONS` 상수 배열 정의 (light: 라이트 모드/light-mode, dark: 다크 모드/dark-mode, system: 시스템 설정/settings)
    - `isOpen` 상태 추가 (useState)
    - `useRef<HTMLDivElement>` + `useEffect` mousedown 리스너로 외부 클릭 감지 (DirectionsButton 패턴 참고)
    - `useEffect` keydown 리스너로 Escape 키 감지
    - 메뉴 옵션 클릭 시 `setTheme(선택값)` 호출 + `isOpen = false`
    - 활성 테마 시각적 표시 (체크마크 아이콘 또는 배경색 하이라이트)
    - 접근성 속성: 버튼에 `aria-expanded`, `aria-haspopup`, `aria-label` / 메뉴에 `role="menu"`, `aria-label="테마 선택"` / 옵션에 `role="menuitem"`
    - 하이드레이션 안전성 유지 (`mounted` 상태, 마운트 전 플레이스홀더 렌더링)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2_

  - [x] 1.2 Property 1 테스트 작성: 토글 상태 반전 및 aria-expanded 동기화
    - **Property 1: 토글 상태 반전 및 aria-expanded 동기화**
    - `fc.boolean()`으로 임의의 초기 isOpen 상태 생성, 토글 후 상태 반전 및 `aria-expanded` 일치 검증
    - **Validates: Requirements 1.1, 5.1**

  - [x] 1.3 Property 2 테스트 작성: 테마-아이콘-레이블 매핑 일관성
    - **Property 2: 테마-아이콘-레이블 매핑 일관성**
    - `fc.constantFrom('light', 'dark', 'system')`으로 임의의 테마 값 생성, `getIcon`/`getLabel` 매핑 결과 및 `aria-label` 포함 검증
    - **Validates: Requirements 2.3, 5.4**

  - [x] 1.4 Property 3 테스트 작성: 활성 테마 표시 정확성
    - **Property 3: 활성 테마 표시 정확성**
    - `fc.constantFrom('light', 'dark', 'system')`으로 임의의 테마 값 생성, 메뉴 열림 시 정확히 하나의 옵션만 활성 스타일 적용 확인
    - **Validates: Requirements 3.1, 3.2**

- [x] 2. import 경로 업데이트
  - [x] 2.1 `src/components/common/index.ts`에서 `ThemeToggle` export를 `ThemeSelector`로 변경
    - `export { ThemeToggle } from './ThemeToggle'` → `export { ThemeSelector } from './ThemeToggle'`
    - _Requirements: 1.1_

  - [x] 2.2 `src/components/layout/Header.tsx`에서 import 및 사용처 변경
    - `import { ThemeToggle }` → `import { ThemeSelector }`
    - JSX에서 `<ThemeToggle />` → `<ThemeSelector />`
    - _Requirements: 1.1_

- [x] 3. Checkpoint — 사용자 검증
  - 모든 테스트 통과 확인 (`npm run type-check`)
  - 사용자에게 변경사항 검증 요청:
    - 테마 버튼 클릭 시 드롭다운 메뉴 표시 확인
    - Light / Dark / System 옵션 선택 시 테마 즉시 적용 확인
    - 현재 활성 테마 시각적 구분 확인
    - 외부 클릭 및 Escape 키로 메뉴 닫힘 확인
    - 스크린 리더 접근성 속성 확인
  - 문제 발생 시 사용자와 논의

## Notes

- `*` 표시된 Task는 선택사항이며 빠른 구현을 위해 건너뛸 수 있음
- 변경 파일: `src/components/common/ThemeToggle.tsx`, `src/components/common/index.ts`, `src/components/layout/Header.tsx`
- 테스트 파일: `src/components/common/__tests__/ThemeSelector.test.tsx`
- PBT 라이브러리: `fast-check` (프로젝트에 이미 설치됨)
- 파일명은 `ThemeToggle.tsx`를 유지하되, 컴포넌트 이름만 `ThemeSelector`로 변경
- `DirectionsButton.tsx`의 드롭다운 패턴을 참고하여 일관된 UX 제공
