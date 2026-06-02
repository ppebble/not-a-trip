# Session Handoff — 2026-06-02 — Pre-deploy QA and Spec 57

## Branch and State

- Branch: `fix/map-spot-preview-stale-on-back`
- Base / target branch if known: `develop`
- Working tree at handoff creation: docs-only changes for Spec 57 and this handoff are expected before commit.
- PR status: no PR opened for `fix/map-spot-preview-stale-on-back` in this session.
- Process risk: current branch name does **not** satisfy the PR branch validation regex requiring `type/number--slug`.

## Latest Commits

- `660fbb6 fix(map): clear stale spot overlays before navigation` — fixes the reported stale map preview/modal after navigating to spot detail and returning.
- `68d6052 Merge PR #881: enforce token utility baseline` — merged Spec 56 design-token enforcement into `develop`; current fix branch is based on this merge.
- `b772560 feat(design-system): enforce token utility baseline` — implementation commit for Spec 56.

## Completed This Session

- Ran pre-deploy QA after the user requested real web-service usage simulation.
- Confirmed `npm run release:check` passes locally.
- Started local production server with `npm start` / `next start` and drove Chrome headless through CDP.
- Verified desktop map stale-preview regression is fixed:
  - hover marker preview → detail → browser back leaves `tooltipCount: 0`,
  - spot pin click → detail → browser back leaves `tooltipCount: 0`.
- Ran HTTP/API/page smoke checks against local production server; no 5xx responses were found.
- Identified unresolved release risks:
  - full Jest suite fails,
  - CI/release gate may not block failing tests,
  - branch name violates PR validation,
  - mobile map first-visit and BottomSheet detail-entry UX need follow-up.
- Created new follow-up spec:
  - `docs/2026-06-02-spec57-predeploy-qa-hardening.md`

## Verification Evidence

- `npm run release:check` — passed; proves lint/type-check/build route-budget release gate currently passes.
- `npm start` with local production server — passed; Next.js 15.5.9 served on port 3000.
- Chrome CDP browser simulation — passed for desktop map stale-preview regression; artifacts were written under ignored `.omx/ultraqa/`.
- HTTP/API smoke — no 5xx responses; expected/client-side 4xx observed for routes such as unauthenticated or missing-parameter APIs.
- `npm run test -- --runInBand` — failed: 6 suites failed, 16 tests failed, 388 passed, 404 total.
- Process cleanup — local Next/Chrome QA processes were stopped; ports 3000 and 9222 were false after cleanup.

## Known Constraints / Do Not Re-open

- Do not reintroduce stale preview behavior on desktop map navigation.
- Do not copy `.env.local` values into docs, commits, PR bodies, or handoffs. The QA session confirmed `.env.local` exists and is ignored; secret values must remain unquoted.
- Do not treat `release:check` passing as enough for deployment until full Jest or CI gating is fixed.
- Do not open a PR from the current branch name without first fixing the branch naming violation.
- Do not replace behavior-focused map tests with brittle source-string assertions against obsolete function names.

## Open Risks / Gaps

- Full Jest remains red:
  - `SpotPin.bug.test.tsx` expects obsolete function names.
  - `SpotPin.preservation.test.tsx` and `spot-pin-coordinates.test.tsx` have Leaflet mock failures.
  - `PilgrimageMap.bug/preservation.test.tsx` fail through markercluster/global `L` setup.
  - `fetchProofImages.test.ts` expectations no longer match current returned production images/fallbacks.
- CI appears capable of ignoring test failures via `continue-on-error`; verify and fix before relying on PR checks.
- Mobile map UX needs manual/device confirmation or implementation work:
  - iOS PWA install guide blocks first map interaction as a dialog.
  - collapsed BottomSheet after spot tap does not expose a detail CTA in automation.
- Minor production polish remains:
  - `/favicon.ico` 404,
  - signin password autocomplete warning,
  - animated GIF optimization warning,
  - `util._extend` deprecation warning,
  - `/map` and `/spots/[id]` route budgets are close to limits.

## Recommended Next Actions

1. Start Spec 57 from `docs/2026-06-02-spec57-predeploy-qa-hardening.md`.
2. Fix the Jest failures first; do not chase mobile UX before the safety net is trustworthy.
3. Make CI/release test gating honest: either block on Jest in CI or add the correct test command to `release:check`.
4. Rename or recreate the branch using a valid `fix/<issue-number>--...` pattern before opening a PR.
5. Re-run desktop map CDP/manual regression after any map test or BottomSheet changes.

## Useful Commands for Next Session

```bash
git status -sb
git log --oneline -8
npm run type-check
npm run lint
npm run release:check
npm run test -- --runInBand
npx jest --runInBand --runTestsByPath src/components/map/__tests__/spot-preview-required-info.test.tsx
```

## Notes for PR / Merge

- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- Commit convention: `docs/commit-convention.md`
- Git workflow: `docs/git-workflow.md`
- Current branch name violates workflow regex; fix before PR.
- If committing only Spec 57 and this handoff, use a docs commit and include Lore-style trailers because repository instructions require it.
