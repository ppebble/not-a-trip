# Requirements: Performance and Layout Stability

## Source

- QA report: `docs/qa/persona-service-qa-2026-06-08.md`
- Evidence:
  - `.omx/ultraqa/artifacts/persona-service-qa-run.json`

## Problem Statement

Key pages exceed acceptable real-user loading thresholds and `/routes` shows high cumulative layout shift. The spot detail page also transfers a large amount of data during normal browsing. These issues create slow, unstable perceived UX.

## Measured Baseline

| Page | Status | Load time | CLS | Long tasks | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/welcome` | 200 | 2193ms | 0.070 | 3 | about 5.67MB |
| `/map` | 200 | 6559ms | 0.000 | 2 | variable |
| `/contents` | 200 | 5902ms | 0.033 | 4 | variable |
| `/routes` | 200 | 5740ms | 0.232 | 2 | variable |
| `/spots/REAL-ANI-050` | 200 | 4044ms | 0.034 | 3 | about 25MB |

## User Stories

- As a mobile traveler, I want route and map pages to become usable quickly so that I can use them on-site.
- As a route browser, I want cards and filters not to jump while loading so that I do not mis-tap.
- As a data-constrained user, I want spot detail pages to avoid excessive image/data transfer.

## Requirements

### Requirement 1: Core pages must meet interactive load targets

**User Story:** As a visitor, I want primary pages to load fast enough for real use.

#### Acceptance Criteria

1. WHEN a user loads `/routes` on a normal broadband development baseline THEN the page SHALL reach usable state within 3 seconds after navigation start.
2. WHEN a user loads `/map` THEN primary controls and map shell SHALL reach usable state within 3 seconds, with non-critical data deferred.
3. WHEN a user loads `/contents` THEN the initial content list shell SHALL reach usable state within 3 seconds.
4. WHEN a user loads `/spots/REAL-ANI-050` THEN primary spot title, location summary, and first meaningful visual SHALL reach usable state within 3 seconds.

### Requirement 2: Routes page CLS must be controlled

**User Story:** As a route browser, I want the page layout to remain stable while cards and images load.

#### Acceptance Criteria

1. WHEN `/routes` is loaded and route cards/images populate THEN cumulative layout shift SHALL remain below 0.1.
2. WHEN images are pending THEN cards SHALL reserve stable dimensions using explicit width/height, aspect-ratio, or skeleton containers.
3. WHEN filters, headers, or route metadata hydrate THEN they SHALL not push already-visible interactive elements unexpectedly.
4. WHEN automated QA measures CLS for `/routes` THEN values at or above 0.1 SHALL fail the quality gate.

### Requirement 3: Spot detail transfer size must be bounded

**User Story:** As a spot detail viewer, I want the page not to download excessive media by default.

#### Acceptance Criteria

1. WHEN `/spots/REAL-ANI-050` loads initially THEN non-critical images SHALL be lazy-loaded below the fold.
2. WHEN responsive images are used THEN the requested dimensions SHALL match viewport needs rather than original oversized assets.
3. WHEN the initial spot detail transfer exceeds an agreed budget THEN automated QA SHALL report the page as failing.
4. WHEN image loading fails THEN retries SHALL be bounded and SHALL not amplify transfer cost.

### Requirement 4: Long tasks must be minimized

**User Story:** As a mobile user, I want pages to stay responsive during hydration.

#### Acceptance Criteria

1. WHEN `/welcome`, `/routes`, `/contents`, `/map`, and spot detail pages hydrate THEN avoidable long tasks SHALL be reduced.
2. IF large client-only work is required THEN it SHALL be split, deferred, or moved server-side where appropriate.
3. WHEN automated QA records long tasks THEN regressions SHALL be visible in the report.

## Non-Functional Requirements

- Performance budgets SHALL be documented next to the implementation or test that enforces them.
- Fixes SHALL prioritize removing unnecessary transfer and layout instability before adding new loading UI.
- Performance work SHALL not hide functional errors behind skeleton screens.

## Out of Scope

- Production CDN tuning that cannot be verified locally.
- Full rewrite of map provider integration.
