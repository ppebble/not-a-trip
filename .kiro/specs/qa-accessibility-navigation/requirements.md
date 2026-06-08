# Requirements: Accessibility and Keyboard Navigation

## Source

- QA report: `docs/qa/persona-service-qa-2026-06-08.md`
- Evidence:
  - `.omx/ultraqa/artifacts/persona-service-qa-run.json`

## Problem Statement

Spot detail pages expose structural accessibility issues: multiple `h1` elements, skipped heading levels, and non-semantic focusable elements from map/Leaflet areas. These defects make the service harder to use with screen readers and keyboard-only navigation.

## User Stories

- As a screen-reader user, I want each page to have a clear heading hierarchy so that I can understand the page structure quickly.
- As a keyboard user, I want focus to move only through meaningful controls so that I can navigate without getting lost in decorative or map internals.
- As an accessibility reviewer, I want regressions to be caught automatically so that semantic quality does not decay.

## Requirements

### Requirement 1: Page heading hierarchy must be valid

**User Story:** As a screen-reader user, I want predictable headings.

#### Acceptance Criteria

1. WHEN a spot detail page loads THEN it SHALL expose exactly one primary `h1` for the page content.
2. WHEN headings appear after the `h1` THEN heading levels SHALL not skip levels, such as `h2` directly to `h4`.
3. IF a visual heading must appear smaller or larger THEN styling SHALL be changed without misusing semantic heading levels.
4. WHEN automated accessibility QA scans spot detail pages THEN duplicate `h1` or heading-level skip SHALL fail the check.

### Requirement 2: Keyboard focus order must include only meaningful targets

**User Story:** As a keyboard user, I want tab navigation to move through usable controls only.

#### Acceptance Criteria

1. WHEN a user presses `Tab` through a spot detail page THEN focus SHALL move through meaningful links, buttons, form controls, and named map controls only.
2. WHEN Leaflet or map internals render decorative `div` elements THEN those elements SHALL not be tabbable unless they perform a named user action.
3. WHEN a non-native element is focusable THEN it SHALL have an accessible role, name, and keyboard activation behavior.
4. WHEN focus enters an interactive map region THEN there SHALL be a clear way to skip or leave the map region.

### Requirement 3: Interactive controls must have accessible names

**User Story:** As a screen-reader user, I want every action to be announced clearly.

#### Acceptance Criteria

1. WHEN a button or icon control appears THEN it SHALL have visible text or an accessible label.
2. WHEN a control uses only an icon THEN `aria-label` or equivalent accessible name SHALL describe the action, not the icon shape.
3. WHEN automated QA lists focusable elements THEN unnamed focusable elements SHALL fail the quality gate unless explicitly documented as safe.

### Requirement 4: Contrast and visual readability must be guarded

**User Story:** As a low-vision user, I want text to remain readable.

#### Acceptance Criteria

1. WHEN user-visible text appears over solid or image backgrounds THEN it SHALL meet WCAG AA contrast targets for its size.
2. WHEN low-contrast candidates are detected automatically THEN they SHALL be manually triaged to separate real UI text from scripts, JSON, or hidden diagnostic content.
3. WHEN real low-contrast text is confirmed THEN it SHALL be fixed before release.

## Non-Functional Requirements

- Accessibility checks SHALL be run on at least one representative spot detail page and one route detail page.
- Fixes SHALL prefer semantic HTML over ARIA patches where native elements are possible.
- Map accessibility decisions SHALL be documented because map libraries often inject focusable internals.

## Out of Scope

- Full WCAG audit for every page in the product.
- Replacing Leaflet or the map provider.
