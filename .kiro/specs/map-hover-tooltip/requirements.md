# Requirements Document

## Introduction

지도 위의 스팟 마커에 마우스를 올리면 (호버) 간단한 정보가 표시되는 툴팁 기능입니다. 사용자가 마커를 클릭하기 전에 스팟의 기본 정보를 빠르게 확인할 수 있어 UX를 개선합니다. 데스크톱에서는 마우스 호버, 모바일에서는 터치로 동작합니다.

## Glossary

- **Hover_Tooltip**: 마커에 마우스를 올렸을 때 표시되는 간단한 정보 팝업
- **SpotPin**: 지도 위에 표시되는 스팟 마커 컴포넌트
- **Tooltip_Content**: 툴팁에 표시되는 정보 (스팟 이름, 카테고리, 썸네일)
- **CATEGORY_CONFIG**: 카테고리별 아이콘, 색상, 라벨 설정 객체

## Requirements

### Requirement 1: 호버 툴팁 표시

**User Story:** As a 사용자, I want 지도 마커에 마우스를 올리면 스팟 정보를 미리 볼 수 있도록, so that 클릭하기 전에 어떤 스팟인지 빠르게 확인할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 SpotPin에 마우스를 올리면 THEN THE Hover_Tooltip SHALL 해당 스팟의 정보를 표시한다
2. WHEN Hover_Tooltip이 표시될 때 THEN THE Hover_Tooltip SHALL 스팟 이름을 포함한다
3. WHEN Hover_Tooltip이 표시될 때 THEN THE Hover_Tooltip SHALL 카테고리 아이콘과 라벨을 포함한다
4. WHEN 스팟에 썸네일 이미지가 있으면 THEN THE Hover_Tooltip SHALL 썸네일 이미지를 표시한다
5. IF 스팟에 썸네일 이미지가 없으면 THEN THE Hover_Tooltip SHALL 카테고리 아이콘을 대체 이미지로 표시한다

### Requirement 2: 툴팁 숨김 동작

**User Story:** As a 사용자, I want 마커에서 마우스가 벗어나면 툴팁이 사라지도록, so that 지도를 깔끔하게 볼 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 SpotPin에서 마우스를 벗어나면 THEN THE Hover_Tooltip SHALL 사라진다
2. WHEN 사용자가 SpotPin을 클릭하면 THEN THE Hover_Tooltip SHALL 사라지고 SpotPreview가 표시된다

### Requirement 3: 애니메이션 효과

**User Story:** As a 사용자, I want 툴팁이 부드럽게 나타나고 사라지도록, so that 시각적으로 자연스러운 경험을 할 수 있다.

#### Acceptance Criteria

1. WHEN Hover_Tooltip이 표시될 때 THEN THE Hover_Tooltip SHALL 페이드인 애니메이션으로 나타난다
2. WHEN Hover_Tooltip이 사라질 때 THEN THE Hover_Tooltip SHALL 페이드아웃 애니메이션으로 사라진다
3. THE Hover_Tooltip SHALL 애니메이션 지속 시간을 150ms 이내로 유지한다

### Requirement 4: 모바일 터치 지원

**User Story:** As a 모바일 사용자, I want 마커를 터치하면 툴팁을 볼 수 있도록, so that 모바일에서도 스팟 정보를 미리 확인할 수 있다.

#### Acceptance Criteria

1. WHEN 모바일 사용자가 SpotPin을 터치하면 THEN THE Hover_Tooltip SHALL 표시된다
2. WHEN 모바일 사용자가 다른 곳을 터치하면 THEN THE Hover_Tooltip SHALL 사라진다
3. WHEN 모바일 사용자가 같은 SpotPin을 다시 터치하면 THEN THE SpotPreview SHALL 표시된다

### Requirement 5: 툴팁 위치 및 스타일

**User Story:** As a 사용자, I want 툴팁이 마커 위에 적절히 위치하도록, so that 다른 마커나 지도 요소를 가리지 않는다.

#### Acceptance Criteria

1. THE Hover_Tooltip SHALL 마커 위쪽에 위치한다
2. THE Hover_Tooltip SHALL 마커와 시각적으로 연결되어 보이도록 화살표 또는 꼬리를 포함한다
3. THE Hover_Tooltip SHALL 다른 마커보다 높은 z-index를 가진다
4. THE Hover_Tooltip SHALL 프로젝트의 navy 테마 색상을 사용한다
