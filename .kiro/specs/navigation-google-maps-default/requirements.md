# Requirements Document

## Introduction

스팟 상세 페이지의 길찾기 기능을 개선한다. 현재는 해외 스팟(예: 가마쿠라코코마에역 건널목)에서도 카카오맵, 네이버 지도 옵션이 표시되지만, 해외에서는 이 두 서비스의 사용성이 없다. 해외 스팟의 경우 길찾기 버튼 클릭 시 선택 메뉴 없이 바로 구글맵으로 이동하도록 변경하고, 국내 스팟에 한해서만 구글맵/카카오맵/네이버지도 선택 메뉴를 표시한다.

## Glossary

- **DirectionsButton**: 스팟 상세 페이지에서 길찾기 기능을 제공하는 React 컴포넌트 (`src/components/common/DirectionsButton.tsx`)
- **Directions_Utility**: 플랫폼별 지도 앱 딥링크 URL을 생성하는 유틸리티 모듈 (`src/lib/directions.ts`)
- **Spot**: 사용자가 등록한 특별한 여행지 데이터. `coordinates` 필드에 `{ lat, lng }` 좌표를 포함
- **Korea_Boundary**: 대한민국 영토를 판별하기 위한 좌표 경계 범위 (위도 약 33°~39°, 경도 약 124°~132°)
- **Domestic_Spot**: 좌표가 Korea_Boundary 내에 위치하는 스팟 (국내 스팟)
- **Overseas_Spot**: 좌표가 Korea_Boundary 밖에 위치하는 스팟 (해외 스팟)
- **Map_Selection_Menu**: 길찾기 버튼 클릭 시 표시되는 지도 앱 선택 드롭다운 메뉴

## Requirements

### Requirement 1: 국내/해외 스팟 판별

**User Story:** As a 사용자, I want 스팟의 좌표를 기반으로 국내/해외를 자동 판별하여 적절한 길찾기 옵션을 제공받고 싶다, so that 해외 스팟에서 사용할 수 없는 지도 앱이 표시되지 않는다.

#### Acceptance Criteria

1. THE Directions_Utility SHALL provide a function that determines whether given coordinates fall within Korea_Boundary
2. WHEN coordinates with latitude between 33.0 and 38.7 and longitude between 124.5 and 132.0 are provided, THE Directions_Utility SHALL classify the Spot as a Domestic_Spot
3. WHEN coordinates outside the Korea_Boundary range are provided, THE Directions_Utility SHALL classify the Spot as an Overseas_Spot
4. THE Directions_Utility SHALL accept latitude and longitude as numeric parameters and return a boolean result indicating whether the coordinates are domestic

### Requirement 2: 해외 스팟 길찾기 동작

**User Story:** As a 사용자, I want 해외 스팟에서 길찾기 버튼을 누르면 바로 구글맵으로 이동하고 싶다, so that 불필요한 선택 단계 없이 빠르게 길찾기를 시작할 수 있다.

#### Acceptance Criteria

1. WHEN a user clicks the DirectionsButton for an Overseas_Spot, THE DirectionsButton SHALL open Google Maps directions in a new tab without displaying the Map_Selection_Menu
2. WHEN a user clicks the DirectionsButton for an Overseas_Spot, THE DirectionsButton SHALL pass the Spot coordinates and destination name to the Google Maps URL
3. THE DirectionsButton SHALL determine the Spot location type using the Korea_Boundary check before deciding the navigation behavior

### Requirement 3: 국내 스팟 길찾기 동작

**User Story:** As a 사용자, I want 국내 스팟에서 길찾기 버튼을 누르면 구글맵, 카카오맵, 네이버 지도 중 선택할 수 있다, so that 선호하는 지도 앱으로 길찾기를 할 수 있다.

#### Acceptance Criteria

1. WHEN a user clicks the DirectionsButton for a Domestic_Spot, THE DirectionsButton SHALL display the Map_Selection_Menu with Google Maps, 카카오맵, and 네이버 지도 options
2. WHILE the Map_Selection_Menu is displayed for a Domestic_Spot, THE DirectionsButton SHALL include Apple Maps option when the user platform is iOS
3. WHEN a user selects a map app from the Map_Selection_Menu, THE DirectionsButton SHALL open the selected map app with the correct directions URL and close the menu

### Requirement 4: 좌표 경계 판별 정확성

**User Story:** As a 개발자, I want 좌표 기반 국내/해외 판별이 한국의 주요 영토와 도서 지역을 정확히 포함하고 싶다, so that 제주도, 울릉도 등 도서 지역의 스팟도 국내로 올바르게 분류된다.

#### Acceptance Criteria

1. WHEN coordinates of Jeju Island (approximately lat 33.2~33.6, lng 126.1~126.9) are provided, THE Directions_Utility SHALL classify the Spot as a Domestic_Spot
2. WHEN coordinates of Ulleungdo (approximately lat 37.5, lng 130.9) are provided, THE Directions_Utility SHALL classify the Spot as a Domestic_Spot
3. WHEN coordinates of nearby overseas locations such as Fukuoka (lat 33.6, lng 130.4) or Tsushima (lat 34.4, lng 129.3) are provided, THE Directions_Utility SHALL classify the Spot as an Overseas_Spot
4. FOR ALL valid coordinate pairs, parsing the coordinates then checking the boundary then returning the result SHALL produce a consistent boolean output (round-trip property)
