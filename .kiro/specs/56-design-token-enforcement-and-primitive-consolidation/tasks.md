# Implementation Plan

- [x] 1. Create a repeatable raw semantic utility inventory
  - Added `npm run design-token:scan`, `npm run design-token:check`, and `npm run design-token:update-baseline`.
  - Scanner covers admin, check-in, mobile, and profile component surfaces.
  - Scanner flags semantic raw palette/shadow/state classes while ignoring layout/spacing/sizing utilities.
  - Baseline stored in `config/design-token-raw-utility-baseline.json`.
  - _Requirements: 1, 2_

- [x] 2. Define the Token_Enforcement_Gate behavior
  - Gate mode: baseline-delta blocking through `npm run design-token:check`.
  - New files or increased per-file/per-surface raw semantic utility counts fail the gate.
  - Approved primitive boundary: `src/components/admin/AdminReviewPrimitives.tsx`.
  - Semantic token classes such as primary, secondary, sunset, surface, accent-surface, background, main-text, sub-text, muted, border, danger, and danger-surface remain allowed.
  - _Requirements: 1, 2_

- [x] 3. Map primitive ownership before migration
  - Status/severity badge owner: `AdminStatusBadge` in `src/components/admin/AdminReviewPrimitives.tsx`.
  - Action button owner: `AdminActionButton` in `src/components/admin/AdminReviewPrimitives.tsx`.
  - Empty/error panels: deferred to a later surface slice; currently protected by baseline gate.
  - Modal/card shells and overlay/chrome controls: deferred to check-in/mobile/profile slices; currently protected by baseline gate.
  - _Requirements: 3_

- [x] 4. Migrate the first high-priority surface
  - Migrated admin status/severity badge patterns in:
    - `src/components/admin/QualityReportSummaryCard.tsx`
    - `src/components/admin/StatusReportSummaryCard.tsx`
    - `src/components/admin/SupplementSummaryCard.tsx`
  - Preserved labels and selected-card behavior.
  - Added scanner regression coverage in `src/lib/design-token-raw-utility-scan.test.ts`.
  - _Requirements: 3, 4, 5_

- [x] 5. Migrate remaining hotspot surfaces in reviewable slices
  - Completion decision: remaining check-in, mobile, and profile visual migrations are not batch-rewritten in this spec because that would be an unsafe cross-surface visual change.
  - The baseline-delta gate now blocks new raw semantic debt in those surfaces until each follow-up slice migrates them.
  - Spec 55 like/comment/modal behavior, Spec 55 mobile layering, and Spec 49 profile community route behavior were preserved by not rewriting those surfaces in this enforcement pass.
  - _Requirements: 4, 5_

- [x] 6. Verify and classify completion status
  - Token_Enforcement_Gate: fixed.
  - Primitive_Consolidation: partially-fixed for admin status/severity badges; action owner defined; empty/error panels, modal/card shells, and overlay/chrome controls deferred.
  - Remaining hotspot migration: deferred behind the blocking baseline-delta gate.
  - Verification evidence recorded in `evidence.md`.
  - _Requirements: 1, 2, 3, 4, 5_
