# Requirements Document

## Introduction

사이트 전반에서 순례 인증 게시글(사진 카드)을 클릭했을 때 일관되게 "인증 상세 보기" 모달(`CheckInDetailModal`)이 열리도록 UX를 통일한다. 현재 스팟 상세의 `CheckInGallery`에서만 상세 모달이 동작하며, 갤러리 메인 피드·명예의 전당·콘텐츠별 피드·프로필 인증 갤러리에서는 클릭 시 아무 반응이 없거나 핸들러가 연결되지 않은 상태이다.

## Glossary

- **CheckIn_Card**: 인증 사진을 표시하는 클릭 가능한 UI 요소 (FeedGridItem, RankingList 인증 카드, CheckInGallery 카드 등)
- **CheckInDetailModal**: 인증 상세 정보를 표시하는 공통 모달 컴포넌트
- **Gallery_Page**: `/gallery` 라우트의 갤러리 메인 페이지 (실시간 피드, 명예의 전당, 콘텐츠별 탭 포함)
- **Feed_Tab**: 갤러리 페이지의 실시간 피드 탭
- **HallOfFame_Tab**: 갤러리 페이지의 명예의 전당 탭
- **Content_Tab**: 갤러리 페이지의 콘텐츠별 인증 피드 탭
- **Profile_Gallery**: 프로필 페이지의 인증 갤러리 섹션
- **Spot_Detail_Gallery**: 스팟 상세 페이지의 인증 갤러리 (기존 기준점)
- **CheckIn_API**: `/api/checkins/[id]` 엔드포인트로 단일 인증 데이터를 조회하는 API

## Requirements

### Requirement 1: checkInId 기반 단일 인증 조회 API

**User Story:** As a developer, I want to fetch a single check-in by its ID, so that screens with only checkInId can display the full detail modal.

#### Acceptance Criteria

1. WHEN a GET request is made to `/api/checkins/[id]` with a valid checkInId, THE CheckIn_API SHALL return the full CheckIn object including photoUrl, sceneImageUrl, userName, userImage, visitedAt, comment, likeCount, spotId, contentName, and relationId
2. WHEN a GET request is made to `/api/checkins/[id]` with a non-existent checkInId, THE CheckIn_API SHALL return a 404 status with an error message
3. WHEN a GET request is made to `/api/checkins/[id]` with an invalid format, THE CheckIn_API SHALL return a 400 status with a validation error message

### Requirement 2: CheckInDetailModal의 checkInId 기반 로딩 지원

**User Story:** As a developer, I want CheckInDetailModal to accept either a full CheckIn object or just a checkInId, so that all screens can open the modal regardless of available data.

#### Acceptance Criteria

1. WHEN a full CheckIn object is provided, THE CheckInDetailModal SHALL render immediately without additional API calls
2. WHEN only a checkInId is provided, THE CheckInDetailModal SHALL fetch the CheckIn data from CheckIn_API and display a loading state during the request
3. IF the fetch fails when loading by checkInId, THEN THE CheckInDetailModal SHALL display an error message with a retry option
4. THE CheckInDetailModal SHALL display the check-in photo, author info, visit date, comment, like count, related spot link, related content link, and related course links

### Requirement 3: 갤러리 실시간 피드 탭 클릭 인터랙션

**User Story:** As a user, I want to click a check-in photo in the gallery feed to see its details, so that I can view full information without navigating away.

#### Acceptance Criteria

1. WHEN a user clicks a CheckIn_Card in Feed_Tab, THE Gallery_Page SHALL open CheckInDetailModal with the selected CheckIn data
2. WHEN a user presses Enter or Space on a focused CheckIn_Card in Feed_Tab, THE Gallery_Page SHALL open CheckInDetailModal with the selected CheckIn data
3. WHILE CheckInDetailModal is open, THE Gallery_Page SHALL close the modal when the user clicks the backdrop or the close button
4. THE Feed_Tab SHALL display cursor-pointer and a visual hover effect on each CheckIn_Card

### Requirement 4: 갤러리 콘텐츠별 피드 탭 클릭 인터랙션

**User Story:** As a user, I want to click a check-in photo in the content-specific feed to see its details, so that I can view full information about content-related check-ins.

#### Acceptance Criteria

1. WHEN a user clicks a CheckIn_Card in Content_Tab filtered feed, THE Gallery_Page SHALL open CheckInDetailModal with the selected CheckIn data
2. WHEN a user presses Enter or Space on a focused CheckIn_Card in Content_Tab, THE Gallery_Page SHALL open CheckInDetailModal with the selected CheckIn data
3. WHILE CheckInDetailModal is open, THE Gallery_Page SHALL close the modal when the user clicks the backdrop or the close button

### Requirement 5: 명예의 전당 인기 인증 클릭 인터랙션

**User Story:** As a user, I want to click a popular check-in photo in the Hall of Fame to see its details, so that I can learn more about trending check-ins.

#### Acceptance Criteria

1. WHEN a user clicks a CheckIn_Card in HallOfFame_Tab check-in ranking section, THE Gallery_Page SHALL open CheckInDetailModal using the checkInId
2. WHEN a user presses Enter or Space on a focused CheckIn_Card in HallOfFame_Tab, THE Gallery_Page SHALL open CheckInDetailModal using the checkInId
3. WHILE CheckInDetailModal is open, THE Gallery_Page SHALL close the modal when the user clicks the backdrop or the close button
4. THE HallOfFame_Tab SHALL display cursor-pointer and a scale hover effect on each check-in ranking card

### Requirement 6: 프로필 인증 갤러리 클릭 인터랙션

**User Story:** As a user, I want to click a check-in photo in my profile gallery to see its details, so that I can review my past check-ins.

#### Acceptance Criteria

1. WHEN a user clicks a CheckIn_Card in Profile_Gallery, THE Profile_Gallery SHALL open CheckInDetailModal with the selected CheckIn data
2. WHEN a user presses Enter or Space on a focused CheckIn_Card in Profile_Gallery, THE Profile_Gallery SHALL open CheckInDetailModal with the selected CheckIn data
3. WHILE CheckInDetailModal is open, THE Profile_Gallery SHALL close the modal when the user clicks the backdrop or the close button

### Requirement 7: 모달 접근성 및 키보드 지원

**User Story:** As a user with accessibility needs, I want the detail modal to be fully keyboard-navigable, so that I can use the feature without a mouse.

#### Acceptance Criteria

1. WHEN CheckInDetailModal opens, THE CheckInDetailModal SHALL trap focus within the modal content
2. WHEN a user presses Escape while CheckInDetailModal is open, THE CheckInDetailModal SHALL close the modal
3. WHEN CheckInDetailModal closes, THE CheckInDetailModal SHALL return focus to the CheckIn_Card that triggered the modal
4. THE CheckInDetailModal SHALL have role="dialog" and aria-modal="true" attributes
5. THE CheckInDetailModal SHALL have an aria-label describing the modal content

### Requirement 8: 기존 스팟 상세 갤러리와의 일관성 유지

**User Story:** As a user, I want the check-in detail experience to be consistent across all screens, so that I have a predictable interaction pattern.

#### Acceptance Criteria

1. THE Spot_Detail_Gallery SHALL continue to open CheckInDetailModal on CheckIn_Card click without regression
2. THE CheckInDetailModal SHALL display identical information layout regardless of which screen triggered it
3. THE CheckInDetailModal SHALL display the same hover and focus visual cues on CheckIn_Cards across all screens
