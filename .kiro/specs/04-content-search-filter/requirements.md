# Requirements Document

## Introduction

이 문서는 Not a Trip 플랫폼에 콘텐츠 검색 필터 기능을 추가하기 위한 요구사항을 정의합니다. 사용자가 작품명(애니메이션 제목, 영화/드라마 제목), 구단명(스포츠 팀), 아티스트명 등을 직접 검색하여 관련 스팟을 필터링할 수 있는 기능입니다. 기존 카테고리 필터와 함께 사용하여 더 정밀한 스팟 탐색이 가능합니다.

## Glossary

- **Search_Input**: 사용자가 검색어를 입력하는 텍스트 입력 컴포넌트
- **Autocomplete_Dropdown**: 검색어 입력 시 표시되는 자동완성 제안 목록
- **Content_Name**: relatedContent.name 필드에 저장된 작품명, 구단명, 아티스트명 등
- **Search_Filter**: 검색어 기반으로 스팟을 필터링하는 기능
- **Filter_Store**: 필터 상태를 관리하는 Zustand 스토어
- **Spot_API**: 스팟 데이터를 조회하는 백엔드 API

## Requirements

### Requirement 1: 검색 입력 UI

**User Story:** As a 사용자, I want to 검색창에 작품명이나 팀명을 입력, so that I can 관련 스팟을 빠르게 찾을 수 있다.

#### Acceptance Criteria

1. THE Search_Input SHALL 지도 상단 필터 영역에 카테고리 필터와 함께 표시된다
2. WHEN 사용자가 Search_Input에 포커스하면 THE Search_Input SHALL 플레이스홀더 텍스트를 표시한다
3. WHEN 사용자가 검색어를 입력하면 THE Search_Input SHALL 입력값을 실시간으로 반영한다
4. THE Search_Input SHALL 검색어 초기화 버튼(X)을 제공한다
5. WHEN 초기화 버튼을 클릭하면 THE Search_Input SHALL 검색어를 비우고 필터를 해제한다

### Requirement 2: 자동완성 기능

**User Story:** As a 사용자, I want to 검색어 입력 시 자동완성 제안을 받고 싶다, so that I can 정확한 콘텐츠명을 쉽게 선택할 수 있다.

#### Acceptance Criteria

1. WHEN 사용자가 2글자 이상 입력하면 THE Autocomplete_Dropdown SHALL 매칭되는 Content_Name 목록을 표시한다
2. THE Autocomplete_Dropdown SHALL 최대 10개의 제안 항목을 표시한다
3. WHEN 제안 항목을 클릭하면 THE Search_Input SHALL 해당 Content_Name으로 채워진다
4. WHEN 제안 항목을 클릭하면 THE Search_Filter SHALL 즉시 적용된다
5. WHEN 매칭되는 결과가 없으면 THE Autocomplete_Dropdown SHALL "검색 결과 없음" 메시지를 표시한다
6. THE Autocomplete_Dropdown SHALL 각 제안 항목에 해당 카테고리 아이콘을 표시한다
7. WHEN Search_Input 외부를 클릭하면 THE Autocomplete_Dropdown SHALL 닫힌다

### Requirement 3: 검색 필터링 로직

**User Story:** As a 사용자, I want to 검색어로 스팟을 필터링하고 싶다, so that I can 특정 작품이나 팀 관련 장소만 볼 수 있다.

#### Acceptance Criteria

1. WHEN 검색어가 적용되면 THE Spot_API SHALL relatedContent.name 필드에서 부분 일치 검색을 수행한다
2. THE Search_Filter SHALL 대소문자를 구분하지 않고 검색한다
3. WHEN 검색 결과가 있으면 THE 지도 SHALL 필터링된 스팟만 표시한다
4. WHEN 검색 결과가 없으면 THE 지도 SHALL 빈 상태 메시지를 표시한다
5. THE Search_Filter SHALL 카테고리 필터와 AND 조건으로 결합된다

### Requirement 4: 필터 상태 관리

**User Story:** As a 개발자, I want to 검색 필터 상태를 전역으로 관리하고 싶다, so that I can 여러 컴포넌트에서 일관된 필터 상태를 사용할 수 있다.

#### Acceptance Criteria

1. THE Filter_Store SHALL 검색어 상태를 저장한다
2. THE Filter_Store SHALL 검색어 설정, 초기화 액션을 제공한다
3. WHEN 검색어가 변경되면 THE Filter_Store SHALL 구독 중인 컴포넌트에 변경을 알린다
4. THE Filter_Store SHALL 카테고리 필터와 검색 필터를 독립적으로 관리한다

### Requirement 5: 자동완성 데이터 조회

**User Story:** As a 시스템, I want to 자동완성용 콘텐츠명 목록을 효율적으로 조회하고 싶다, so that I can 빠른 응답 속도를 제공할 수 있다.

#### Acceptance Criteria

1. THE Spot_API SHALL 자동완성용 콘텐츠명 목록 조회 엔드포인트를 제공한다
2. WHEN 자동완성 API를 호출하면 THE Spot_API SHALL 중복 제거된 Content_Name 목록을 반환한다
3. THE Spot_API SHALL 각 Content_Name에 해당 카테고리 정보를 포함하여 반환한다
4. THE Spot_API SHALL 검색어 파라미터로 서버 사이드 필터링을 지원한다

### Requirement 6: 검색 필터 API 통합

**User Story:** As a 시스템, I want to 기존 스팟 조회 API에 검색 필터를 통합하고 싶다, so that I can 카테고리와 검색어를 함께 필터링할 수 있다.

#### Acceptance Criteria

1. THE Spot_API SHALL 검색어 쿼리 파라미터(search)를 지원한다
2. WHEN search 파라미터가 제공되면 THE Spot_API SHALL relatedContent.name에서 부분 일치 검색을 수행한다
3. WHEN category와 search 파라미터가 함께 제공되면 THE Spot_API SHALL 두 조건을 AND로 결합한다
4. IF 검색어가 빈 문자열이면 THEN THE Spot_API SHALL 검색 필터를 적용하지 않는다
