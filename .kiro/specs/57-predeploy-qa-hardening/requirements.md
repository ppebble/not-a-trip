# Requirements Document

## Introduction

Spec 57 turns the pre-deploy QA handoff into a release-blocking remediation track. The previous session verified that the desktop map stale-preview regression is fixed, but it also exposed a dangerous false-green path: `npm run release:check` passes while the full Jest suite fails, CI currently tolerates test failures, the branch was created without a trustworthy issue number, and mobile map detail navigation still has unresolved usability risk.

This result is derived via logical deduction: the handoff and QA follow-up document record production-browser evidence, full-test failure counts, CI `continue-on-error` risk, and branch-policy mismatch. Those facts make Spec 57 a cross-cutting pre-deploy hardening spec rather than a narrow map bugfix.

## Source Evidence

- GitHub issue: #882 (https://github.com/ppebble/not-a-trip/issues/882).
- Current branch: `fix/882--predeploy-qa-hardening`.

- Handoff: `docs/session-handoffs/2026-06-02-predeploy-qa-spec57.md`.
- QA follow-up: `docs/2026-06-02-spec57-predeploy-qa-hardening.md`.
- Branch validation workflow: `.github/workflows/feature-branch.yml`.
- Existing release gate shape: `package.json` scripts and `npm run release:check` evidence from the handoff.
- Desktop stale-preview fix evidence:
  - `660fbb6 fix(map): clear stale spot overlays before navigation`.
  - Browser back from `/spots/REAL-ANI-003` to `/map` leaves `tooltipCount: 0`.
- Known failing full-suite command from handoff:
  - `npm run test -- --runInBand`.

## Glossary

- **False_Green_Release**: a release state where the documented release command passes but known correctness tests or CI checks can still fail silently.
- **Full_Jest_Gate**: an executable full Jest command that must fail the local or CI release path when tests fail.
- **Branch_Issue_Contract**: the repository rule that PR branches must use `type/{issue-number}--{slug}` and must not invent an issue number.
- **Map_Navigation_Cleanup**: behavior that clears selected spot, hover preview, tooltip/modal state, and stale overlays when navigating from map to spot detail and back.
- **Mobile_Detail_Affordance**: a visible or reliably reachable path from a tapped mobile map spot to the spot detail page.
- **Production_Polish_Warning**: a browser/server warning found during production simulation that can mislead users, degrade UX, or hide deployment defects.

## Requirements

### Requirement 1: full Jest failures must be repaired before release readiness is claimed

**User Story:** As a release owner, I want the full Jest suite to pass, so that release readiness cannot be claimed while known regressions remain red.

#### Acceptance Criteria

1. THE remediation SHALL run `npm run test -- --runInBand` and capture the final pass/fail result.
2. THE remediation SHALL repair the failing map test areas recorded in the handoff without relying on obsolete source-string assertions such as old handler names.
3. THE remediation SHALL repair Leaflet and markercluster mock failures by testing current behavior or by replacing brittle implementation-coupled tests with stable behavior assertions.
4. THE remediation SHALL update `fetchProofImages` expectations to match the current production-facing image fallback contract, or SHALL change the implementation only if the existing behavior is proven wrong.
5. THE final release-readiness summary SHALL NOT claim test readiness unless the full Jest command passes or a documented blocker explicitly prevents execution.

---

### Requirement 2: CI and release commands must not allow known test failures to pass silently

**User Story:** As a maintainer, I want the CI/release gate to fail on release-critical tests, so that broken tests cannot be hidden behind a passing `release:check`.

#### Acceptance Criteria

1. THE remediation SHALL inspect the current CI test job and release scripts before changing gate behavior.
2. IF CI owns the Full_Jest_Gate, THEN failing Jest tests SHALL fail the PR check for branches targeting `develop`.
3. IF `release:check` owns the Full_Jest_Gate, THEN `npm run release:check` SHALL include a blocking test command or an explicitly documented equivalent.
4. THE remediation SHALL NOT use `continue-on-error: true` for release-critical tests unless a temporary exception includes owner, expiry, and visible risk documentation.
5. THE final evidence SHALL state which command or CI job now blocks False_Green_Release.

---

### Requirement 3: branch and issue linkage must be made honest before PR work

**User Story:** As a reviewer, I want the branch name and PR issue link to reference a real issue, so that process automation and audit history are not polluted by invented numbers.

#### Acceptance Criteria

1. THE work SHALL have a real GitHub issue before opening a PR.
2. THE branch SHALL follow `^(feat|fix|ui|enhancement|chore|refactor|hotfix|test)/[0-9]+--[a-z0-9-]+$` with the actual issue number.
3. THE PR body SHALL use the actual issue number in the `Closes #...` field.
4. THE remediation SHALL NOT use Spec number `57` as an issue number unless GitHub issue `#57` is proven to be the current Spec 57 issue.
5. IF issue creation is blocked by missing credentials, THEN THE issue title/body SHALL be preserved locally and the branch SHALL NOT be renamed to another invented number.

---

### Requirement 4: desktop map stale-preview behavior must stay fixed

**User Story:** As a map user, I want returning from spot detail to leave the map clean, so that stale previews or overlays do not point to the wrong spot.

#### Acceptance Criteria

1. GIVEN a desktop user hovers a marker preview and opens spot detail, WHEN the user navigates back to `/map`, THEN no stale tooltip, preview, modal, or selected spot overlay SHALL remain.
2. GIVEN a desktop user clicks a spot pin and opens spot detail, WHEN the user navigates back to `/map`, THEN no stale tooltip, preview, modal, or selected spot overlay SHALL remain.
3. THE remediation SHALL preserve or add a regression test for Map_Navigation_Cleanup where practical.
4. THE remediation SHALL NOT replace the verified desktop behavior with source-string assertions against obsolete function names.
5. THE final verification SHALL include either focused automated map tests or a documented browser simulation equivalent.

---

### Requirement 5: mobile map detail navigation must be reliable and understandable

**User Story:** As a mobile user, I want a clear path from tapping a map spot to opening spot detail, so that mobile map exploration is not blocked by dialogs or hidden BottomSheet actions.

#### Acceptance Criteria

1. GIVEN a first-time iOS Safari or iOS PWA-like visit to `/map`, WHEN the install guide appears, THEN the user SHALL be able to dismiss it and understand how to continue using the map.
2. GIVEN a mobile user taps a spot, THEN a visible detail CTA SHALL appear immediately or a clear, tested expansion affordance SHALL expose it reliably.
3. IF the collapsed BottomSheet intentionally hides detail actions, THEN the implementation SHALL provide an accessible cue and a tested expand path.
4. THE remediation SHALL validate mobile map detail navigation in a mobile viewport, device simulation, or manual device check.
5. THE remediation SHALL ensure map/detail/back navigation does not leave stale mobile dialog, preview, selected spot, or BottomSheet state.

---

### Requirement 6: high-signal production warnings must be fixed or explicitly deferred

**User Story:** As a production operator, I want high-signal browser and server warnings handled before deployment, so that launch polish problems are not ignored as noise.

#### Acceptance Criteria

1. THE remediation SHALL fix `/favicon.ico` returning 404 or document why another favicon path is intentionally sufficient.
2. THE remediation SHALL add `autocomplete="current-password"` or an equivalent correct autocomplete contract to the signin password input.
3. THE remediation SHALL decide whether the animated GIF optimization warning is actionable in this repo, and SHALL fix or defer it with rationale.
4. THE remediation SHALL decide whether the `util._extend` deprecation warning is actionable in this repo, and SHALL fix or defer it with rationale.
5. THE remediation SHALL avoid increasing `/map` or `/spots/[id]` First Load JS beyond the current route budgets recorded in the handoff without explicit evidence and justification.

---

### Requirement 7: verification evidence must match the changed risk surface

**User Story:** As a final reviewer, I want each Spec 57 claim backed by the smallest sufficient command or browser evidence, so that no part of the release-hardening story is asserted without proof.

#### Acceptance Criteria

1. THE final verification SHALL include `npm run type-check` and `npm run lint` after implementation changes.
2. THE final verification SHALL include `npm run test -- --runInBand` unless blocked by an explicitly recorded environment failure.
3. THE final verification SHALL include `npm run release:check` after release-gate changes.
4. IF map or mobile UX behavior changes, THEN THE final verification SHALL include focused automated tests, browser simulation, or manual device evidence for those flows.
5. THE final summary SHALL list fixed, partially fixed, deferred, and blocked Spec 57 items separately.
