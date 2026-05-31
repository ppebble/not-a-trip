# Requirements Document

## Introduction

프로필 화면의 커뮤니티 활동 링크가 존재하지 않는 `/community/posts/*` 경로로 이동하는 문제를 수정한다. 이 spec은 `.kiro/specs/48-pre-publishing-cleanup/code-review-report.md`의 High Finding 1과 `docs/session-handoffs/2026-06-01-pre-publishing-cleanup.md`의 open risk를 별도 기능 요구사항으로 분리한다.

This result is derived via logical deduction: 코드리뷰는 `src/app/community/[id]/page.tsx`는 존재하지만 `src/app/community/posts/[id]/page.tsx`는 없다고 확인했고, 프로필 커뮤니티 섹션은 존재하지 않는 경로를 생성하므로 사용자 관점에서는 확정 404 위험이다.

## Source Evidence

- Review finding: High 1, broken profile community links.
- Handoff open risk: profile community links point to `/community/posts/*`, but app has `/community/[id]`.
- Affected file: `src/components/profile/sections/CommunitySection.tsx`.
- Existing route: `src/app/community/[id]/page.tsx`.
- Missing route: `src/app/community/posts/[id]/page.tsx`.

## Glossary

- **Profile_Community_Link**: 프로필 화면에서 사용자의 게시글 또는 댓글 원문으로 이동하는 링크.
- **Canonical_Community_Detail_Route**: 현재 앱이 제공하는 커뮤니티 상세 경로 `/community/{id}`.
- **Legacy_Posts_Route**: 코드리뷰에서 문제로 지적된 미존재 경로 `/community/posts/{id}`.
- **Route_Contract**: 링크 생성 코드와 실제 Next.js app route가 일치해야 한다는 계약.

## Requirements

### Requirement 1: 프로필 게시글 링크는 실제 커뮤니티 상세 경로를 사용해야 한다

**User Story:** As a profile user, I want my post activity links to open the existing community detail page, so that clicking my activity never leads to a guaranteed 404.

#### Acceptance Criteria

1. THE Profile_Community_Link for a post SHALL use `/community/{post.id}` as the target URL.
2. THE Profile_Community_Link SHALL NOT use `/community/posts/{post.id}` unless a matching route or redirect contract is implemented.
3. IF a post id is missing, THEN the UI SHALL avoid generating a broken href and SHALL render a safe fallback state.
4. THE link label and visual behavior SHALL remain equivalent to the current profile community section except for the corrected route.
5. Verification_Evidence SHALL include a static route inventory or targeted test proving the generated post href matches an existing route.

---

### Requirement 2: 프로필 댓글 링크는 댓글의 부모 게시글 상세로 이동해야 한다

**User Story:** As a profile user, I want my comment activity links to open the parent community post, so that I can verify context without hitting a dead route.

#### Acceptance Criteria

1. THE Profile_Community_Link for a comment SHALL use `/community/{comment.postId}` as the target URL.
2. THE implementation SHALL NOT generate `/community/posts/{comment.postId}` for comments.
3. IF `comment.postId` is missing or invalid, THEN the UI SHALL avoid a broken navigation target and expose a safe disabled/fallback state.
4. THE comment preview content SHALL not be modified except where needed to prevent broken navigation.
5. Verification_Evidence SHALL include a targeted assertion or review evidence for both post and comment link generation.

---

### Requirement 3: 커뮤니티 라우팅 계약은 중복 패턴을 남기지 않아야 한다

**User Story:** As a maintainer, I want one canonical community detail route, so that future profile, feed, and notification links do not drift into incompatible URL patterns.

#### Acceptance Criteria

1. THE implementation SHALL treat `/community/{id}` as the canonical detail URL for this remediation.
2. IF the team decides to add `/community/posts/[id]`, THEN it SHALL define redirect behavior, canonical URL semantics, and tests in the same change.
3. THE remediation SHALL NOT leave both `/community/{id}` and `/community/posts/{id}` actively generated without documented routing rules.
4. THE final summary SHALL list every file changed for profile community route generation.
5. THE release gate SHALL remain blocked until profile post and comment links resolve to existing routes.
