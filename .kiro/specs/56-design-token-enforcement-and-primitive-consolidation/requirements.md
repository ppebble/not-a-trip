# Requirements Document

## Introduction

Spec 52 intentionally fixed global focus and reduced-motion behavior while deferring broad design-token enforcement. This spec converts that deferral into an implementation track for raw utility enforcement and primitive consolidation.

This result is derived via logical deduction: `.kiro/specs/52-design-system-motion-focus-hardening/token-audit.md` proves raw palette and one-off shadow/state utility usage remains widespread across admin, check-in, mobile, and profile surfaces. A safe fix needs its own spec because replacing those patterns touches repeated UI semantics, review rules, and potentially many components.

## Source Evidence

- Spec 52 token audit: `.kiro/specs/52-design-system-motion-focus-hardening/token-audit.md`.
- Affected hotspot surfaces:
  - `src/components/admin`
  - `src/components/checkin`
  - `src/components/mobile`
  - `src/components/profile`
- Existing semantic token sources:
  - `src/app/globals.css`
  - `tailwind.config.ts`
- Related completed hardening:
  - Spec 52 global focus visibility.
  - Spec 52 reduced-motion coverage.

## Glossary

- **Token_Enforcement_Gate**: local or CI-executable check that reports or blocks banned raw semantic utility classes outside approved primitive/token boundary files.
- **Raw_Semantic_Utility**: Tailwind color/surface/shadow/state utility using raw palettes or one-off styling where a semantic token or primitive should own the meaning.
- **Allowed_Layout_Utility**: Tailwind utility for spacing, layout, sizing, typography scale, grid/flex, responsive behavior, or non-semantic positioning that must not be blocked by token enforcement.
- **Primitive_Owner**: reusable component or module responsible for one UI semantic such as status badge, action button, empty/error panel, modal/card shell, or overlay/chrome control.
- **Migration_Baseline**: measured inventory of existing raw utility debt used to prevent new debt while existing debt is migrated.

## Requirements

### Requirement 1: raw utility inventory must be executable

**User Story:** As a design-system maintainer, I want raw semantic utility usage to be measured by a repeatable command, so that token drift cannot hide in code review.

#### Acceptance Criteria

1. THE implementation SHALL add or document a local command that scans component `className` usage for Raw_Semantic_Utility patterns.
2. THE scan SHALL cover at least admin, check-in, mobile, and profile surfaces.
3. THE scan SHALL distinguish Raw_Semantic_Utility from Allowed_Layout_Utility.
4. THE scan SHALL produce a baseline report or structured output suitable for CI comparison.
5. THE final summary SHALL record the current baseline and command used.

---

### Requirement 2: token enforcement must start without destabilizing existing release debt

**User Story:** As a release owner, I want new raw semantic utility debt to be blocked or flagged without forcing an unsafe all-at-once refactor.

#### Acceptance Criteria

1. IF fixed now, THEN THE Token_Enforcement_Gate SHALL either block new violations or fail when baseline counts increase.
2. IF enforcement starts in report-only mode, THEN THE follow-up SHALL specify the exact condition for switching to blocking mode.
3. THE gate SHALL allow semantic token classes such as `primary`, `secondary`, `sunset`, `surface`, `accent-surface`, `background`, `main-text`, `sub-text`, `muted`, `border`, `danger`, and `danger-surface`.
4. THE gate SHALL NOT block Allowed_Layout_Utility usage.
5. THE implementation SHALL NOT globally weaken ESLint, TypeScript, React Hooks, or accessibility rules to pass the gate.

---

### Requirement 3: primitive ownership must be defined before broad migration

**User Story:** As a frontend contributor, I want repeated UI semantics to have clear primitive owners, so that migrations do not replace raw classes with duplicated abstractions.

#### Acceptance Criteria

1. THE remediation SHALL identify Primitive_Owner targets for status/severity badges, action buttons, empty/error panels, modal/card shells, and overlay/chrome controls.
2. THE implementation SHALL reuse existing primitives when they already cover the semantic role.
3. THE implementation SHALL NOT add a duplicate Button, Card, Badge, or EmptyState primitive without consolidating at least one existing repeated pattern.
4. THE final summary SHALL list which primitive owners are fixed, partially fixed, or deferred.
5. Any new primitive SHALL include focused tests or usage evidence proving behavior did not regress.

---

### Requirement 4: migration must proceed surface by surface

**User Story:** As a reviewer, I want token migration split into reviewable surfaces, so that visual regressions can be isolated.

#### Acceptance Criteria

1. THE implementation SHALL migrate one surface at a time or explicitly document why multiple surfaces are safe in one change.
2. Admin severity/status controls SHALL be treated as a high-priority surface because the Spec 52 audit found the largest hotspot count there.
3. Check-in social/detail surfaces SHALL preserve Spec 55 behavior while migrating visual classes.
4. Mobile overlay/chrome controls SHALL preserve z-index and modal layering behavior from Spec 55.
5. Profile cards and activity surfaces SHALL preserve community route behavior from Spec 49.

---

### Requirement 5: verification must include visual and automated evidence

**User Story:** As a release reviewer, I want token enforcement and primitive consolidation verified by tests and targeted manual checks, so that style cleanup does not break interaction semantics.

#### Acceptance Criteria

1. THE implementation SHALL run the Token_Enforcement_Gate after migration.
2. THE implementation SHALL run focused tests for any changed primitive or migrated surface.
3. THE implementation SHALL run `npm run type-check` and `npm run lint`.
4. IF UI visuals change materially, THEN THE final evidence SHALL include targeted manual pages or screenshots to inspect.
5. THE final summary SHALL classify Token_Enforcement_Gate and Primitive_Consolidation status as `fixed`, `partially-fixed`, or `deferred`.
