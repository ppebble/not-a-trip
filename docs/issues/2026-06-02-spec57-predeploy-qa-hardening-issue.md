# GitHub Issue #882 — Spec 57 Pre-deploy QA Hardening

Title: [Fix] Task 57 - Pre-deploy QA hardening and false-green release gate cleanup
URL: https://github.com/ppebble/not-a-trip/issues/882
Branch: fix/882--predeploy-qa-hardening
Labels: fix, priority: high, status: in-progress

## 작업 내용

Pre-deploy production-browser QA found that the desktop map stale-preview regression is fixed, but the release path is still unsafe: full Jest is red, CI can ignore test failures, the branch used a Spec number instead of a proven issue number, and mobile map detail navigation still has unresolved UX risk.

### 하위 작업

- [ ] Restore full Jest pass for known failing map and image tests.
- [ ] Make CI or `release:check` block release-critical Jest failures.
- [ ] Working branch renamed to `fix/882--predeploy-qa-hardening` after issue creation.
- [ ] Preserve desktop map stale-preview cleanup after map → spot detail → back.
- [ ] Validate or improve mobile map spot-detail navigation and BottomSheet CTA affordance.
- [ ] Fix or explicitly defer production-polish warnings: favicon 404, signin autocomplete, GIF optimization, `util._extend` warning, route budget pressure.

### Requirements

- 1: Full Jest failures must be repaired before release readiness is claimed.
- 2: CI and release commands must not allow known test failures to pass silently.
- 3: Branch and issue linkage must be made honest before PR work.
- 4: Desktop map stale-preview behavior must stay fixed.
- 5: Mobile map detail navigation must be reliable and understandable.
- 6: High-signal production warnings must be fixed or explicitly deferred.
- 7: Verification evidence must match the changed risk surface.

### 구현 참고사항

- Source handoff: `docs/session-handoffs/2026-06-02-predeploy-qa-spec57.md`.
- Follow-up doc: `docs/2026-06-02-spec57-predeploy-qa-hardening.md`.
- Requirements doc: `.kiro/specs/57-predeploy-qa-hardening/requirements.md`.
- Do not treat Spec number `57` as the GitHub issue number. GitHub #57 is an old merged PR, not this task.
- Do not expose `.env.local` values in issue, PR, commits, or handoffs.

### 완료 조건

- [ ] `npm run test -- --runInBand` passes locally or an explicit environment blocker is documented.
- [ ] CI/release gate no longer creates a false-green release path for known test failures.
- [ ] Branch and PR use GitHub issue #882.
- [ ] Desktop map stale-preview cleanup remains verified.
- [ ] Mobile map detail navigation is verified or improved.
- [ ] `npm run type-check`, `npm run lint`, and `npm run release:check` evidence is recorded.
