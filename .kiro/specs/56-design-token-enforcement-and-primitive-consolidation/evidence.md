# Evidence - Spec 56 Design Token Enforcement and Primitive Consolidation

## Completion Classification

- Token_Enforcement_Gate: `fixed`.
- Primitive_Consolidation: `partially-fixed`.
- Remaining hotspot visual migrations: `deferred` behind a blocking baseline-delta gate.

This result is derived via logical deduction: the scanner output proves new raw semantic utility debt is blocked by baseline comparison, while the remaining existing counts prove full cross-surface migration is not complete and must not be claimed as fixed.

## Implemented Gate

- Command: `npm run design-token:scan`.
- Blocking command: `npm run design-token:check`.
- Baseline update command: `npm run design-token:update-baseline`.
- Baseline file: `config/design-token-raw-utility-baseline.json`.
- Scanner: `scripts/check-design-token-raw-utilities.mjs`.
- Covered surfaces:
  - `src/components/admin`
  - `src/components/checkin`
  - `src/components/mobile`
  - `src/components/profile`

## Current Baseline

- Total: 734 raw semantic utility findings.
- Admin: 300 findings in 13 files.
- Check-in: 198 findings in 8 files.
- Mobile: 53 findings in 5 files.
- Profile: 183 findings in 11 files.

## Primitive Ownership

- `AdminStatusBadge`: fixed owner for admin status/severity badge tones.
- `AdminActionButton`: defined owner for admin action button variants, not broadly migrated yet.
- Empty/error panels: deferred.
- Modal/card shells: deferred.
- Overlay/chrome controls: deferred.

## First Migration Slice

Admin status/severity badge raw palette classes were consolidated through `AdminStatusBadge` in:

- `src/components/admin/QualityReportSummaryCard.tsx`
- `src/components/admin/StatusReportSummaryCard.tsx`
- `src/components/admin/SupplementSummaryCard.tsx`

## Verification Log

- `npm run design-token:update-baseline`: passed; wrote baseline with total 734 findings.
- `npm run design-token:check`: passed; baseline-delta gate blocks increases.
- `npx jest --runInBand --runTestsByPath src/lib/design-token-raw-utility-scan.test.ts`: passed; scanner detects raw semantic utilities and ignores semantic/layout utilities.
- `npm run type-check`: passed after the migration.
- `npm run lint`: passed with the pre-existing 86 warnings recorded by prior release-gate handoff.
- `git diff --check`: passed.
- `node --check scripts/check-design-token-raw-utilities.mjs`: passed.

## Deferred Follow-up Boundary

Do not remove the baseline gate to make future visual migrations easier. Each follow-up slice must reduce or preserve counts and then update the baseline only after review.
