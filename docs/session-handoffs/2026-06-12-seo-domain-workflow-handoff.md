# Session Handoff ? 2026-06-12 ? SEO Domain and Workflow Rules

## Branch and State

- Branch: `chore/908--session-handoff`
- Base / target branch if known: `origin/develop`
- Working tree at handoff creation start: clean on `origin/develop`; this file is the only intended new change.
- PR status:
  - Issue #904 closed: production SEO canonical domain correction.
  - PR #905 merged to `develop`: SEO canonical/domain hardening.
  - Issue #906 closed: issue-first Codex workflow documentation.
  - PR #907 merged to `develop`: workflow docs persisted.
  - Issue #908 open: this handoff.
  - Handoff PR not opened yet at file creation time.

## Latest Commits

- `bd3abcf Merge pull request #907` ? merged the issue-first Codex workflow rule into `develop`.
- `c77e951 docs: require issue-first Codex workflow` ? added the mandatory GitHub issue ? issue-number branch ? `develop` PR ? PR merge sequence to `AGENTS.md` and `docs/git-workflow.md`.
- `05aeb17 Merge pull request #905` ? merged production SEO domain correction into `develop`.
- `bd7af33 fix(seo): prevent localhost crawler URLs in production` ? changed production SEO origin to `https://www.not-a-trip.xyz`, removed Vercel default-host fallback, added canonical/JSON-LD/sitemap improvements and regression tests.
- `cec4649 Merge pull request #903` ? previous credential-hardening handoff merge; useful background for password-security follow-ups.

## Completed This Session

- Confirmed the true production public domain is `https://www.not-a-trip.xyz/`, not the Vercel default domain.
- Fixed SEO code so production crawler-facing URLs use `https://www.not-a-trip.xyz` as the single canonical origin.
- Removed `VERCEL_PROJECT_PRODUCTION_URL` fallback from SEO base URL resolution so Vercel default host cannot leak into canonical, robots, sitemap, Open Graph, or JSON-LD.
- Added/kept safe SEO signals only:
  - public section canonical URLs;
  - sitemap entries for `/welcome`, `/map`, and `/contents`;
  - WebSite, Organization, TouristAttraction/TouristTrip URL IDs, and BreadcrumbList JSON-LD;
  - dynamic title de-duplication.
- Rejected fake review/rating schema because structured data must represent visible page content.
- Decided `PWNED_PASSWORD_CHECK_STRICT=false` remains the safer production default unless the product explicitly accepts signup/password-change outages during breach API incidents.
- Verified non-mutating production auth/security checks:
  - `/auth/signin` returns 200;
  - unauthenticated `/settings/account` shows login flow, not management content;
  - compromised password registration candidate `password123` returns 400.
- Persisted future-session workflow rules:
  - `AGENTS.md` now requires issue creation/identification before commit/PR work.
  - `docs/git-workflow.md` now forbids placeholder issue numbers, direct protected-branch pushes, and reporting local-only merge as remote PR merge.
- Followed the new process for docs workflow persistence:
  - Issue #906 ? branch `chore/906--codex-workflow-docs` ? PR #907 ? merged to `develop`.
- Started the same process for this handoff:
  - Issue #908 ? branch `chore/908--session-handoff`.

## Verification Evidence

- `npm run lint` ? passed after SEO changes; proves source lint compliance for the code change set.
- `npm run type-check` ? passed after SEO changes; proves TypeScript validity.
- `npm test -- --runInBand src/lib/seo/metadata.test.ts src/lib/deployment/seo-validator.test.ts` ? passed; proves SEO helper and deployment validator expectations.
- `npm run test:ci` ? passed during SEO work; 116 suites / 463 tests passed.
- `npm run build:route-budget` ? passed after SEO changes and again after custom-domain correction; proves production build and route JS budget remained within limits.
- Local `next start` smoke after killing stale port 3100 process ? passed; local production build emitted:
  - robots sitemap: `https://www.not-a-trip.xyz/sitemap.xml`;
  - sitemap loc values under `https://www.not-a-trip.xyz`;
  - `/spots/REAL-ANI-017` canonical under `https://www.not-a-trip.xyz`;
  - `/gallery` canonical under `https://www.not-a-trip.xyz`;
  - `/contents` canonical under `https://www.not-a-trip.xyz`.
- `npx prettier --write AGENTS.md docs/git-workflow.md` ? passed for workflow documentation.
- `git diff --check` ? passed for workflow documentation.
- Live production check on `https://www.not-a-trip.xyz` after PR #905/#907 merge ? **still failing / not yet deployed**:
  - `robots.txt` still says `Sitemap: http://localhost:3000/sitemap.xml`;
  - `sitemap.xml` loc values still start with `http://localhost:3000`;
  - `/spots/REAL-ANI-017` canonical still `http://localhost:3000/spots/REAL-ANI-017`;
  - `/gallery` and `/contents` canonical still `http://localhost:3000`.

## Known Constraints / Do Not Re-open

- Production SEO canonical origin is `https://www.not-a-trip.xyz`; do not revert to `https://not-a-trip.vercel.app`.
- Do not use `VERCEL_PROJECT_PRODUCTION_URL` as SEO production fallback because it can leak the default Vercel hostname.
- Do not add fake ratings/reviews/aggregateRating structured data unless that content is actually visible and backed by product data.
- Do not suppress browser password-manager breach warnings; they are external browser security UX and security-positive.
- Do not enable `PWNED_PASSWORD_CHECK_STRICT=true` in production unless stakeholders accept signup/password-change outages when the breach API is unavailable.
- All future commit/PR work must follow: GitHub issue first, issue-number branch, PR into `develop`, merge through PR.
- Do not use `docs/` as a branch prefix; previous handoff notes recorded a branch validation failure for `docs/` prefixes. Use allowed prefixes such as `chore/{issue}--...` for documentation work.

## Open Risks / Gaps

- Live `https://www.not-a-trip.xyz` still emits old localhost SEO output. Likely deployment has not completed or production env/build has not picked up the merged `develop` changes.
- Actual authenticated production smoke "login ? profile account management ? change password" is still not done because no production test account credentials were available.
- Production env should be checked for:
  - `NEXT_PUBLIC_BASE_URL=https://www.not-a-trip.xyz`;
  - `AUTH_URL=https://www.not-a-trip.xyz`;
  - `PWNED_PASSWORD_CHECK` unset/enabled;
  - `PWNED_PASSWORD_CHECK_STRICT=false` unless fail-closed behavior is explicitly accepted.
- This handoff itself still needs commit, PR, and merge for issue #908.

## Recommended Next Actions

1. Commit this handoff on `chore/908--session-handoff`, push it, open a PR to `develop`, merge it, and close issue #908.
2. After the next deployment from `develop`, re-run live SEO smoke against `https://www.not-a-trip.xyz` and confirm no `localhost` or `not-a-trip.vercel.app` remains in robots, sitemap, canonical, OG, or JSON-LD.
3. Verify Vercel/project production env uses `https://www.not-a-trip.xyz` for `NEXT_PUBLIC_BASE_URL` and `AUTH_URL`.
4. With an authorized production test account, run the login ? profile account management ? password change smoke and record the result.
5. If the site has Google Search Console access, submit or inspect `https://www.not-a-trip.xyz/sitemap.xml` after deployment.

## Useful Commands for Next Session

```bash
git status -sb
git log --oneline -8
git fetch origin develop
git switch develop
git pull --ff-only origin develop
npm run type-check
npm run lint
npm run build:route-budget
```

Live SEO smoke helper:

```bash
node --input-type=module <<'NODE'
const urls = [
  'https://www.not-a-trip.xyz/robots.txt',
  'https://www.not-a-trip.xyz/sitemap.xml',
  'https://www.not-a-trip.xyz/spots/REAL-ANI-017',
  'https://www.not-a-trip.xyz/gallery',
  'https://www.not-a-trip.xyz/contents',
]
for (const url of urls) {
  const res = await fetch(url, { redirect: 'manual' })
  const text = await res.text()
  console.log('
URL', url, res.status)
  console.log(text.match(/Sitemap:.*/)?.[0] ?? text.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i)?.[1] ?? text.slice(0, 200))
}
NODE
```

## Notes for PR / Merge

- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- Commit convention: `docs/commit-convention.md`
- Git workflow: `docs/git-workflow.md`
- This handoff issue: #908
- Expected branch for this handoff: `chore/908--session-handoff`
