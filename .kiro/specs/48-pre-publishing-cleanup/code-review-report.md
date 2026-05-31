# Pre-publishing Code Review Report

Date: 2026-06-01
Branch: develop
Scope: current working tree, including uncommitted pre-publishing cleanup changes.
Verdict: REQUEST CHANGES
Architectural Status: BLOCK

## External reference frame

- Airbnb Design Language System / visual language: coherent product quality depends on a shared visual language, not page-by-page styling drift.
- Toss Slash Design System: product UI should be assembled from documented, reusable design primitives instead of one-off implementations.
- Toss Frontend Fundamentals: readability, predictability, and explicit contracts are production-quality requirements, not optional cleanup.

This result is derived via logical deduction: the external references define quality principles; the concrete release risks below are determined from this repository's code, lint, route inventory, and production build output.

## Verification evidence

- `npm run type-check`: PASS
- `npm run lint -- --quiet`: PASS with warnings; warnings are still release-risk evidence.
- `NODE_OPTIONS=--max-old-space-size=4096 npm run build`: PASS; log stored at `.omx/logs/prepublish-code-review-build.log`.
- Production build output: shared First Load JS is 224 kB; `/spots/[id]` is 299 kB, `/routes/[id]` 277 kB, `/gallery` 270 kB, `/map` 267 kB.
- Route inventory confirms `src/app/community/[id]/page.tsx` exists and `src/app/community/posts/[id]/page.tsx` does not exist.

## Critical findings

None found in this pass.

## High findings — must fix before publishing

### 1. Broken profile community links point to a non-existent route

- Evidence:
  - `src/components/profile/sections/CommunitySection.tsx:105` links posts to `/community/posts/${post.id}`.
  - `src/components/profile/sections/CommunitySection.tsx:179` links comments to `/community/posts/${comment.postId}`.
  - Existing routes under `src/app/community`: `[id]`, `[id]/edit`, `media/[title]`, `spot/[id]`, `write`; no `posts/[id]` route.
- Risk: profile -> community post navigation is guaranteed to 404 for real users.
- Fix: change both links to `/community/${id}` or add the missing `/community/posts/[id]` route intentionally. Do not leave both patterns alive without a redirect contract.

### 2. Route submission callback can submit stale start-point data

- Evidence:
  - `src/components/route/RouteFormContent.tsx:420-425` builds `startPoint` from `startPointName`, `startPointAddress`, `startPointCoords`.
  - `src/components/route/RouteFormContent.tsx:463-476` omits those three variables from the `useCallback` dependency list.
  - ESLint reports `react-hooks/exhaustive-deps` for this exact callback.
- Risk: after a user changes the start point, save can use stale closure values. This is a data-integrity bug, not formatting noise.
- Fix: include the missing dependencies or restructure submit state extraction so the dependency contract is explicit and test-covered.

### 3. Shared image component does not encode the required alt-text contract

- Evidence:
  - `src/components/common/OptimizedImage.tsx:5-8` inherits `ImageProps` but does not make the accessibility contract visible at the wrapper boundary.
  - `src/components/common/OptimizedImage.tsx:40` is flagged by `jsx-a11y/alt-text`.
- Risk: a design-system primitive that wraps images must enforce semantic accessibility. Current implementation lets accessibility regressions spread through every consumer.
- Fix: make `alt` a first-class required prop at the wrapper boundary, document decorative image usage as `alt=""`, and add a targeted test/lint expectation.

## Medium findings — release-quality blockers if time allows; do not ignore

### 4. Route list infinite-scroll state derives a new `routes` array every render

- Evidence:
  - `src/components/route/RouteListContent.tsx:65-66` creates `routes` inline.
  - `src/components/route/RouteListContent.tsx:69-85` uses that value in an IntersectionObserver effect dependency list.
  - ESLint warns that this can change effect dependencies every render.
- Risk: observer churn, duplicate pagination triggers, and harder-to-debug list behavior under load.
- Fix: memoize derived routes or store accumulated routes via reducer/state transition only when data changes.

### 5. Design tokens exist, but component code bypasses them heavily

- Evidence:
  - `tailwind.config.ts:13-77` defines semantic color tokens such as `primary`, `surface`, `main-text`, `sub-text`, `muted`, `border`, and `danger`.
  - Many UI files still use raw or one-off utilities: examples include `src/components/profile/sections/ManagementSection.tsx:37`, `:42`, `:207`; `src/components/checkin/QuickCheckIn.tsx:312`, `:446`, `:486`; `src/components/mobile/ViewfinderOverlay.tsx:160`, `:223`, `:289`; profile/admin sections repeatedly use `text-neutral-*`, `bg-neutral-*`, `shadow-*` directly.
- Risk: visual consistency will drift immediately after launch. Airbnb/Toss-style design systems fail when tokens are declared but not enforced.
- Fix: define component-level primitives for Button, Card, Badge, EmptyState, FormField, Toggle, and CameraOverlay controls; then ban raw palette utilities outside primitives with lint or review rules.

### 6. Motion and focus accessibility are not centralized enough for launch confidence

- Evidence:
  - `src/app/globals.css:248-250` globally removes focus outlines, then restores `focus-visible` at `:252-255`.
  - `src/app/globals.css:297-318`, `:322-330`, `:396-413` define multiple animations.
  - Only `.animate-fade-slide-in` is disabled for reduced motion at `:416-420`; other animation utilities remain active.
- Risk: keyboard and motion-sensitive users receive inconsistent behavior. This contradicts design-system-level predictability.
- Fix: remove broad `*:focus { outline: none; }` unless every interactive primitive owns a tested focus ring; extend `prefers-reduced-motion` coverage to all global animation utilities.

### 7. Bundle size is already high on core discovery routes

- Evidence:
  - Build: shared First Load JS `224 kB`.
  - Build: `/spots/[id]` `299 kB`, `/routes/[id]` `277 kB`, `/gallery` `270 kB`, `/map` `267 kB`.
  - Build also reports webpack cache warnings for serializing big strings (`180kiB`, `139kiB`).
- Risk: map/gallery/spot pages are the product's core discovery path; heavy first-load cost will hit mobile users before the product proves value.
- Fix: audit client boundaries, lazy-load map/gallery-only libraries, isolate Leaflet/GSAP/camera-heavy modules, and set a budget gate for route-level First Load JS.

### 8. Lint/build tooling passes while carrying warnings that should be release gates

- Evidence:
  - `package.json` uses `next lint` for `lint` and `lint:fix`.
  - Build/lint output says `next lint` is deprecated and warns that the Next.js plugin was not detected.
  - Current lint allows warnings for `no-console`, `no-explicit-any`, hook issues, unused variables, and image alt issues.
- Risk: the release gate is green while known quality violations remain. This is how regressions survive into production.
- Fix: migrate to ESLint CLI, ensure Next plugin detection is correct, and make deploy-critical warnings fail CI at least for `react-hooks/exhaustive-deps`, `jsx-a11y/*`, and production `console` usage.

## Low findings

### 9. Landing proof data still uses dummy naming for release-facing content

- Evidence: `src/components/landing/data/proofData.ts` still uses `PROOF_DUMMY_DATA` for content now intended to be launch-facing proof/social content.
- Risk: future contributors may treat launch data as disposable fixture data.
- Fix: rename to `PROOF_SPOT_CARDS` or `LANDING_PROOF_CARDS` and keep test names aligned.

### 10. Console logging is widespread in server/runtime paths

- Evidence: lint reports `no-console` warnings across many API routes and server utilities, including auth, checkins, posts, users, sitemap, and DB utilities.
- Risk: noisy logs obscure production incidents and may leak operational context.
- Fix: introduce one logger wrapper with environment-aware levels and structured metadata; keep `console` in tests/scripts only.

## Architecture watchlist

- Status: BLOCK until High findings 1-3 are resolved.
- The design-system layer is currently declarative, not enforceable. Tokens exist, but reusable UI primitives and lint constraints do not. This will produce Airbnb/Toss-incompatible drift as soon as features continue.
- The performance profile is acceptable for a build pass but not yet governed by budgets. Without route-level JS budgets, optimization will be reactive after launch.

## Recommendation

REQUEST CHANGES before publishing.

Minimum release gate:

1. Fix broken `/community/posts/*` navigation.
2. Fix route submit stale-closure dependencies.
3. Enforce `OptimizedImage` alt semantics.
4. Re-run `npm run type-check`, `npm run lint`, and `npm run build`.
5. File follow-up tasks for design-token enforcement and bundle budgets if not fixed before release.
