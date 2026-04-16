# Requirements Document

## Introduction

현재 ThemeToggle 컴포넌트는 버튼 클릭 시 system → light → dark 순서로 순환하는 방식으로 테마를 전환한다. 이를 DirectionsButton과 유사한 드롭다운 메뉴 방식으로 변경하여, 사용자가 Light / Dark / System 중 원하는 테마를 직접 선택할 수 있도록 한다. 현재 선택된 테마는 시각적으로 구분되어야 하며, 메뉴 외부 클릭 시 닫히는 동작을 지원한다.

## Glossary

- **Theme_Selector**: 테마 선택 드롭다운 메뉴를 포함하는 React 컴포넌트 (`src/components/common/ThemeToggle.tsx`를 대체)
- **Theme_Menu**: 테마 선택 버튼 클릭 시 표시되는 드롭다운 메뉴 UI
- **Theme_Option**: Theme_Menu 내의 개별 테마 선택 항목 (Light, Dark, System)
- **Active_Theme**: 현재 사용자가 선택한 테마 값 (`light`, `dark`, `system` 중 하나)
- **next-themes**: Next.js 환경에서 테마 전환을 관리하는 라이브러리 (`useTheme` hook 제공)
- **AppIcon**: 프로젝트 내 아이콘을 표시하는 공통 컴포넌트 (`src/components/common/AppIcon.tsx`)
- **ThemeProvider**: `next-themes`의 ThemeProvider로, `attribute="class"`, `defaultTheme="system"`, `enableSystem` 옵션으로 설정됨 (`src/lib/providers.tsx`)

## Requirements

### Requirement 1: 테마 선택 드롭다운 메뉴 표시

**User Story:** As a 사용자, I want 테마 전환 버튼을 클릭했을 때 Light / Dark / System 옵션이 포함된 드롭다운 메뉴가 표시되길 원한다, so that 순환 방식이 아닌 원하는 테마를 직접 선택할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 테마 버튼을 클릭할 때, THE Theme_Selector SHALL Theme_Menu를 토글하여 표시한다
2. THE Theme_Menu SHALL Light, Dark, System 세 가지 Theme_Option을 포함한다
3. THE Theme_Menu SHALL 각 Theme_Option에 해당 테마를 나타내는 AppIcon을 표시한다 (Light: `light-mode`, Dark: `dark-mode`, System: `settings`)
4. THE Theme_Menu SHALL 각 Theme_Option에 한글 레이블을 표시한다 (Light: "라이트 모드", Dark: "다크 모드", System: "시스템 설정")
5. THE Theme_Menu SHALL 테마 버튼 기준으로 위치가 정렬된 드롭다운 형태로 표시한다

### Requirement 2: 테마 선택 및 적용

**User Story:** As a 사용자, I want 드롭다운 메뉴에서 테마를 선택하면 즉시 적용되길 원한다, so that 선택한 테마로 화면이 바로 전환된다.

#### Acceptance Criteria

1. WHEN 사용자가 Theme_Option을 클릭할 때, THE Theme_Selector SHALL next-themes의 `setTheme` 함수를 호출하여 선택한 테마를 적용한다
2. WHEN 사용자가 Theme_Option을 클릭할 때, THE Theme_Menu SHALL 닫힌다
3. THE Theme_Selector SHALL 테마 변경 후에도 테마 버튼의 아이콘을 Active_Theme에 맞게 업데이트한다

### Requirement 3: 현재 선택된 테마 시각적 표시

**User Story:** As a 사용자, I want 드롭다운 메뉴에서 현재 적용 중인 테마가 시각적으로 구분되길 원한다, so that 현재 어떤 테마가 활성화되어 있는지 쉽게 확인할 수 있다.

#### Acceptance Criteria

1. WHILE Theme_Menu가 열려 있을 때, THE Theme_Selector SHALL Active_Theme에 해당하는 Theme_Option을 체크마크 아이콘 또는 배경색 하이라이트로 시각적으로 구분한다
2. WHEN Active_Theme가 변경될 때, THE Theme_Selector SHALL 시각적 표시를 새로운 Active_Theme에 맞게 업데이트한다

### Requirement 4: 메뉴 외부 클릭 시 닫기

**User Story:** As a 사용자, I want 드롭다운 메뉴 외부를 클릭하면 메뉴가 닫히길 원한다, so that 다른 작업을 할 때 메뉴가 방해되지 않는다.

#### Acceptance Criteria

1. WHEN 사용자가 Theme_Menu 외부 영역을 클릭할 때, THE Theme_Selector SHALL Theme_Menu를 닫는다
2. WHEN 사용자가 Escape 키를 누를 때, THE Theme_Selector SHALL Theme_Menu를 닫는다
3. THE Theme_Selector SHALL 외부 클릭 감지를 위해 `mousedown` 이벤트 리스너를 사용하고, 컴포넌트 언마운트 시 리스너를 정리한다

### Requirement 5: 접근성 지원

**User Story:** As a 스크린 리더 사용자, I want 테마 선택 메뉴가 접근성 표준을 준수하길 원한다, so that 보조 기술을 사용하여 테마를 변경할 수 있다.

#### Acceptance Criteria

1. THE Theme_Selector SHALL 테마 버튼에 `aria-expanded` 속성을 포함하여 메뉴 열림/닫힘 상태를 전달한다
2. THE Theme_Selector SHALL 테마 버튼에 `aria-haspopup` 속성을 포함한다
3. THE Theme_Menu SHALL `role="menu"` 속성을 포함하고, 각 Theme_Option은 `role="menuitem"` 속성을 포함한다
4. THE Theme_Selector SHALL 테마 버튼에 현재 테마 상태를 포함하는 `aria-label`을 제공한다 (예: "현재: 다크 모드. 클릭하여 테마 선택")
5. THE Theme_Menu SHALL `aria-label="테마 선택"` 속성을 포함한다

### Requirement 6: 하이드레이션 안전성

**User Story:** As a 개발자, I want 서버 사이드 렌더링과 클라이언트 하이드레이션 간 불일치가 발생하지 않길 원한다, so that 콘솔 경고 없이 안정적으로 동작한다.

#### Acceptance Criteria

1. THE Theme_Selector SHALL 클라이언트 마운트 전까지 테마 관련 UI를 렌더링하지 않고 동일한 크기의 플레이스홀더를 표시한다
2. WHEN 컴포넌트가 마운트된 후, THE Theme_Selector SHALL `useTheme` hook에서 제공하는 `theme` 값을 기반으로 UI를 렌더링한다
