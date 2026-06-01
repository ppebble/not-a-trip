# Implementation Plan

- [x] 1. Recover current launch state and confirm spec ordering
  - Confirm `develop` already contains Spec 55 merge evidence.
  - Confirm Spec 52 has requirements but no task artifact before implementation.
  - _Requirements: 1, 2, 3, 4_

- [x] 2. Harden global focus visibility
  - Replace broad focus-outline removal with keyboard-safe `:focus-visible` coverage for interactive elements.
  - Preserve a non-visible mouse-focus suppression path without removing keyboard indicators.
  - Add regression coverage that rejects broad `*:focus { outline: none; }` returning without a replacement.
  - _Requirements: 3_

- [x] 3. Harden global reduced-motion behavior
  - Inventory global animation utilities in `src/app/globals.css`.
  - Ensure every global animation utility is disabled or simplified under `prefers-reduced-motion: reduce`.
  - Preserve non-motion layout and visibility state.
  - _Requirements: 4_

- [x] 4. Track design-token drift and enforcement explicitly
  - Audit raw palette, shadow, and one-off state utility hotspots in profile, check-in, mobile overlay, and admin surfaces.
  - Document risk, owner, enforcement mechanism, and remaining unenforced scope instead of pretending a broad refactor fits this release slice.
  - Avoid adding duplicate primitives.
  - _Requirements: 1, 2_

- [x] 5. Verify Spec 52 completion
  - Run targeted tests for focus, motion, and token-tracking contracts.
  - Run type-check and lint.
  - Final status must classify Design_Token_Contract, Focus_Visibility_Contract, and Reduced_Motion_Contract.
  - _Requirements: 1, 2, 3, 4_