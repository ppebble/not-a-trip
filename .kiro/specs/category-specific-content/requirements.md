# Requirements Document: 카테고리별 콘텐츠 섹션

## Introduction

스팟 상세 페이지에서 카테고리에 따라 적합한 콘텐츠 섹션을 표시합니다. 애니메이션/영화/드라마는 "작품 속 장면" 섹션이 적합하지만, 스포츠/음악 카테고리는 경기 일정이나 공연 정보가 더 유용합니다.

## Glossary

- **Scene_Section**: 작품 속 장면을 보여주는 섹션 (애니메이션, 영화/드라마용)
- **Event_Section**: 경기/공연 일정 및 예매 정보를 보여주는 섹션 (스포츠, 음악용)
- **External_Link**: 외부 사이트(공식 홈페이지, 예매 사이트)로 연결되는 링크

## Requirements

### Requirement 1: 카테고리별 콘텐츠 섹션 분기

**User Story:** As a User, I want to see relevant content based on the spot category, so that I can get useful information for my visit.

#### Acceptance Criteria

1. WHEN viewing a spot with category `animation` or `movie_drama`, THE System SHALL display the "작품 속 장면" (Scene) section
2. WHEN viewing a spot with category `sports` or `music`, THE System SHALL display the "이벤트 정보" (Event) section
3. WHEN viewing a spot with category `game`, THE System SHALL display both Scene section (게임 장면) and Event section (e스포츠 경기)
4. WHEN viewing a spot with category `other`, THE System SHALL display a generic information section

### Requirement 2: 외부 링크 시스템

**User Story:** As a User, I want quick access to official sites and ticket booking, so that I can easily plan my visit.

#### Acceptance Criteria

1. THE Spot model SHALL support an `externalLinks` field for storing external URLs
2. THE External_Link SHALL include: type (ticket/schedule/official), label, url
3. WHEN a spot has external links, THE System SHALL display them as clickable buttons/cards
4. THE External_Link buttons SHALL open in a new tab

### Requirement 3: 이벤트 정보 섹션 (스포츠/음악)

**User Story:** As a sports/music fan, I want to see upcoming events and ticket information, so that I can plan my pilgrimage around events.

#### Acceptance Criteria

1. THE Event_Section SHALL display external links to official schedule pages
2. THE Event_Section SHALL display external links to ticket booking sites
3. THE Event_Section SHALL be editable by spot authors (add/remove links)
4. THE System SHALL validate that external URLs are valid before saving

### Requirement 4: 스팟 등록/수정 시 외부 링크 관리

**User Story:** As a spot author, I want to add helpful external links, so that visitors can easily access official information.

#### Acceptance Criteria

1. THE Spot registration form SHALL include an "외부 링크" section for sports/music categories
2. THE User SHALL be able to add multiple external links with type, label, and URL
3. THE User SHALL be able to remove existing external links
4. THE System SHALL provide preset link types: 공식 홈페이지, 티켓 예매, 경기/공연 일정, SNS

### Requirement 5: 카테고리별 UI 차별화

**User Story:** As a User, I want the spot detail page to feel tailored to the category, so that the experience matches my interest.

#### Acceptance Criteria

1. THE Scene_Section header SHALL display "작품 속 장면" for animation/movie_drama
2. THE Event_Section header SHALL display "경기 일정" for sports, "공연 정보" for music
3. THE Section icons SHALL match the category (🎬 for scenes, ⚽/🎵 for events)
4. IF no content exists for a section, THE System SHALL display a helpful empty state message
