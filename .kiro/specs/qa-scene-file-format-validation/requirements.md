# Requirements: Scene Image File Format Validation

## Source

- Related user-reported error: valid PNG upload rejected with `파일 확장자 또는 MIME 타입과 실제 파일 형식이 일치하지 않습니다.`
- Related implementation evidence:
  - `src/lib/upload/validation.ts`
  - `src/lib/upload/validation.test.ts`
  - `src/components/spot/scene/AddSceneModal.tsx`
- Related QA report: `docs/qa/persona-service-qa-2026-06-08.md`

## Problem Statement

Scene image upload validation must accept real PNG files even when the browser reports an unreliable MIME type, while still rejecting files whose extension/MIME claims conflict with the actual binary signature. Browser-provided MIME is not authoritative; server-side binary validation is authoritative.

## User Stories

- As a contributor, I want a valid `.png` file to upload even if my browser reports a generic or incorrect MIME type.
- As the service, I want to reject a fake `.png` file when its binary signature is JPEG or another unsupported format.
- As a maintainer, I want validation errors to explain the actual mismatch clearly and consistently.

## Requirements

### Requirement 1: Real PNG files must be accepted despite unreliable browser MIME

**User Story:** As a contributor, I want a valid PNG to upload successfully.

#### Acceptance Criteria

1. WHEN a file has `.png` extension and PNG binary signature THEN the system SHALL treat it as PNG even if the browser MIME type is inaccurate or generic.
2. WHEN client-side validation sees a valid image extension but unreliable MIME THEN it SHALL allow the file to proceed to server-side validation.
3. WHEN server-side validation confirms PNG binary signature and policy limits are satisfied THEN it SHALL accept the file.
4. WHEN the upload succeeds THEN the UI SHALL not show the mismatch message `파일 확장자 또는 MIME 타입과 실제 파일 형식이 일치하지 않습니다.`.

### Requirement 2: Binary signature must be authoritative

**User Story:** As the service, I want actual file content to decide safety.

#### Acceptance Criteria

1. WHEN extension and MIME claim PNG but binary signature is not PNG THEN the system SHALL reject the file.
2. WHEN extension is `.png` but binary signature is JPEG THEN the system SHALL reject the file as a format mismatch.
3. WHEN MIME says `image/png` but binary signature is unsupported THEN the system SHALL reject the file.
4. WHEN binary detection cannot identify the file THEN the system SHALL reject it unless an explicit safe fallback rule exists.

### Requirement 3: Validation messages must be precise and actionable

**User Story:** As a contributor, I want to understand why upload failed.

#### Acceptance Criteria

1. WHEN a true format mismatch occurs THEN the UI SHALL show a localized message explaining that extension/MIME and actual file format do not match.
2. WHEN a file is too large THEN the UI SHALL show a size-specific error rather than a format mismatch error.
3. WHEN a file type is unsupported but internally consistent THEN the UI SHALL show an unsupported-format error rather than a mismatch error.
4. WHEN authentication is missing THEN the UI SHALL show authentication-required state before any file-format validation message.

### Requirement 4: Regression coverage must protect browser edge cases

**User Story:** As a maintainer, I want this upload bug to stay fixed.

#### Acceptance Criteria

1. WHEN tests run against upload validation THEN they SHALL include a valid PNG with incorrect MIME type.
2. WHEN tests run against upload validation THEN they SHALL include fake PNG/JPEG binary mismatch.
3. WHEN tests run against upload validation THEN they SHALL include extension/MIME/binary agreement cases for supported formats.
4. WHEN scene upload UI tests run THEN they SHALL verify extension fallback before server validation.

## Non-Functional Requirements

- Client validation SHALL improve UX but SHALL not be the final trust boundary.
- Server validation SHALL remain deterministic and independent of browser-specific MIME quirks.
- No new upload dependency SHALL be added unless existing binary signature detection is insufficient.

## Out of Scope

- Supporting arbitrary image formats beyond product policy.
- Changing moderation/review workflow after upload.
