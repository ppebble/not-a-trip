# Session Handoff — 2026-06-08 — QA Hardening Specs

## Branch and State

- Branch at handoff creation: `fix/888--qa-hardening`
- Base / target branch: merge `fix/888--qa-hardening` into `develop`, then merge
  `develop` into `main` per user request.
- Working tree at handoff creation: clean after commit `2dad593`.
- PR status: no PR opened from this local session; user requested direct Git branch
  management and merge propagation.

## Latest Commits

- `2dad593 fix(qa): harden route spots and scene upload validation` — fixes
  route spot availability fallback, accepts valid PNG despite unreliable browser MIME,
  captures persona QA findings, and creates feature-split requirements specs.
- This handoff commit — records continuation-critical state and the required spec
  execution order.

## Completed This Session

- Fixed route detail API availability classification so route spots are not all
  treated as lost when status aliases are missing or represented differently.
- Added `src/lib/route-spot-availability.ts` as the shared availability decision
  point and covered active/unavailable/null/unknown cases.
- Hardened scene image upload validation so actual PNG files can pass even when
  browser MIME is inaccurate, while binary mismatch remains rejectable.
- Updated scene upload modal client-side extension fallback so valid image files
  can reach server-side validation.
- Seeded/validation logic was expanded for researched route spot IDs and Uji
  facility spot IDs.
- Ran actual browser persona QA and wrote the report:
  `docs/qa/persona-service-qa-2026-06-08.md`.
- Split QA findings into feature-specific requirements specs under `.kiro/specs`.

## Required Spec Progression Order

Proceed in this exact order unless a blocking dependency proves impossible:

1. `.kiro/specs/qa-onboarding-course-flow/requirements.md`
   - Reason: onboarding currently blocks route card and `코스 시작` clicks, so real
     users cannot complete core route flows.
2. `.kiro/specs/qa-image-rendering-stability/requirements.md`
   - Reason: `/_next/image` 500s create broken visuals, noisy network failures,
     and distorted performance results.
3. `.kiro/specs/qa-authenticated-scene-upload/requirements.md`
   - Reason: real UI upload validation cannot be trusted until auth/session state
     is reliable after signup/login.
4. `.kiro/specs/qa-scene-file-format-validation/requirements.md`
   - Reason: after auth is stable, verify valid PNG acceptance and fake PNG
     rejection end-to-end through the UI.
5. `.kiro/specs/qa-performance-layout-stability/requirements.md`
   - Reason: performance/CLS measurements are polluted by image failures; fix
     image stability before final performance budgets.
6. `.kiro/specs/qa-accessibility-navigation/requirements.md`
   - Reason: semantic/focus cleanup should happen after layout and route flow
     fixes to avoid rework.
7. `.kiro/specs/qa-course-spot-availability/requirements.md`
   - Reason: initial code fix and regression tests exist; keep this last as a
     verification/pass-hardening slice unless new route data regressions appear.

## Verification Evidence

- `npm run type-check` — passed; proves TypeScript still compiles.
- `npm run lint` — passed; proves ESLint accepts current `src` changes.
- `npx jest src/lib/upload/validation.test.ts src/lib/route-spot-availability.test.ts --runInBand`
  — passed; 2 suites, 11 tests.
- Persona QA evidence retained under `.omx/ultraqa/artifacts/` and summarized in
  `docs/qa/persona-service-qa-2026-06-08.md`.

## Known Constraints / Do Not Re-open

- Do not treat browser-provided MIME as authoritative for upload acceptance.
  Binary signature remains the authority.
- Do not duplicate route spot availability rules in UI/API code. Use the shared
  helper.
- Do not claim full service QA readiness until the seven specs above are resolved
  and browser QA is rerun.
- `.kiro/specs` belongs to develop-oriented planning/work execution; if main is
  kept release-only later, remove or cherry-pick docs intentionally rather than
  merging blindly.

## Open Risks / Gaps

- Onboarding overlay still blocks real route interactions; requirements only,
  not fixed in this session.
- `/_next/image` still produces local dev 500s with
  `TypeError: handleRequest is not a function`; requirements only, not fixed.
- Authenticated scene upload still needs real browser end-to-end verification.
- Performance and accessibility issues are documented but not remediated.
- The user requested `develop` to `main` propagation despite workflow docs warning
  that develop-only planning docs may not always belong on main.

## Recommended Next Actions

1. Start with `qa-onboarding-course-flow` and add browser regression coverage for
   desktop route card click and mobile `코스 시작` click.
2. Fix image optimizer 500s before measuring final performance budgets.
3. Stabilize auth/session state for scene upload, then rerun PNG/fake-PNG browser
   upload QA.
4. After all specs are implemented, rerun persona QA and update
   `docs/qa/persona-service-qa-2026-06-08.md` or create a new dated report.

## Useful Commands for Next Session

```bash
git status -sb
git log --oneline -8
npm run type-check
npm run lint
npx jest src/lib/upload/validation.test.ts src/lib/route-spot-availability.test.ts --runInBand
```

## Notes for PR / Merge

- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- Commit convention: `docs/commit-convention.md`
- Git workflow: `docs/git-workflow.md`
- Commit `2dad593` follows conventional commit format with Lore-style trailers.
- Required merge path for this request: `fix/888--qa-hardening` -> `develop` ->
  `main`.
