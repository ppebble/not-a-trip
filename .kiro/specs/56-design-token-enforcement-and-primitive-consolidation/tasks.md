# Implementation Plan

- [ ] 1. Create a repeatable raw semantic utility inventory
  - Add or document a scan command for admin, check-in, mobile, and profile surfaces.
  - Produce a baseline that distinguishes color/surface/shadow/state semantics from layout utilities.
  - _Requirements: 1, 2_

- [ ] 2. Define the Token_Enforcement_Gate behavior
  - Allow semantic token classes.
  - Keep layout, spacing, sizing, typography scale, responsive, and positioning utilities unblocked.
  - Decide report-only, baseline-delta, or blocking mode and document the mode switch condition.
  - _Requirements: 1, 2_

- [ ] 3. Map primitive ownership before migration
  - Identify existing or missing owners for status/severity badges, action buttons, empty/error panels, modal/card shells, and overlay/chrome controls.
  - Reject duplicate primitives unless they consolidate existing repeated usage.
  - _Requirements: 3_

- [ ] 4. Migrate the first high-priority surface
  - Start with admin status/severity/action patterns unless a safer smaller surface is explicitly justified.
  - Preserve existing behavior and accessibility states.
  - Add focused tests or usage evidence for changed primitive paths.
  - _Requirements: 3, 4, 5_

- [ ] 5. Migrate remaining hotspot surfaces in reviewable slices
  - Check-in surfaces must preserve Spec 55 like/comment/modal behavior.
  - Mobile overlay/chrome controls must preserve Spec 55 layering.
  - Profile surfaces must preserve Spec 49 community route behavior.
  - _Requirements: 4, 5_

- [ ] 6. Verify and classify completion status
  - Run the Token_Enforcement_Gate.
  - Run focused tests for changed surfaces.
  - Run `npm run type-check` and `npm run lint`.
  - Record Token_Enforcement_Gate and Primitive_Consolidation as `fixed`, `partially-fixed`, or `deferred`.
  - _Requirements: 1, 2, 3, 4, 5_
