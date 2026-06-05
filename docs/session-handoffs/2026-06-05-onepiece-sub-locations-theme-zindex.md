# Session Handoff — 2026-06-05 — One Piece Sub-locations and Theme Layer Fix

## Branch and State

- Branch: `feat/886--onepiece-sub-locations-theme-zindex`
- Base / target branch if known: `develop`. Work was split off from `hotfix/885--develop-code-sync` because PR #885 was already merged under a different head branch; keep review flow on the new branch only.
- Working tree before final commit: code + docs changes staged/commit pending in this session.
- PR status: PR #885 was previously merged to `main` from `hotfix/885--release-warning-lcp-cleanup`; this work now needs a fresh PR from `feat/886--onepiece-sub-locations-theme-zindex` to `develop` because direct push is protected.

## Latest Commits

- `acfb2d8 fix(release): enforce clean launch gates` — current branch HEAD before this session's final commit.
- `435b688 fix(landing): keep category cards on verified images` — prior landing image validation fix in history.

## Completed This Session

- Fixed map/header layering bug: global header z-index moved above map filter overlay so the light/dark/system theme dropdown no longer renders behind the map filter area.
- Added one-spot/many-location support for spots via `subLocations`:
  - API list response expands sub-locations into individual map pins while preserving navigation to the parent spot.
  - Spot detail API returns `subLocations`.
  - Spot detail map renders all sub-location markers and fits bounds around them.
  - Marker layer now keys markers by `pinId ?? id` so one parent spot can own multiple visible pins.
- Updated production MongoDB spot `REAL-ANI-015`:
  - Renamed from `구마모토현 루피 동상` to `구마모토현 원피스 동상`.
  - Added 10 sub-locations: Luffy, Chopper, Sanji, Brook, Zoro, Nami, Robin, Usopp, Franky, Jinbe.
  - Removed incorrect building-only representative photo; official project images were not copied because the official site disallows unauthorized image reuse.
  - Added official external link `https://op-kumamoto.com/english/`.
- Restored release-validation documentation assertions in `docs/git-workflow.md` so user journey hardening tests pass.

## Verification Evidence

- `npm run type-check` — passed; TypeScript accepts sub-location API/types/map changes.
- `npx eslint ...` on touched TS/TSX files — passed; no targeted lint errors.
- `npx jest --runInBand --runTestsByPath "src/app/(main)/map/__tests__/spot-id-url-mapping.test.tsx" "src/app/spots/[id]/__tests__/spot-detail-required-info.test.tsx" "src/lib/user-journey-ux.test.ts"` — passed; 3 suites / 12 tests.
- `node .omx\verify-onepiece-kumamoto.cjs` — passed; `REAL-ANI-015` has 10 sub-locations, 10 expanded One Piece pins, 0 issues.
- `git diff --check` — passed after code edits; no whitespace errors.

## Known Constraints / Do Not Re-open

- Do not convert the Kumamoto One Piece statues into a route/course unless product direction changes; user explicitly rejected route semantics for this case.
- Do not copy official ONE PIECE Kumamoto images into R2 without an allowed license/source; current official project page is reference-only.
- Keep one parent spot with multiple map-visible sub-location pins; do not create 10 independent duplicate parent-level spots for this content cluster.
- Protected `develop` requires PR; do not attempt direct push as the integration path.

## Open Risks / Gaps

- `REAL-ANI-015` currently has `photos: []` because no safe licensed statue image was found during this session.
- Coordinates are based on official/source-linked map locations plus verified geocoding/references; future pass can refine exact statue coordinates if an official coordinate feed is obtained.
- A full production visual smoke test was not run in-browser; verification is static/type/test/data-level.

## Recommended Next Actions

1. Open a fresh PR from `feat/886--onepiece-sub-locations-theme-zindex` to `develop` because direct push is protected; do not reuse PR #885 or its branch naming.
2. Source legally reusable statue photos, upload to R2, and set parent/sub-location `photoUrl` values.
3. Run full release checks if this branch becomes a release candidate: `npm run release:check`.

## Useful Commands for Next Session

```bash
git status -sb
git log --oneline -8
npm run type-check
npx jest --runInBand --runTestsByPath "src/app/(main)/map/__tests__/spot-id-url-mapping.test.tsx" "src/app/spots/[id]/__tests__/spot-detail-required-info.test.tsx" "src/lib/user-journey-ux.test.ts"
node .omx\verify-onepiece-kumamoto.cjs
```

## Notes for PR / Merge

- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- Commit convention: `docs/commit-convention.md`
- Git workflow: `docs/git-workflow.md`
- Data backup before production mutation: `.omx/data-backups/mongodb-backup-2026-06-04T18-03-50-382Z.archive.gz`
- Data reports:
  - `.omx/data-audit/onepiece-kumamoto-subLocations-update.json`
  - `.omx/data-audit/onepiece-kumamoto-subLocations-verification.json`
