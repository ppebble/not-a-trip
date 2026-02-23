# Requirements Document

## Introduction

커뮤니티 페이지를 사진 기반 갤러리로 전면 개편하는 기능입니다. 기존 텍스트 중심의 게시판 형태에서 인스타그램/Pinterest 스타일의 시각적 그리드 레이아웃으로 변경하여, 순례 인증샷이 주인공이 되는 갤러리 경험을 제공합니다.

## Glossary

- **Gallery_System**: 순례 갤러리 전체 시스템으로, 인증샷 피드, 탭 네비게이션, 인증 등록 플로우를 포함
- **Masonry_Grid**: Pinterest 스타일의 불규칙한 높이를 가진 카드들이 빈틈없이 배치되는 그리드 레이아웃
- **Comparison_Card**: 작품 원본 캡처와 유저 인증샷을 함께 보여주는 카드 컴포넌트
- **Check_In**: 유저가 특정 스팟을 방문하고 사진을 업로드하여 인증하는 행위
- **Feed_Tab**: 실시간 피드, 인기/명예의 전당, 작품별 탐색 등 갤러리의 탭 구분
- **Spot_Search_Modal**: 순례 인증 시 방문한 스팟을 검색하고 선택하는 모달 컴포넌트

## Requirements

### Requirement 1: GNB 명칭 변경

**User Story:** As a 사용자, I want GNB에서 '커뮤니티' 대신 '순례 갤러리'라는 명칭을 보고 싶다, so that 이 공간이 사진을 구경하고 기록을 보는 곳임을 직관적으로 이해할 수 있다.

#### Acceptance Criteria

1. THE Header_Component SHALL display "순례 갤러리" instead of "커뮤니티" in the navigation menu
2. WHEN a user clicks the "순례 갤러리" navigation link, THE Gallery_System SHALL navigate to the gallery page at `/gallery` route
3. THE Gallery_System SHALL redirect requests from `/community` to `/gallery` for backward compatibility

### Requirement 2: Masonry 그리드 레이아웃

**User Story:** As a 사용자, I want 인증샷들을 Pinterest 스타일의 시각적 그리드로 보고 싶다, so that 다양한 순례 인증샷을 한눈에 탐색할 수 있다.

#### Acceptance Criteria

1. THE Gallery_System SHALL display check-in photos in a Masonry_Grid layout with responsive columns (2 columns on mobile, 3 on tablet, 4 on desktop)
2. WHEN displaying a Comparison_Card, THE Gallery_System SHALL show the anime/drama scene capture alongside the user's photo using a split view or slider
3. THE Comparison_Card SHALL display user nickname, visited spot name, and earned badge icons at the bottom
4. WHEN a user hovers over a Comparison_Card, THE Gallery_System SHALL show a subtle scale animation and overlay with additional details
5. THE Gallery_System SHALL implement infinite scroll to load more check-ins as the user scrolls down

### Requirement 3: 탭 구조 재편

**User Story:** As a 사용자, I want 실시간 피드, 인기 콘텐츠, 작품별 탐색을 탭으로 구분하여 보고 싶다, so that 원하는 방식으로 인증샷을 탐색할 수 있다.

#### Acceptance Criteria

1. THE Gallery_System SHALL provide three main tabs: "실시간 피드" (default), "명예의 전당", and "작품별"
2. WHEN the "실시간 피드" tab is active, THE Gallery_System SHALL display check-ins sorted by most recent first
3. WHEN the "명예의 전당" tab is active, THE Gallery_System SHALL display this week's most checked-in spots and most liked check-ins as a ranking
4. WHEN the "작품별" tab is active, THE Gallery_System SHALL display content posters as large cards in a grid layout
5. WHEN a user clicks a content poster card, THE Gallery_System SHALL filter and display only check-ins related to that content
6. THE Gallery_System SHALL remove the notice/announcement section from the main tabs and relocate it to footer or user profile area

### Requirement 4: 순례 인증하기 버튼 및 플로우

**User Story:** As a 사용자, I want "+ 순례 인증하기" 버튼을 통해 방문한 스팟을 선택하고 사진을 업로드하고 싶다, so that 모든 인증 데이터가 스팟에 연결되어 체계적으로 관리된다.

#### Acceptance Criteria

1. THE Gallery_System SHALL display a floating "+ 순례 인증하기" button instead of "+ 글쓰기"
2. WHEN a user clicks the "+ 순례 인증하기" button, THE Gallery_System SHALL open a Spot_Search_Modal with the prompt "어떤 스팟을 다녀오셨나요?"
3. THE Spot_Search_Modal SHALL provide search functionality to find spots by name or related content title
4. WHEN a user selects a spot from the search results, THE Gallery_System SHALL proceed to the photo upload step
5. WHEN uploading a photo, THE Gallery_System SHALL allow the user to optionally select a scene image from the spot for comparison
6. IF a user is not authenticated, THEN THE Gallery_System SHALL redirect to the login page before opening the Spot_Search_Modal

### Requirement 5: 페이지 헤더 변경

**User Story:** As a 사용자, I want 갤러리 페이지 헤더에서 순례 인증 현황을 직관적으로 파악하고 싶다, so that 이 공간의 목적을 명확히 이해할 수 있다.

#### Acceptance Criteria

1. THE Gallery_System SHALL display "순례 갤러리" as the page title
2. THE Gallery_System SHALL display "오타쿠들의 발자취" or "실시간 순례 인증 현황" as the page subtitle
3. THE Gallery_System SHALL display total check-in count and today's check-in count in the header area

### Requirement 6: 기존 데이터 호환성

**User Story:** As a 시스템, I want 기존 체크인 데이터와 컴포넌트를 재활용하고 싶다, so that 개발 효율성을 높이고 데이터 일관성을 유지할 수 있다.

#### Acceptance Criteria

1. THE Gallery_System SHALL use the existing CheckIn data model and API endpoints
2. THE Gallery_System SHALL integrate with the existing ComparisonViewer component for scene comparison display
3. THE Gallery_System SHALL integrate with the existing CheckInGallery component's data fetching logic
4. WHEN displaying check-ins, THE Gallery_System SHALL show badge information from the existing badge system
