# Spec 57 Completion Evidence

## Fixed

- Full Jest is now a release gate through `test:ci` and `release:check`.
- CI and feature-branch workflows no longer tolerate test failures with
  `continue-on-error: true`.
- Map test suites were rewritten against current Leaflet/markercluster behavior
  instead of stale source-string contracts.
- Landing proof-image tests now assert the current real-photo fallback contract
  without loading MongoDB/BSON internals.
- Mobile collapsed BottomSheet exposes an immediate accessible detail CTA.
- Seed sync tests no longer trigger the MongoDB seeding side effect on import.
- `/favicon.ico` is present under `public/`.
- Sign-in email/password inputs now declare browser autocomplete contracts.
- `OptimizedImage` skips optimization for GIF sources to preserve animated GIFs.

## Deferred With Rationale

- Existing `util._extend` deprecation warning is dependency-originated and was
  not reproduced as a first-party code path during Spec 57 remediation.
- Existing Jest console noise remains in unrelated legacy test doubles
  (`next/image` prop passthrough, dynamic loadable act warnings, route-map DOM
  prop passthrough). It does not fail the full suite or release-warning baseline,
  and cleaning it requires separate test-double cleanup beyond Spec 57's
  release-blocking scope.
- Existing lint warnings remain at or below the checked release baseline:
  production console 51, unused variables 22, other critical categories 0.

## Verification

- `npx jest --runInBand --runTestsByPath ...` for the repaired map,
  BottomSheet, and landing proof-image suites: 7 suites, 28 tests passed.
- `npm run design-token:check`: passed; mobile raw-token baseline unchanged.
- `npm run type-check`: passed.
- `npm run lint`: exit 0 with 73 existing warnings and 0 errors.
- `npm run lint:release`: passed with no release-critical warning regression.
- `npm run test:ci`: 99 suites, 403 tests passed; exit 0.
- `npm run release:check`: passed; includes lint, lint release, type-check,
  full Jest, and route budget.
- Route budget from `release:check`: shared 224 kB, `/spots/[id]` 303 kB,
  `/routes/[id]` 277 kB, `/gallery` 271 kB, `/map` 268 kB; all within budget.
