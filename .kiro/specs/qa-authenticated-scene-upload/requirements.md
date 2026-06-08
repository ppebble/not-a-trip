# Requirements: Authenticated Scene Image Upload

## Source

- QA report: `docs/qa/persona-service-qa-2026-06-08.md`
- Evidence:
  - `.omx/ultraqa/artifacts/p3-scene-upload-2026-06-08T11-30-18-767Z.png`
  - `.omx/ultraqa/artifacts/p5-fake-upload-2026-06-08T11-30-18-767Z.png`
  - `.omx/ultraqa/artifacts/persona-service-qa-run.json`
  - `.omx/ultraqa/artifacts/persona-service-qa-cycle2-run.json`

## Problem Statement

The actual browser flow for adding a scene image is unstable after registration/login. The tester could not reliably reach a successful PNG upload state, and hostile fake-PNG validation could not be verified because the flow stopped at an authentication requirement. This blocks end-to-end validation of scene-image contribution.

## User Stories

- As a newly registered user, I want to upload a PNG scene image immediately after authentication so that I can contribute a scene without re-login confusion.
- As an unauthenticated user, I want upload controls to clearly explain that login is required before I select a file.
- As the service, I want to reject files whose extension/MIME claims do not match the actual binary format so that unsafe or mislabeled files are not accepted.

## Requirements

### Requirement 1: Authentication state must be reliable before upload

**User Story:** As a newly registered scene contributor, I want my authenticated state to be reflected in the upload UI.

#### Acceptance Criteria

1. WHEN a user completes successful registration and login THEN the browser session SHALL expose an authenticated user to the scene upload flow without requiring manual refresh loops.
2. WHEN an authenticated user opens a spot scene upload modal THEN the modal SHALL not show `이미지 업로드는 로그인 후 사용할 수 있습니다.`.
3. IF session establishment is still pending THEN the upload UI SHALL show a loading or retry state rather than allowing file selection that later fails as unauthenticated.
4. WHEN `/api/auth/session` reports no user THEN scene upload CTA SHALL be disabled or redirect to login before file selection.

### Requirement 2: Valid PNG upload must succeed in real UI

**User Story:** As an authenticated contributor, I want a real PNG file to upload successfully.

#### Acceptance Criteria

1. WHEN an authenticated user selects a binary-valid PNG file with `.png` extension THEN the client SHALL accept the file for upload.
2. WHEN the browser supplies an inaccurate MIME type but the extension and binary signature identify a PNG THEN the upload SHALL continue to server validation.
3. WHEN the server validates the same binary-valid PNG THEN it SHALL accept the file unless it violates size or policy limits.
4. WHEN upload succeeds THEN the UI SHALL show a success signal and the new scene image SHALL be visible or pending-review state SHALL be explicit.

### Requirement 3: Fake PNG must be rejected at validation layer

**User Story:** As the service, I want mislabeled image files rejected even when the extension is `.png`.

#### Acceptance Criteria

1. WHEN a file has `.png` extension but JPEG magic bytes THEN the system SHALL reject it with a clear file-format mismatch error.
2. WHEN a file has PNG MIME type but non-PNG binary signature THEN the system SHALL reject it.
3. WHEN rejection occurs THEN the error message SHALL identify the format mismatch without exposing low-level stack details.
4. WHEN unauthenticated users attempt the same action THEN authentication errors SHALL be shown before file validation errors.

### Requirement 4: Upload flow must be testable end-to-end

**User Story:** As a maintainer, I want automated browser QA to verify the real upload path.

#### Acceptance Criteria

1. WHEN automated QA creates a new user and logs in through the UI THEN it SHALL be able to verify the authenticated upload state from the page context.
2. WHEN automated QA uploads a valid PNG THEN it SHALL assert a success UI state or a known pending-review state.
3. WHEN automated QA uploads a fake PNG THEN it SHALL assert a mismatch rejection after authentication is confirmed.

## Non-Functional Requirements

- Upload validation SHALL remain defense-in-depth: client checks are advisory; server checks are authoritative.
- Error states SHALL be localized and actionable.
- The upload flow SHALL not require hidden test-only bypasses.

## Out of Scope

- Changing moderation policy for newly uploaded scene images.
- Adding new file formats beyond the currently intended image set.
