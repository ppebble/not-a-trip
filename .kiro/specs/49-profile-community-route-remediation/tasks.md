# Spec 49 Tasks - Profile Community Route Remediation

## Requirements trace

- Requirement 1: profile post links use the existing `/community/{post.id}` route.
- Requirement 2: profile comment links use the parent post route `/community/{comment.postId}`.
- Requirement 3: community detail routing has one canonical generated pattern.

## Task checklist

- [x] 1. Lock route contract and implementation plan
  - [x] 1.1 Confirm existing app route is `/community/[id]`
  - [x] 1.2 Confirm no `/community/posts/[id]` route exists
  - [x] 1.3 Choose canonical generated href format `/community/{id}`

- [x] 2. Implement canonical community detail href generation
  - [x] 2.1 Add a reusable helper for profile community detail hrefs
  - [x] 2.2 Return no href for missing or blank ids
  - [x] 2.3 Encode ids as a single path segment

- [x] 3. Update profile community links
  - [x] 3.1 Change post links from `/community/posts/{id}` to canonical detail hrefs
  - [x] 3.2 Change comment links from `/community/posts/{postId}` to canonical detail hrefs
  - [x] 3.3 Render a non-link fallback when the required id is missing
  - [x] 3.4 Preserve current visual card styling for valid links

- [x] 4. Add verification coverage
  - [x] 4.1 Test post href generation for valid ids
  - [x] 4.2 Test comment parent-post href generation for valid ids
  - [x] 4.3 Test blank ids return no broken href
  - [x] 4.4 Assert generated hrefs do not use `/community/posts/*`

- [x] 5. Run completion checks
  - [x] 5.1 Run targeted route helper tests
  - [x] 5.2 Run `npm run type-check`
  - [x] 5.3 Run `npm run lint`
  - [x] 5.4 Update this task checklist with final status

