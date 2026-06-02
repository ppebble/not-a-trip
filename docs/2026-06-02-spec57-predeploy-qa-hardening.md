# Spec 57 — Pre-deploy QA Hardening Follow-ups

## Status

- State: proposed / ready for next implementation session
- Created: 2026-06-02
- Source evidence: local production `next start` + Chrome DevTools Protocol browser simulation + full Jest run
- Related branch at discovery time: `fix/map-spot-preview-stale-on-back`
- Related commit at discovery time: `660fbb6 fix(map): clear stale spot overlays before navigation`

## Problem Statement

All previously planned specs were completed, but pre-deploy usage simulation exposed release-blocking and UX follow-up work that is not yet implemented. The desktop map stale preview regression is fixed and verified, but the release path still has a broken test suite, branch policy risk, and mobile map interaction gaps.

Shipping without addressing these items would create a false green release: `release:check` passes while the full Jest suite fails and the CI test job may not block merges.

## Goals

1. Restore a trustworthy pre-deploy safety net.
2. Make the PR branch/process path valid for merge into `develop`.
3. Improve or explicitly validate mobile map spot-detail navigation.
4. Remove high-signal production polish issues found during browser simulation.
5. Preserve the verified desktop stale-preview behavior.

## Non-goals

- Do not redesign the map clustering model.
- Do not add new dependencies unless no existing tool can support the required test or QA fix.
- Do not re-open Spec 56 design-token decisions unless a failing test proves a direct regression.
- Do not expose or copy `.env.local` secret values into docs, commits, PRs, or logs.

## Required Work

### 1. Fix full Jest failures

Current command:

```bash
npm run test -- --runInBand
```

Current result from QA:

- Test Suites: 6 failed, 92 passed, 98 total
- Tests: 16 failed, 388 passed, 404 total

Failing areas to triage and fix:

- `src/components/map/__tests__/SpotPin.bug.test.tsx`
  - Tests inspect obsolete `handleMouseOver` / `handleMouseOut` implementation names.
  - Update tests to current map implementation or delete/replace brittle source-string assertions.
- `src/components/map/__tests__/SpotPin.preservation.test.tsx`
  - Fails with `TypeError: _leaflet.default.marker is not a function`.
  - Repair Leaflet mock setup or migrate assertions to `SpotMarkerLayer` behavior.
- `src/components/map/__tests__/spot-pin-coordinates.test.tsx`
  - Same Leaflet marker mock failure.
- `src/components/map/__tests__/PilgrimageMap.bug.test.tsx`
  - Fails with `ReferenceError: L is not defined` through `leaflet.markercluster` import.
- `src/components/map/__tests__/PilgrimageMap.preservation.test.tsx`
  - Same markercluster/global Leaflet setup failure.
- `src/components/landing/data/__tests__/fetchProofImages.test.ts`
  - Expected fallback/empty category arrays do not match current production-facing returned images.

Acceptance criteria:

- `npm run test -- --runInBand` passes locally.
- Test fixes prove current behavior instead of hardcoding obsolete implementation names.
- No map stale-preview regression is reintroduced.

### 2. Make release/CI gates honest

Discovery: `npm run release:check` passed while full Jest failed. CI also runs tests with `continue-on-error: true` in the current workflow, so failing tests may not block PRs.

Acceptance criteria:

- Decide and implement one of:
  - include a blocking test command in `release:check`, or
  - remove/justify `continue-on-error` for CI tests and document the release gate split.
- The final release path cannot silently ignore a failing full test suite unless explicitly documented as a temporary exception with owner and expiry.

### 3. Fix branch policy before PR/merge

Current branch at QA time:

```text
fix/map-spot-preview-stale-on-back
```

This does not match the workflow branch regex:

```text
^(feat|fix|ui|enhancement|chore|refactor|hotfix|test)/[0-9]+--[a-z0-9-]+$
```

Acceptance criteria:

- Before opening a PR, move work to a compliant branch name such as `fix/<issue-number>--map-spot-preview-stale-on-back` or a valid Spec 57 branch.
- Do not invent an issue number in PR text. If no issue exists, use the repository-approved placeholder process or create/link the real issue first.

### 4. Mobile map spot-detail UX validation/improvement

Desktop behavior is verified, but mobile simulation exposed two issues:

1. iOS Safari UA first visit to `/map` shows the iOS PWA install guide as a `role="dialog"`, blocking map interaction until dismissed.
2. After dismissing that guide, a real touch on a spot opens the BottomSheet in collapsed state with only name/address visible and no immediate detail CTA. Automated drag/touch expansion did not reveal the detail button.

Acceptance criteria:

- Manually validate on mobile viewport/device or improve implementation so a user can reliably reach spot detail after tapping a spot.
- If collapsed BottomSheet intentionally hides the CTA, provide a clear affordance and a tested expansion path.
- Ensure PWA install guide does not prevent first-time users from understanding or using the map.
- Add a regression test where practical for BottomSheet detail navigation cleanup:
  - open sheet for a spot,
  - navigate to detail,
  - go back,
  - assert no stale dialog/preview/selected spot remains.

### 5. Polish high-signal browser warnings

Observed during local production simulation:

- `/favicon.ico` returns 404.
- `/auth/signin` password input lacks recommended `autocomplete="current-password"`.
- Server log warns that animated GIF is being passed through Next Image optimization and should be `unoptimized`.
- `util._extend` deprecation warning appears during `next start` usage.
- Route budget is close to limit:
  - `/spots/[id]`: 302 kB / budget 310 kB
  - `/map`: 268 kB / budget 275 kB

Acceptance criteria:

- Fix the favicon and autocomplete warnings.
- Decide whether the GIF/Image and `util._extend` warnings are actionable in this repo; document if deferred.
- Do not increase `/map` or `/spots/[id]` First Load JS beyond current budgets.

## Already Verified and Must Preserve

From local production browser simulation:

- `/map` desktop marker hover opens preview.
- Preview detail click navigates to `/spots/REAL-ANI-003`.
- Browser back returns to `/map` with `tooltipCount: 0`.
- Desktop spot pin click navigates to detail and back with `tooltipCount: 0`.
- Key HTTP/API smoke had no 5xx responses.

## Recommended Verification Commands

```bash
npm run type-check
npm run lint
npm run release:check
npm run test -- --runInBand
npx jest --runInBand --runTestsByPath src/components/map/__tests__/spot-preview-required-info.test.tsx
```

For browser simulation, reuse or recreate the temporary CDP harness approach recorded in `.omx/ultraqa/` if available in the local workspace. Those artifacts are intentionally not tracked.

## Open Questions for Next Implementer

1. What issue number should be used for the compliant branch name?
2. Should full Jest become part of `release:check`, or should CI alone own that gate after removing `continue-on-error`?
3. Should the mobile BottomSheet show a detail CTA in collapsed state, or should the drag/expand affordance be strengthened and tested?
