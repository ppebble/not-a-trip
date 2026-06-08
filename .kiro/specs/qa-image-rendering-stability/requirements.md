# Requirements: Image Rendering and Optimizer Stability

## Source

- QA report: `docs/qa/persona-service-qa-2026-06-08.md`
- Evidence:
  - `.omx/ultraqa/artifacts/persona-service-qa-run.json`
  - `.omx/ultraqa/artifacts/persona-service-qa-cycle2-run.json`
  - Dev server logs under `.omx/ultraqa/artifacts/dev-server.*.log`

## Problem Statement

Multiple image requests through `/_next/image` fail with HTTP 500 and `TypeError: handleRequest is not a function`. The failures affect icons, mascot assets, category assets, and uploaded content cover images. This creates broken visuals, noisy network failures, and inflated perceived load time.

## User Stories

- As a normal visitor, I want service icons and content cover images to render reliably so that pages do not look broken.
- As a route or spot browser, I want image loading failures to degrade gracefully so that I can still understand the content.
- As an operator, I want image rendering failures to be observable and reproducible so that asset regressions are caught before release.

## Requirements

### Requirement 1: Local static assets must not produce optimizer 500 errors

**User Story:** As a visitor, I want local UI assets to load without server errors.

#### Acceptance Criteria

1. WHEN pages request local assets such as `/icons/mascot/mascot-lookout.webp`, `/icons/ui/settings.webp`, or `/icons/categories/animation.webp` THEN the system SHALL return successful image responses.
2. WHEN local static assets are rendered through `next/image` THEN the image optimizer SHALL NOT throw `TypeError: handleRequest is not a function`.
3. IF the optimizer cannot support a local asset path THEN the component SHALL render that asset through a safe static image path instead of `/_next/image`.
4. WHEN running `npm run dev` and visiting `/welcome`, `/routes`, `/contents`, and `/spots/REAL-ANI-050` THEN image optimizer HTTP 500 count SHALL be zero.

### Requirement 2: Uploaded content covers must render reliably

**User Story:** As a content browser, I want uploaded cover images to appear consistently.

#### Acceptance Criteria

1. WHEN a page renders `/uploads/contents/covers/*.webp` through the image pipeline THEN the system SHALL return a valid image response or a deliberate placeholder.
2. IF an uploaded cover is missing or unreadable THEN the UI SHALL show a stable fallback image and SHALL NOT repeatedly issue failing optimizer requests.
3. WHEN a cover image fails to load THEN the page SHALL preserve layout dimensions to avoid layout shift.

### Requirement 3: Image failures must be observable

**User Story:** As an operator, I want image pipeline regressions to be detectable.

#### Acceptance Criteria

1. WHEN an image response fails with 5xx THEN the system SHALL log the asset URL and failure reason once per unique URL per request cycle.
2. WHEN automated QA visits core pages THEN the test SHALL fail if any `/_next/image` request returns 500.
3. WHEN an image fallback is used THEN it SHALL be distinguishable in logs or client diagnostics without exposing internal stack traces to users.

## Non-Functional Requirements

- Core pages SHALL not show visually broken icons or covers during normal development runs.
- Image transfer sizes SHOULD be bounded by viewport-appropriate dimensions.
- The fix SHALL not introduce a new image dependency without explicit approval.

## Out of Scope

- Full CDN migration.
- Re-authoring all image assets.
