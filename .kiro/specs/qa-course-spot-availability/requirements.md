# Requirements: Course Spot Availability Classification

## Source

- Related QA concern: course page route spots being treated as lost/unavailable.
- Related implementation evidence:
  - `src/lib/route-spot-availability.ts`
  - `src/lib/route-spot-availability.test.ts`
  - `src/app/api/routes/[id]/route.ts`
  - `scripts/seed-researched-routes.mjs`

## Problem Statement

Course pages must not classify every route spot as lost merely because one specific status field is absent or represented differently. Route spot availability must be derived from a normalized lifecycle/status model and must distinguish available, closed, removed, and missing-data cases.

## User Stories

- As a route viewer, I want available spots in a course to appear as visitable so that I can trust the route page.
- As a data maintainer, I want unavailable/lost spots to be marked only when the data explicitly indicates that state.
- As a developer, I want route spot availability rules to be centralized so that API and UI behavior do not diverge.

## Requirements

### Requirement 1: Available route spots must not be misclassified as lost

**User Story:** As a route viewer, I want real route spots to remain visible as available when their data says they are usable.

#### Acceptance Criteria

1. WHEN a route spot has `status`, `spotStatus`, or `lifecycleStatus` indicating an active/available state THEN the system SHALL classify it as available.
2. WHEN a route spot has missing optional status aliases but has no explicit removed/lost state THEN the system SHALL NOT classify it as lost by default.
3. WHEN `/api/routes/[id]` returns route spots THEN each spot SHALL include enough projected status fields for availability classification.
4. WHEN opening a seeded route detail page THEN not all spots SHALL display as lost unless every spot is explicitly unavailable in source data.

### Requirement 2: Explicitly unavailable spots must remain distinguishable

**User Story:** As a route viewer, I want genuinely unavailable spots to be communicated clearly.

#### Acceptance Criteria

1. WHEN a spot is explicitly marked removed, closed, lost, unavailable, or equivalent THEN the system SHALL classify it as unavailable.
2. WHEN a spot is unavailable THEN the UI SHALL communicate the state without hiding the route sequence context.
3. WHEN a route mixes available and unavailable spots THEN the UI SHALL preserve the order and show each state accurately.

### Requirement 3: Classification logic must be centralized and tested

**User Story:** As a developer, I want one source of truth for spot availability rules.

#### Acceptance Criteria

1. WHEN API or UI code needs route spot availability THEN it SHALL use a shared helper rather than duplicating ad hoc status checks.
2. WHEN new status aliases are introduced THEN tests SHALL cover active, unavailable, null, and unknown cases.
3. WHEN seed data creates researched routes THEN route spot IDs referenced by the route SHALL exist or be reported by validation.
4. WHEN route seed validation runs THEN missing spot IDs SHALL fail validation before users see all-lost route pages.

## Non-Functional Requirements

- The availability rule SHALL be conservative: explicit unavailable states override ambiguous active assumptions.
- The helper SHALL be small, deterministic, and independent of UI rendering.
- Seed scripts SHALL not silently create route references that the app cannot resolve.

## Out of Scope

- Redesigning route detail page layout.
- Changing the business meaning of truly removed/lost spots.
