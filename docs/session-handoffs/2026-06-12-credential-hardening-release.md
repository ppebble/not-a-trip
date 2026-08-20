# Session Handoff — 2026-06-12 — Credential Hardening Release

## Branch and State

- Branch: `docs/902--credential-hardening-handoff`
- Base / target branch if known: `origin/develop`
- Working tree: handoff document in progress at creation time
- PR status:
  - develop PR #899 merged: <https://github.com/ppebble/not-a-trip/pull/899>
  - develop PR #900 merged: <https://github.com/ppebble/not-a-trip/pull/900>
  - main PR #901 merged: <https://github.com/ppebble/not-a-trip/pull/901>
  - handoff PR #902 closed: branch prefix `docs/` failed branch validation.
  - handoff PR #903 opened from `chore/902--credential-hardening-handoff`.

## Latest Commits

- `7ea5a27 Merge pull request #901` — main release merge for credential hardening and release gate restoration.
- `7411da6 fix(auth): block compromised passwords` — cherry-picked main release copy of develop commit `cfb0a22`; blocks compromised new passwords and adds password rotation.
- `cd57a59 fix(release): restore develop readiness gates` — cherry-picked main release copy of develop commit `cd93215`; restores local release gate coverage and removes admin token drift.
- `bab7930 Merge pull request #900` — develop merge for compromised password blocking.
- `ab2cdb0 Merge pull request #899` — develop merge for release readiness gate restoration.

## Completed This Session

- Investigated the browser warning: the “saved password / exposed in a data breach” message is a browser password-manager security warning, not an app modal.
- Rejected hiding or suppressing the browser warning because it is a real credential-risk signal.
- Added server-side Pwned Passwords k-anonymity range lookup:
  - sends only SHA-1 hash prefix, not the password and not the full hash.
  - includes a local denylist for obvious compromised passwords.
  - supports `PWNED_PASSWORD_CHECK=off` only for isolated local/dev cases.
  - supports `PWNED_PASSWORD_CHECK_STRICT=true` to fail closed when the breach API is unavailable.
- Blocked compromised new passwords in:
  - `POST /api/auth/register`
  - `POST /api/account/set-password`
  - `POST /api/account/change-password`
- Added account-management password rotation UI for users who already have a password.
- Restored release-readiness gates so `release:check` includes:
  - lint
  - lint release warnings
  - format check
  - design token check
  - route validation
  - seeded route validation
  - type-check
  - test:ci
  - route JS budget build
- Main release was intentionally built from `origin/main` and only cherry-picked the two operational commits:
  - `cd93215`
  - `cfb0a22`
- The full `develop` branch was not merged wholesale into `main`, avoiding `.kiro`/develop-only QA task documents in production history.

## Verification Evidence

- On develop after PR #899: `npm run release:check` — passed.
- On develop after PR #900: `npm run release:check` — passed.
- On main release branch before PR #901: `npm run release:check` — passed.
- On main after PR #901 merge: `npm run release:check` — passed.
- Main merge commit `7ea5a27` GitHub status:
  - Vercel — success.
  - `lint-and-test` — success.
- Post-merge local main state:
  - `main` and `origin/main` at `7ea5a27`.
  - 115 Jest suites passed.
  - 458 tests passed.
  - route JS budget passed with no build warnings.

## Known Constraints / Do Not Re-open

- Do not suppress browser password-manager breach warnings. They are controlled by the user’s browser and are security-positive.
- Do not send plaintext passwords or full password hashes to third-party services.
- Do not raise design-token baselines to hide new raw utility drift.
- Do not merge all of `develop` into `main` without filtering; project workflow says main PRs should contain production code, release verification code, and required operational docs only.
- Actual dated handoff files belong on `develop`; keep production `main` focused on runtime code and release verification.

## Open Risks / Gaps

- If the previously used password produced a browser breach warning, that account still needs the user to rotate to a unique password through profile account management.
- If production must fail closed on breach API outage, set `PWNED_PASSWORD_CHECK_STRICT=true` in deployment env.
- Previous session output exposed a GitHub credential value in tool output. If not already rotated, rotate/revoke it; do not copy the value into docs or chat.
- No browser-automation E2E harness exists in this repo, so browser password-manager UI behavior cannot be automated here.

## Recommended Next Actions

1. Confirm production environment variables:
   - keep `PWNED_PASSWORD_CHECK` unset or enabled.
   - decide whether `PWNED_PASSWORD_CHECK_STRICT=true` is appropriate for production.
2. Manually smoke-test production:
   - sign in with a known account.
   - navigate to profile account management.
   - verify password change form renders for password-backed accounts.
   - verify a known compromised candidate such as `password123` is rejected on signup/password change.
3. Rotate any GitHub token that may have appeared in terminal/chat output if this has not already been done.

## Useful Commands for Next Session

```bash
git status -sb
git log --oneline -8
git switch main
git pull --ff-only origin main
npm run release:check
```

## Notes for PR / Merge

- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- Commit convention: `docs/commit-convention.md`
- Git workflow: `docs/git-workflow.md`
- Handoff runbook: `docs/session-handoffs/README.md`
