# Requirements — Internet-Based Course Data Generation

## Objective

Create a reliable batch of public course/route data from internet-researched information and the existing spot/content database. The goal is not to invent random routes blindly; it is to generate plausible pilgrimage/subculture travel courses that connect real registered spots, real nearby geography, and relevant content records.

## Context from Current System

- Route documents live in the `routes` collection and are typed by `src/types/route.ts`.
- Existing route APIs depend on these fields:
  - `id` in `ROUTE-###` shape.
  - `name`, `description`, `estimatedDuration`, `difficulty`.
  - `spots[]` with `spotId`, `spotName`, `coordinates`, `thumbnailUrl`, `distanceFromPrev`, `walkTimeFromPrev`, optional `note`, and `isAvailable`.
  - `totalDistance`.
  - `relatedContentNames[]` for content-course matching.
  - optional `regionTags[]`.
  - `isPublic`, `isOfficial`, `bookmarkCount`, `completionCount`, `authorId`, `authorName`, timestamps.
- `/api/contents/[name]/courses` returns public routes where `relatedContentNames` equals the decoded content name.
- `/api/spots/[id]/courses` returns public routes containing the spot ID in `spots.spotId`.
- Only 2 route documents were observed during the previous session, so route discovery is currently too sparse.

## Scope

### Include

- Generate many route documents around existing anime/game/artist/subculture pilgrimage spots.
- Use internet data to justify route grouping, travel order, and content relation.
- Prefer recent popular works and recognized classics already present in the database.
- Use existing `spots.id` values as route stops whenever possible.
- Add new spots only when an internet-researched route requires a major missing landmark and the spot can be grounded with real coordinates and real media.
- Store source notes for maintainability, either in a DB field tolerated by the current schemaless collection or in a generated local audit artifact.

### Exclude

- Do not generate route stops for places that do not exist in `spots` unless the task also adds and verifies those spots first.
- Do not create routes that are geographically impossible for the stated duration.
- Do not copy itinerary prose from travel sites. Summarize in original Korean text and retain URLs only as source notes.
- Do not use sports/team records as target content unless product requirements explicitly broaden from subculture/idol/anime/game.
- Do not use placeholder photos or unrelated images.

## Data Sources

Use source-backed research before insertion. Prioritize:

1. Official tourism pages and municipality pages.
2. Official venue/facility pages.
3. Official content/project/location pages where available.
4. OpenStreetMap/Wikidata/Wikipedia/Wikivoyage for coordinate and regional sanity checks.
5. Fan pilgrimage/location articles only as supplemental evidence, not the sole source for a route.

Each generated course must preserve enough source context for later audit:

- `sourceUrls[]` or equivalent audit artifact.
- one-line `sourceSummary` explaining why those places belong together.
- date of research/insertion.
- whether every stop was already in DB or newly added.

## Route Quality Rules

Every generated route must satisfy all rules below:

1. Has at least 2 valid registered spots.
2. Every `spots[].spotId` exists in the `spots` collection.
3. Spot order follows practical movement, not random database order.
4. `distanceFromPrev`, `walkTimeFromPrev`, and `totalDistance` are finite values calculated consistently with `src/lib/route-utils.ts` or a documented equivalent.
5. `estimatedDuration` includes walking/transit buffer and sightseeing time; it must not be shorter than the computed movement time.
6. `difficulty` is assigned by route burden:
   - `easy`: compact local route, short walking time.
   - `moderate`: several stops or moderate transit.
   - `hard`: long distance, multi-area, or high walking/transit burden.
7. `relatedContentNames` exactly matches existing content display names used by content discovery/course APIs.
8. `regionTags` are useful for filtering, e.g. `도쿄`, `아키하바라`, `시부야`, `교토`, `우지`, `가마쿠라`, `쇼난`, `오사카`.
9. `isPublic: true`.
10. `isOfficial` should be `true` only if the route is curated/seeded by this project as an editorial recommendation; otherwise false.
11. No route name should imply official partnership with a work, studio, tourism board, or venue unless verified.

## Recommended Initial Route Themes

Use actual DB state first, but these are strong candidate buckets once matching spots exist:

- Tokyo anime/subculture half-day route: Akihabara, Kanda, Tokyo Tower, Shinjuku/Shibuya-related spots.
- Shonan/Kamakura classic pilgrimage route: stations, coast, school/crossing landmarks where existing spots support it.
- Kyoto/Uji anime route: Kyoto city and Uji-area classics where existing spots support it.
- Osaka/Kansai game/anime route: Namba, Dotonbori, Osaka landmark clusters where existing spots support it.
- Ghibli/Tokyo architecture and park-adjacent route if matching spots and media are already registered.
- Idol/artist urban route: venue/shop/cafe clusters only when records are categorized as artist/idol/subculture and not sports.

These examples are not permission to fabricate. If matching spots are missing, either skip the route or add verified missing spots first.

## Implementation Requirements

1. Inspect current DB before writing:
   - count `routes`, `spots`, `content_masters`, `spot_content_relations`.
   - list candidate content names and spot clusters by region.
2. Create an idempotent route seed script or migration:
   - dry-run mode prints planned inserts/updates.
   - upsert key should be stable, e.g. `id` or a deterministic slug stored in a source/audit field.
   - rerunning the script must not duplicate routes.
3. Prefer generating routes from existing spots first.
4. If new spots are required:
   - verify coordinates.
   - attach real related media.
   - add relevant content relation records.
   - include nearby facilities if the new spot lacks them.
5. Preserve source/audit data in a way future admin tooling can expose or inspect.
6. Keep route descriptions concise and user-facing in Korean.
7. Avoid mojibake. All newly written Korean text must be valid UTF-8.

## Validation Requirements

Before claiming completion, run or provide equivalent evidence for:

- `npm run type-check`.
- route seed dry-run output.
- route seed apply output.
- DB validation script proving:
  - every route has 2+ spots.
  - every route spot ID exists.
  - every route has finite total distance and duration.
  - every public route has a name, description, difficulty, and timestamps.
  - every `relatedContentNames[]` entry exists in active/discoverable content data or is intentionally documented.
  - no duplicated route IDs.
- API smoke checks:
  - `GET /api/routes` returns inserted routes.
  - `GET /api/routes/recommended` returns official/popular buckets without error.
  - `GET /api/contents/{contentName}/courses` returns linked routes for at least one seeded content item.
  - `GET /api/spots/{spotId}/courses` returns linked routes for at least one seeded spot.
- `npm run build` after code/script changes, unless the task is explicitly DB-only and no repo files changed.

## Acceptance Criteria

The task is complete only when:

- A meaningful number of new public routes exist in the local DB.
- Routes are based on researched real-world geography and real registered spots.
- Each route links back to relevant content via `relatedContentNames`.
- No route contains phantom spots, dummy images, or broken Korean text.
- Seed process is reproducible or at minimum documented with exact inserted IDs and source URLs.
- Verification commands and DB validation results are recorded in the next handoff or task note.

## Suggested Next Command Sequence

```bash
git status -sb
npm run type-check
# inspect route/content/spot DB state with a read-only script
# build route seed script with dry-run/apply modes
# run DB validation script
npm run build
```
