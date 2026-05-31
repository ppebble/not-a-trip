# Requirements Document

## Introduction

현재 코드 기준으로 `/community`는 독립 게시판 진입점이 아니라 `/gallery`로 redirect되는 호환 경로다. 일부 내부 컴포넌트에는 `/community/write`, `/community/{id}`, `/community?spotId=...` 링크가 남아 있지만, 공개 내비게이션에서 커뮤니티 게시판을 자연스럽게 발견하고 댓글을 작성하는 제품 흐름은 사실상 없다.

This result is derived via logical deduction: `src/app/community/page.tsx`는 `/gallery`로 redirect하고, 체크인/인증샷 상세 모달은 `comment`를 작성자 캡션처럼 표시하며 `likeCount`를 읽기 전용으로 보여준다. 따라서 커뮤니티 게시판 기능을 되살리는 대신, 실제 공개 표면인 인증샷/체크인에 social interaction을 수렴시키는 것이 현재 제품 방향과 더 맞다.

본 spec은 커뮤니티 게시판 기능을 확장하지 않는다. 인증샷/체크인 상세 모달에서 좋아요와 댓글을 사용할 수 있도록 요구사항을 정의하고, 기존 community post/comment 의존은 신규 기능의 주 경로에서 제외한다.

## Source Evidence

- `/community` root behavior: `src/app/community/page.tsx` redirects to `/gallery`.
- Residual community routes still exist:
  - `src/app/community/[id]/page.tsx`
  - `src/app/community/write/page.tsx`
  - `src/app/community/[id]/edit/page.tsx`
  - `src/app/community/spot/[id]/page.tsx`
  - `src/app/community/media/[title]/page.tsx`
- Residual community entry references:
  - `src/components/spot/SpotCommunitySection.tsx`
  - `src/components/community/PostList.tsx`
  - `src/components/community/PostDetail.tsx`
  - profile community activity links from spec 49 work.
- Check-in modal surface:
  - `src/components/checkin/CheckInDetailModal.tsx`
  - Shows `activeCheckIn.comment`.
  - Shows `activeCheckIn.likeCount`, but no toggle action.
- Check-in APIs:
  - `src/app/api/checkins/route.ts` creates check-ins with `comment` and `likeCount: 0`.
  - `src/app/api/checkins/[id]/route.ts` returns check-in detail with `comment` and `likeCount`.
  - No `/api/checkins/[id]/like` route exists.
- Existing reference implementation for like behavior:
  - `src/app/api/scenes/[id]/like/route.ts`
  - `src/hooks/useScenes.ts`
  - `src/stores/likeStore.ts`

## Glossary

- **CheckIn_Post**: 사용자가 장소 방문을 인증하기 위해 업로드한 인증샷/체크인 기록.
- **CheckIn_Caption**: 체크인 작성자가 업로드 시 남긴 기존 `checkIn.comment` 텍스트. 댓글 스레드가 아니다.
- **CheckIn_Comment**: 다른 사용자 또는 작성자가 CheckIn_Post 상세에서 추가로 남기는 별도 댓글.
- **CheckIn_Like**: CheckIn_Post에 대한 사용자/디바이스 단위 좋아요 상태와 카운트.
- **CheckIn_Detail_Modal**: `CheckInDetailModal`로 렌더되는 인증샷 상세 표면.
- **Community_Board**: `/community/*`의 기존 게시판/게시글/댓글 기능.
- **Social_Interaction_Surface**: 좋아요, 댓글 목록, 댓글 작성, 댓글 삭제가 가능한 사용자 상호작용 표면.

## Requirements

### Requirement 1: 커뮤니티 게시판은 신규 소셜 기능의 주 경로가 아니어야 한다

**User Story:** As a product owner, I want social interaction to live on the check-in surface instead of reviving the removed community board, so that launch scope does not drift into an unrelated forum feature.

#### Acceptance Criteria

1. THE new Social_Interaction_Surface SHALL target CheckIn_Post details, not Community_Board posts.
2. THE implementation SHALL NOT add a new public navigation entry to `/community` as part of this spec.
3. THE implementation SHALL NOT rely on `/community` root for user discovery because `/community` redirects to `/gallery`.
4. IF existing residual `/community/*` routes remain, THEN they SHALL be treated as legacy/internal compatibility until a separate removal or migration spec decides their fate.
5. THE final implementation summary SHALL list any touched community references and explain why they were kept, removed, or deferred.
6. THE scope SHALL NOT include rebuilding a full community board, post list, or post authoring workflow.

---

### Requirement 2: CheckIn detail modal must support like toggling

**User Story:** As a gallery visitor, I want to like or unlike an 인증샷 from its detail modal, so that the visible like count is interactive instead of read-only.

#### Acceptance Criteria

1. THE CheckIn_Detail_Modal SHALL render the heart/like control as a button when a CheckIn_Post is loaded.
2. WHEN a user activates the like button, THE system SHALL toggle CheckIn_Like state for that CheckIn_Post.
3. THE like count SHALL update in the modal after a successful toggle.
4. THE like control SHALL expose accessible labels for liked and unliked states.
5. THE like control SHALL prevent duplicate in-flight toggles for the same CheckIn_Post.
6. IF the toggle fails, THEN THE modal SHALL keep or restore the last confirmed count and expose a non-blocking error state.
7. THE like implementation SHALL NOT mutate scene likes or reuse scene ids for check-in likes.

---

### Requirement 3: CheckIn like API must persist user or device-specific state

**User Story:** As the system, I want check-in likes to be persisted per user or visitor device, so that repeated clicks toggle rather than inflate counts.

#### Acceptance Criteria

1. THE system SHALL provide an API route for CheckIn_Like status and toggling, such as `/api/checkins/{id}/like`.
2. THE API SHALL return both `liked` and `likeCount`.
3. THE API SHALL identify authenticated users by user id where available.
4. THE API SHALL identify unauthenticated visitors by a stable device or visitor id where available.
5. THE API SHALL prevent duplicate like records for the same CheckIn_Post and identity.
6. WHEN a like is added, THE CheckIn_Post `likeCount` SHALL increment by 1.
7. WHEN a like is removed, THE CheckIn_Post `likeCount` SHALL decrement by 1 but SHALL NOT go below 0.
8. IF the CheckIn_Post id is invalid or missing, THEN THE API SHALL return a 400-class response and SHALL NOT change counts.
9. IF the CheckIn_Post does not exist, THEN THE API SHALL return 404 and SHALL NOT create a like record.

---

### Requirement 4: CheckIn comments must be separate from the existing caption

**User Story:** As a gallery visitor, I want to leave comments on an 인증샷 without overwriting the uploader's original note, so that discussion and authored proof remain distinct.

#### Acceptance Criteria

1. THE existing `checkIn.comment` field SHALL be treated as CheckIn_Caption.
2. THE CheckIn_Caption SHALL remain visible in CheckIn_Detail_Modal when present.
3. THE CheckIn_Comment list SHALL be modeled separately from CheckIn_Caption.
4. THE implementation SHALL NOT store user discussion comments by overwriting `checkIn.comment`.
5. THE CheckIn_Detail_Modal SHALL visually distinguish the uploader caption from the comment thread.
6. IF comment support is deferred while like support ships first, THEN the final summary SHALL state that CheckIn_Caption is not a comment thread.

---

### Requirement 5: CheckIn detail modal must support comment viewing and creation when enabled

**User Story:** As a gallery visitor, I want to read and write comments directly in the 인증샷 detail modal, so that discussion happens where the content is viewed.

#### Acceptance Criteria

1. THE CheckIn_Detail_Modal SHALL include a CheckIn_Comment section when comment support is enabled.
2. THE CheckIn_Comment section SHALL list comments for the loaded CheckIn_Post in chronological order unless a product decision specifies another order.
3. THE CheckIn_Comment form SHALL validate non-empty content before submission.
4. THE CheckIn_Comment form SHALL sanitize plain text input before persistence.
5. WHEN a comment is submitted successfully, THE new comment SHALL appear in the modal without requiring a full page reload.
6. IF comments fail to load, THEN the modal SHALL keep the check-in content usable and show a retry or degraded state for comments only.
7. THE comment section SHALL be usable for check-ins opened from gallery lists and for check-ins loaded directly by `checkInId`.

---

### Requirement 6: CheckIn comment API must support list, create, and delete contracts

**User Story:** As the system, I want check-in comments to have explicit API contracts, so that modal UI, profile activity, and moderation can rely on stable data.

#### Acceptance Criteria

1. THE system SHALL provide an API route for listing and creating CheckIn_Comment records, such as `/api/checkins/{id}/comments`.
2. THE list response SHALL include comment id, check-in id, content, author display data, ownership/deletion capability where available, and created timestamp.
3. THE create request SHALL associate the new comment with the target CheckIn_Post.
4. THE create request SHALL support authenticated users.
5. IF guest comments are allowed, THEN guest identity and deletion rules SHALL be explicit and password/device handling SHALL be defined before implementation.
6. THE system SHALL provide a delete contract for owner-authorized comment deletion if deletion is in scope.
7. THE API SHALL reject invalid CheckIn_Post ids and missing content without changing data.
8. THE API SHALL apply existing spam/rate-limit/sanitization protections where applicable.

---

### Requirement 7: Gallery and ranking data must stay consistent after interactions

**User Story:** As a user browsing the gallery, I want like counts and comment counts to stay consistent after interacting in the modal, so that list cards, ranking, and detail views do not contradict each other.

#### Acceptance Criteria

1. AFTER a successful CheckIn_Like toggle, THE relevant check-in detail cache SHALL reflect the returned `likeCount`.
2. AFTER a successful CheckIn_Like toggle, THE gallery list cache SHALL update or be invalidated so reopening the modal does not show stale counts.
3. IF ranking data uses `likeCount`, THEN ranking queries SHALL be invalidated or refreshed after like changes where practical.
4. IF CheckIn_Comment count is displayed on gallery cards, THEN it SHALL update or be invalidated after comment create/delete.
5. THE implementation SHALL avoid optimistic updates that can permanently diverge from server-confirmed counts.
6. THE final verification SHALL include at least one path from gallery item click to modal interaction to updated modal count.

---

### Requirement 8: Accessibility and mobile behavior must be preserved in the modal

**User Story:** As a mobile or keyboard user, I want check-in social controls to be accessible inside the modal, so that added interactions do not break the existing detail viewer.

#### Acceptance Criteria

1. THE like button SHALL be keyboard reachable inside the existing modal focus trap.
2. THE comment input and submit button SHALL be keyboard reachable inside the existing modal focus trap.
3. THE modal SHALL preserve Escape-to-close behavior.
4. THE modal SHALL preserve backdrop click close behavior except when interacting inside controls.
5. THE comment form SHALL not push critical close/like controls off-screen on common mobile viewports.
6. THE modal SHALL announce loading, error, and submitting states through visible text or accessible attributes.

---

### Requirement 9: Legacy community references must be audited before changing profile links again

**User Story:** As a maintainer, I want legacy community references audited before more routing changes, so that we do not keep fixing links into a removed product area.

#### Acceptance Criteria

1. THE implementation SHALL inventory remaining `/community/*` links before modifying profile/community behavior again.
2. IF profile activity should point to CheckIn_Post social interactions instead of Community_Board posts, THEN a separate migration decision SHALL define how old community posts map to check-ins or whether the profile tab is removed.
3. THE implementation SHALL NOT silently convert Community_Board comments into CheckIn_Comment records without a data migration plan.
4. THE final summary SHALL state whether Community_Board routes are untouched legacy, hidden, redirected, or scheduled for removal.
5. Any future removal of `/community/[id]` SHALL include SEO, sitemap, notification URL, and existing data impact review.

---

### Requirement 10: Verification package must prove the scope did not revive community board

**User Story:** As a reviewer, I want evidence that the feature was implemented on check-ins only, so that the release does not accidentally reintroduce the removed community board.

#### Acceptance Criteria

1. Verification_Evidence SHALL include targeted tests for CheckIn_Like API behavior.
2. Verification_Evidence SHALL include targeted tests for CheckIn_Detail_Modal like interaction.
3. IF CheckIn_Comment is implemented, Verification_Evidence SHALL include API and modal tests for list/create behavior.
4. Verification_Evidence SHALL include `npm run type-check`.
5. Verification_Evidence SHALL include `npm run lint` and identify any pre-existing warning noise separately from new warnings.
6. Verification_Evidence SHALL include a grep or route inventory proving no new public `/community` navigation entry was added by this spec.
7. THE feature SHALL NOT be marked complete if likes/comments work only on Community_Board posts and not on CheckIn_Post details.
