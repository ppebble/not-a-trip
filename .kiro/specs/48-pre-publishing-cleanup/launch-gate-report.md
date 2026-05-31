# Launch Gate Report - Spec 48 Pre-Publishing Cleanup

## Summary

- Status: `ready-with-deferrals`
- Date: 2026-06-01
- Branch: `develop`
- Scope: publishing readiness cleanup only; no unrelated feature expansion.
- Decision: no unresolved Release_Blocker remains after this pass. Publish can proceed after production environment values are set and deferred warning cleanup is accepted.

## Changed Files

- `.env.example`
  - Added every non-internal environment variable currently referenced by runtime/scripts.
  - Documented production HTTPS URL expectations and optional operational integrations without exposing secrets.
- `next.config.ts`
  - Removed Wikimedia, Peakpx, and WallpaperBetter image hotlink hosts from production `images.remotePatterns`.
- `src/components/landing/data/proofData.ts`
  - Replaced external hotlink/category-icon proof-card images with controlled local assets and matching public-facing card copy.
- `src/components/landing/data/showcaseCards.ts`
  - Removed Sherlock/Baker Street Wikimedia hotlink fallback from showcase cards.
- `src/components/landing/data/categoryStories.ts`
  - Removed Sherlock/Baker Street Wikimedia hotlink fallback from category story imagery.
- `.kiro/specs/48-pre-publishing-cleanup/requirements.md`
  - Added release cleanup requirements.
- `.kiro/specs/48-pre-publishing-cleanup/tasks.md`
  - Added and completed execution checklist for this pass.
- `.kiro/specs/48-pre-publishing-cleanup/launch-gate-report.md`
  - This evidence report.

## Finding Classification

| Finding | Classification | Resolution |
| --- | --- | --- |
| `.env.example` missed variables used by runtime/scripts (`MONGODB_DB`, VAPID, ops alerts, Sentry webhook, moderation, local agent helper vars) | `must-fix-before-publish` | Added placeholders/documentation; no real secrets committed. |
| Production image config still allowed Wikimedia and wallpaper-style hotlink hosts | `blocker` | Removed those hosts from `next.config.ts`; validator test now passes. |
| Landing proof/showcase/category story data referenced external Wikimedia images | `must-fix-before-publish` | Replaced visible public card data with controlled local assets or non-hotlinked local fallbacks. |
| Existing lint warning noise (`no-console`, unused test args, hook deps, a11y warning) | `defer-with-owner` | Recorded as existing warning noise; lint exits 0 and build exits 0. Owner: engineering cleanup before stricter CI. |
| Browserslist database age warning | `defer-with-owner` | Non-blocking dependency maintenance. Owner: release/dependency cleanup. |
| Manual browser smoke testing not performed in this CLI pass | `defer-with-owner` | Build generated all public routes; live hosted smoke remains required after deployment. Owner: release operator. |

## Public Release Surface

Validated by build/static generation and route inventory:

- Landing: `/welcome`
- Map: `/map`
- Spots: `/spots/[id]`, `/spots/register`, edit route gated by auth/runtime
- Routes/courses: `/routes`, `/routes/[id]`, `/routes/create`, `/routes/[id]/edit`
- Community: `/community`, `/community/[id]`, `/community/write`, media/spot community routes
- Auth/profile: `/auth/signin`, `/auth/register`, `/profile/[id]`, `/settings/account`
- Reports/gallery/offline/error support: `/reports`, `/gallery`, `/offline`, `/_not-found`

## Environment Checklist

| Variable group | Status | Notes |
| --- | --- | --- |
| MongoDB (`MONGODB_URI`, `MONGODB_DB`) | `required` | Production `MONGODB_URI` must be hosted and valid; `MONGODB_DB` optional override documented. |
| NextAuth (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`) | `required` | Production URL must be `https://`; secret must replace placeholder. |
| OAuth provider IDs/secrets | `optional` | Providers stay disabled/incomplete unless both ID and secret are configured. |
| Public URL/analytics/maps | `optional/required-by-feature` | `NEXT_PUBLIC_BASE_URL` must be HTTPS in production; Maps key required for Places autocomplete. |
| Sentry (`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_WEBHOOK_SECRET`) | `optional but recommended` | Partial Sentry config is a warning; webhook secret documented. |
| R2 storage | `required for upload/storage production flow` | All R2 placeholders documented. |
| Web Push VAPID | `optional unless push enabled` | Missing VAPID skips push delivery; documented. |
| Ops alerts/moderation/rate limit toggles | `optional` | Slack/Discord/NSFW/dev-rate-limit variables documented. |
| Local agent MCP helper | `not production runtime` | Documented as optional local helper only. |

Env usage comparison result: no non-internal `process.env.*` usage is missing from `.env.example` after ignoring `NODE_ENV`, `CI`, `NEXT_RUNTIME`, `PROJECT_ROOT`, and `BACKUP_DIR`.

## Verification Evidence

- `npx jest --runInBand --runTestsByPath src/lib/env-check.test.ts src/lib/deployment/image-config-validator.test.ts src/lib/deployment/seo-validator.test.ts src/components/landing/__tests__/SocialProofSection.test.ts src/components/landing/__tests__/landing-theme-softening.test.ts`
  - Passed: 5 suites, 21 tests.
- `npm run type-check`
  - Passed.
- `npm run lint`
  - Passed with existing warnings. Key warning classes: `no-console`, unused test mock args, `react-hooks/exhaustive-deps`, `jsx-a11y/alt-text`, deprecated `next lint`, missing detected Next ESLint plugin.
- `npm run routes:validate`
  - Passed: `checkedRoutes: 11`, `failures: []`.
- `npm run validate:images`
  - Passed: no input manifest items in this run (`total: 0`, `failed: 0`).
- `NODE_OPTIONS=--max-old-space-size=4096 npm run build`
  - Passed: compiled successfully, generated 63 static pages, public critical route surfaces listed in build output.
- `git diff --check`
  - Passed after final formatting cleanup.

## Deferred Items

1. Lint warning debt
   - Reason: warnings pre-existed and do not fail lint/build.
   - Owner: engineering cleanup.
   - Safest next action: create a separate lint-hardening spec; do not bury it in publishing cleanup.
2. Browserslist database update
   - Reason: dependency freshness warning, not a release blocker.
   - Owner: dependency/release maintenance.
   - Safest next action: run `npx update-browserslist-db@latest` in a dedicated dependency update branch.
3. Live hosted smoke test
   - Reason: CLI build proves route generation, not CDN/auth/OAuth callback behavior.
   - Owner: release operator.
   - Safest next action: after deployment, manually smoke `/welcome`, `/map`, `/routes`, one `/spots/{id}`, `/community`, `/auth/signin`, `/offline` on mobile and desktop.
4. Existing script-only seed prompts with `picsum`/Wikimedia references
   - Reason: not part of production runtime or package publish scripts; kept for historical/local tooling context.
   - Owner: data tooling cleanup.
   - Safest next action: archive or rewrite legacy seed scripts/prompts if they may be reused.

## Rollback Path

- Repository workflow: protected `develop` requires PR merge. Revert via a new PR that reverts the publishing cleanup commit(s), not direct push.
- Hosting workflow: use the hosting provider's previous successful deployment rollback. For Vercel, promote the previous deployment or revert the PR and redeploy `develop`.
- Data/media rollback: no database mutation was performed in this pass. Route validation was read-only.

## Final Recommendation

Proceed as `ready-with-deferrals` only if production environment variables are set with real values and the release operator accepts the documented warning debt. Do not publish if `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_BASE_URL`, `MONGODB_URI`, or required storage credentials are still local placeholders in the production host.
