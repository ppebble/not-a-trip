# Requirements Document

## Introduction

국내 스팟에서 카카오맵, 네이버 지도 길찾기 클릭 시 빈 페이지로 이동하는 문제를 수정한다. 현재 `directions.ts`에서 카카오맵은 `kakaomap://` URL scheme, 네이버 지도는 `nmap://` URL scheme을 사용하고 있어 앱이 설치되지 않은 웹 브라우저 환경에서는 빈 페이지가 표시된다. 이를 웹에서도 동작하는 Universal Link(웹 URL)로 변경하고, DirectionsButton에서 이모지(🟡, 🟢) 대신 실제 카카오맵/네이버 지도 아이콘으로 교체한다.

## Glossary

- **Directions_Utility**: 플랫폼별 지도 앱 URL을 생성하는 유틸리티 모듈 (`src/lib/directions.ts`)
- **DirectionsButton**: 스팟 상세 페이지에서 길찾기 기능을 제공하는 React 컴포넌트 (`src/components/common/DirectionsButton.tsx`)
- **Kakao_Web_URL**: 카카오맵 웹 길찾기 URL 형식 (`https://map.kakao.com/link/to/{name},{lat},{lng}`)
- **Naver_Web_URL**: 네이버 지도 웹 길찾기 URL 형식 (`https://map.naver.com/v5/directions/-/-/-/walk?c={lng},{lat},15,0,0,0,dh`)
- **Map_Selection_Menu**: 길찾기 버튼 클릭 시 표시되는 지도 앱 선택 드롭다운 메뉴
- **AppIcon**: 프로젝트 내 아이콘을 표시하는 공통 컴포넌트 (`src/components/common/AppIcon.tsx`)
- **Map_App_Icon**: 카카오맵, 네이버 지도 등 외부 지도 앱을 나타내는 아이콘 이미지 에셋

## Requirements

### Requirement 1: 카카오맵 URL을 웹 URL로 변경

**User Story:** As a 사용자, I want 국내 스팟에서 카카오맵 길찾기를 클릭했을 때 웹 브라우저에서도 정상적으로 카카오맵 페이지가 열리길 원한다, so that 카카오맵 앱이 설치되지 않은 환경에서도 길찾기를 사용할 수 있다.

#### Acceptance Criteria

1. THE Directions_Utility SHALL generate the Kakao_Web_URL in the format `https://map.kakao.com/link/to/{name},{lat},{lng}` for 카카오맵 길찾기
2. WHEN a destination name is provided, THE Directions_Utility SHALL include the destination name in the Kakao_Web_URL
3. WHEN a destination name is not provided, THE Directions_Utility SHALL use an empty string as the destination name in the Kakao_Web_URL
4. THE Directions_Utility SHALL NOT use the `kakaomap://` URL scheme for 카카오맵 길찾기

### Requirement 2: 네이버 지도 URL을 웹 URL로 변경

**User Story:** As a 사용자, I want 국내 스팟에서 네이버 지도 길찾기를 클릭했을 때 웹 브라우저에서도 정상적으로 네이버 지도 페이지가 열리길 원한다, so that 네이버 지도 앱이 설치되지 않은 환경에서도 길찾기를 사용할 수 있다.

#### Acceptance Criteria

1. THE Directions_Utility SHALL generate the Naver_Web_URL in the format `https://map.naver.com/v5/directions/-/-/-/walk?c={lng},{lat},15,0,0,0,dh` for 네이버 지도 길찾기
2. WHEN coordinates are provided, THE Directions_Utility SHALL include the longitude and latitude values in the Naver_Web_URL
3. THE Directions_Utility SHALL NOT use the `nmap://` URL scheme for 네이버 지도 길찾기

### Requirement 3: URL 생성 정확성

**User Story:** As a 개발자, I want 생성된 카카오맵/네이버 지도 URL이 올바른 형식을 갖추길 원한다, so that 사용자가 클릭했을 때 정확한 목적지로 안내받을 수 있다.

#### Acceptance Criteria

1. FOR ALL valid coordinate pairs and destination names, THE Directions_Utility SHALL generate a Kakao_Web_URL that contains the provided latitude and longitude values
2. FOR ALL valid coordinate pairs, THE Directions_Utility SHALL generate a Naver_Web_URL that contains the provided longitude and latitude values
3. FOR ALL valid coordinate pairs and destination names, generating the URL then parsing the URL components SHALL produce values matching the original coordinates (round-trip property)
4. WHEN special characters are included in the destination name, THE Directions_Utility SHALL encode the destination name for the Kakao_Web_URL

### Requirement 4: 카카오맵 아이콘 추가

**User Story:** As a 사용자, I want Map_Selection_Menu에서 카카오맵 옵션에 실제 카카오맵 아이콘이 표시되길 원한다, so that 이모지 대신 직관적인 브랜드 아이콘으로 지도 앱을 구분할 수 있다.

#### Acceptance Criteria

1. THE DirectionsButton SHALL display a Map_App_Icon for 카카오맵 instead of the '🟡' emoji in the Map_Selection_Menu
2. THE Map_App_Icon for 카카오맵 SHALL be an SVG or image asset stored in the project icon directory
3. THE Map_App_Icon for 카카오맵 SHALL be rendered at a size consistent with other icons in the Map_Selection_Menu

### Requirement 5: 네이버 지도 아이콘 추가

**User Story:** As a 사용자, I want Map_Selection_Menu에서 네이버 지도 옵션에 실제 네이버 지도 아이콘이 표시되길 원한다, so that 이모지 대신 직관적인 브랜드 아이콘으로 지도 앱을 구분할 수 있다.

#### Acceptance Criteria

1. THE DirectionsButton SHALL display a Map_App_Icon for 네이버 지도 instead of the '🟢' emoji in the Map_Selection_Menu
2. THE Map_App_Icon for 네이버 지도 SHALL be an SVG or image asset stored in the project icon directory
3. THE Map_App_Icon for 네이버 지도 SHALL be rendered at a size consistent with other icons in the Map_Selection_Menu

### Requirement 6: 기존 길찾기 기능 유지

**User Story:** As a 사용자, I want URL 변경 후에도 Google Maps와 Apple Maps 길찾기가 기존과 동일하게 동작하길 원한다, so that 다른 지도 앱 사용에 영향이 없다.

#### Acceptance Criteria

1. THE Directions_Utility SHALL continue to generate the Google Maps URL in the existing `https://www.google.com/maps/dir/` format
2. THE Directions_Utility SHALL continue to generate the Apple Maps URL in the existing `maps://` format
3. WHEN a user selects a map app from the Map_Selection_Menu, THE DirectionsButton SHALL open the selected map app URL in a new browser tab
