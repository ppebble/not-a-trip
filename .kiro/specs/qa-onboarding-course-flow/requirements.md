# Requirements: Onboarding and Course Start Flow

## Source

- QA report: `docs/qa/persona-service-qa-2026-06-08.md`
- Evidence:
  - `.omx/ultraqa/artifacts/p1-error-2026-06-08T11-30-18-767Z.png`
  - `.omx/ultraqa/artifacts/p2-error-2026-06-08T11-30-18-767Z.png`
  - `.omx/ultraqa/artifacts/persona-service-qa-run.json`

## Problem Statement

The onboarding overlay currently blocks real user interaction with core route CTAs. Anonymous and mobile users cannot reliably click route cards or the `코스 시작` button because a full-screen `role="dialog"` overlay intercepts pointer events.

## User Stories

- As a first-time anonymous visitor, I want to open a recommended route from `/routes` without being blocked by onboarding so that I can inspect the course immediately.
- As a mobile traveler, I want to start a route from `/routes/[id]` without fighting an overlay so that I can begin navigation on-site.
- As a keyboard user, I want to dismiss or progress onboarding predictably so that I can reach the underlying page controls.

## Requirements

### Requirement 1: Route card click must remain reachable

**User Story:** As an anonymous route browser, I want route cards to remain clickable even when onboarding is active.

#### Acceptance Criteria

1. WHEN a user visits `/routes` for the first time THEN the system SHALL allow the user to open a route card without pointer-event interception by a full-screen overlay.
2. IF onboarding highlights a route card THEN the highlighted target SHALL either receive the click directly or the onboarding layer SHALL expose an explicit action that performs the same navigation.
3. WHEN the user clicks outside the onboarding tooltip THEN the system SHALL either dismiss onboarding or leave the route card interaction unaffected.
4. WHEN tested at desktop viewport `1440x1000` THEN clicking the route titled `우지 유포니엄 현지 체험 확장 코스` SHALL navigate to its route detail page without timeout.

### Requirement 2: Course start CTA must remain reachable on mobile

**User Story:** As a mobile traveler, I want to start the course from the route detail page without onboarding blocking the CTA.

#### Acceptance Criteria

1. WHEN a user opens `/routes/ROUTE-109` at mobile viewport `390x844` THEN the `코스 시작` CTA SHALL be clickable by normal pointer input.
2. IF onboarding highlights `코스 시작` THEN the overlay SHALL not intercept the CTA click unless it immediately performs the equivalent course-start action.
3. WHEN the user presses `Escape` or activates a close/skip control THEN onboarding SHALL close and focus SHALL move to a meaningful page element.
4. WHEN onboarding has been dismissed once THEN reloading the same route detail page SHALL not re-block the same CTA in the same browser profile.

### Requirement 3: Onboarding controls must be accessible

**User Story:** As a keyboard and screen-reader user, I want onboarding to be understandable and dismissible.

#### Acceptance Criteria

1. WHEN onboarding is shown THEN it SHALL include an accessible name and visible close or skip control.
2. WHEN focus enters onboarding THEN tab order SHALL stay predictable and SHALL not trap the user without a documented exit.
3. IF the overlay uses `aria-modal="true"` THEN the modal behavior SHALL fully satisfy modal interaction expectations: focus trap, close action, restore focus, and no hidden interactive leakage.
4. IF the overlay is only a coach mark and not a real modal THEN it SHALL NOT use modal semantics that block underlying page interaction.

## Non-Functional Requirements

- First actionable route interaction SHOULD complete within 1 second after initial content render.
- The onboarding state persistence SHALL be deterministic and testable.
- The fix SHALL include regression coverage for desktop route-card click and mobile course-start click.

## Out of Scope

- Redesigning onboarding copy or illustration style.
- Changing route recommendation ranking.
