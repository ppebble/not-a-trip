# Session Handoff — 2026-06-04 — Landing Image Regression

## Branch and State

- Branch: `hotfix/885--release-warning-lcp-cleanup`
- Base / target branch if known: `main` hotfix branch; issue number `885` was inferred from latest PR numbering, not confirmed by remote issue metadata.
- Working tree: dirty and high-risk. Many agent-authored code changes are unstaged/modified; many `.kiro/` and nonessential `docs/` files are staged for deletion via earlier `git rm` as part of main/develop split cleanup.
- PR status: no PR created in this session.
- User explicitly requested handoff because landing category images still do not render.

## Latest Commits

- `e3dcf7d docs: record landing category handoff` — previous handoff before this session.
- `643b8cd fix: prevent landing image and game category regressions` — prior landing/category regression fix baseline.
- `a65e223 docs: record production recovery handoff` — prior production recovery context.
- `5e4ee3c fix(auth): use Auth.js environment variables` — auth deployment recovery.

## Completed This Session

- Replaced many direct production `console.error` / `console.warn` style calls with centralized `runtimeLogger`.
- Updated `runtimeLogger` to support level gating and production-safe centralized console output.
- Added release lint/build gates into CI workflows and route budget checks.
- Added build warning detection in `scripts/check-route-js-budget.mjs` and made it remove `.next` before building to avoid stale `_document.js` cache failures.
- Reduced landing LCP JS surface by dynamic-importing below-fold sections and reducing floating card initial/card counts.
- Attempted several landing image fixes:
  - First wrong attempt: treated `/uploads/contents/covers/` as placeholder. This was wrong because DB `content_masters.imageUrl` actually uses `/uploads/contents/covers/...` for real work cover images.
  - Later correction: removed `/uploads/contents/covers/` from `src/lib/safe-image-src.ts` placeholder block.
  - Added `buildContentShowcaseCards()` in `src/components/landing/data/fetchShowcaseSpots.ts` to source hero cards from `content_masters` (`displayName`, `type`, `imageUrl`, `spotCount`) instead of static/fallback spot cards.
  - Kept `fetchCategoryImages()` sourcing category imagery from approved `spots.photos[0]` via `buildSpotShowcaseCards()`.
  - Updated `src/app/api/spots/showcase/helpers.ts` to avoid generating nonexistent `/api/images/...` URLs; it now returns remote URLs, `/uploads/...`, `/images/...`, bare upload filenames as `/uploads/{file}`, or controlled fallback.
- Reduced hero floating card counts:
  - mobile: 3
  - tablet: 4
  - desktop: 6
- Added/updated tests around landing image placeholders and content-cover usage.
- Removed Jest console noise from two tests by mocking `next/dynamic` in spot detail property tests and making generated post IDs unique in `post-list-required-info.test.tsx`.
- Main/develop split work started:
  - `.kiro/` and many historical docs/session handoff files are staged for deletion from main.
  - `docs/git-workflow.md` was updated with main/develop file inclusion guidance.
  - Do not assume this deletion plan is final; it is broad and should be reviewed before commit.

## Verification Evidence

- `npx tsc --noEmit --pretty false` — passed after landing content image changes; proves TypeScript currently accepts the changed fetch/helper code.
- `npx jest --runInBand src/lib/safe-image-src.test.ts src/components/landing/__tests__/landing-theme-softening.test.ts src/components/landing/data/__tests__/showcaseCards.test.ts src/components/landing/data/__tests__/fetchProofImages.test.ts src/app/api/spots/showcase/__tests__/route.test.ts` — passed; proves focused unit/property tests accept the intended image-source rules.
- `npm run lint` — passed after latest changes.
- `npm run build:route-budget` — passed after latest changes; output reported `buildWarnings: []`, `/welcome` First Load JS `243 kB`, shared `225 kB`.
- `npm run release:check` — do not claim final success for latest state. It was intentionally not rerun after the user said not to run release check. Earlier full release checks passed before the final landing-image changes, but that is not valid evidence for current UI behavior.
- Manual visual verification: not completed. User reports category images still missing in `취향별로 골라볼까요` for `ANIME PILGRIMAGE`, `SPORTS VENUE`, `SCREEN LOCATION`, `MUSIC LANDMARK`, `GAME WORLD`; `CULTURE SPOT` appears to work.

## Known Constraints / Do Not Re-open

- Do not delete tests from `main`. Tests are CI/release gates, not deploy payload.
- Do not run `npm run release:check` unless the user explicitly re-allows it. User explicitly said: “release:check까진 하지마. 빌드까지만돌려.”
- Do not treat `/uploads/contents/covers/` as placeholder. These are real DB work-cover images.
- Do not generate `/api/images/{spotId}/{file}` unless an actual route exists. This repo currently did not show `src/app/api/images/...`; generating that URL caused broken images.
- Do not claim landing images are fixed without browser-level visual verification or at least rendered HTML/props inspection.
- User priority is simple: “그냥 이미지 뜨게 해.” Avoid over-optimizing before confirming images render.

## Open Risks / Gaps

- Critical unresolved issue: category cards still do not render images for five categories according to user. Current code may still pass a value that Next `<Image>` cannot load in browser, or client-side `onError` may be hiding it behind fallback gradients.
- Likely next debug path:
  - Inspect actual `categoryImages` object returned by `fetchCategoryImages()` under the same environment used by Next build/dev.
  - Verify each returned path exists under `public/` or is an allowed/usable remote URL.
  - Render `/welcome` locally and inspect the six `CategoryCard` image `src` values in browser/devtools or Playwright.
- `fetchCategoryImages()` uses `buildSpotShowcaseCards()` and category spots from MongoDB. If MongoDB has `photos[0]` such as `/images/spots/animation/...`, confirm files exist in `public/images/spots/animation/`. If not, fallback logic must resolve by category, not by spot ID only.
- `resolveThumbnailUrl()` returns `getControlledFallback(spotId)` when a path is not public/remote. For DB spots without a matching `REAL_SPOT_PHOTO_FALLBACKS[spotId]`, it can still return `null`, causing empty category images and fallback to static story image. If static story image is also bad for five categories, images remain broken.
- Broad `.kiro/` and docs deletions are staged. This is intentional for main/develop split, but huge; review before commit. Required docs retained in git index should be `docs/commit-convention.md`, `docs/git-workflow.md`, `docs/session-handoffs/README.md`, `docs/session-handoffs/_template.md`.
- Handoff itself is created while many staged deletions exist. Be careful not to accidentally commit all changes.

## Recommended Next Actions

1. Stop modifying broad release-warning cleanup. Focus only on landing image render failure.
2. Run a small Node/Mongo inspection for `fetchCategoryImages` equivalent, or temporarily log/serialize `categoryImages` in server render, then verify paths against `public/`.
3. Use browser/devtools or Playwright to inspect actual `<img>`/`next/image` output in `/welcome` for the five failed category cards.
4. If category image path is empty or invalid, implement a blunt category fallback map using existing known-good files:
   - `animation`: `/images/spots/animation/real-ani-001-suga-shrine.webp` or another verified file under `public/images/spots/animation/`
   - `sports`: `/uploads/spots/replacements/campnou-fd1ffbdfbd42.jpg`
   - `movie_drama`: `/uploads/spots/replacements/real-mov-001-1913f25dddcbee.webp`
   - `music`: `/uploads/scenes/REAL-MUS-001-scene-0.jpg`
   - `game`: `/uploads/scenes/REAL-GAM-002-scene-0.jpg`
   - `other`: `/uploads/spots/replacements/hobbiton-4308cdfe0114.jpg`
5. Re-run only:
   - `npm run lint`
   - `npm run build:route-budget`
   Do not run `npm run release:check` unless re-authorized.

## Useful Commands for Next Session

```bash
git status -sb
git log --oneline -8
git diff -- src/components/landing/data/fetchShowcaseSpots.ts src/lib/safe-image-src.ts src/app/api/spots/showcase/helpers.ts src/components/landing/FloatingCardsCollage.tsx
node -e "const fs=require('fs'); for (const p of ['public/images/spots/animation/real-ani-001-suga-shrine.webp','public/uploads/spots/replacements/campnou-fd1ffbdfbd42.jpg','public/uploads/scenes/REAL-MUS-001-scene-0.jpg','public/uploads/scenes/REAL-GAM-002-scene-0.jpg']) console.log(p, fs.existsSync(p))"
npm run lint
npm run build:route-budget
```

## Notes for PR / Merge

- PR template: `.github/PULL_REQUEST_TEMPLATE.md`
- Commit convention: `docs/commit-convention.md`
- Git workflow: `docs/git-workflow.md`
- If committing, do not blindly commit the staged `.kiro/` and docs deletions together with landing image fixes. Split commits:
  1. landing image/render fix
  2. release warning/build gate cleanup
  3. main/develop docs cleanup
  4. handoff docs, if kept on branch