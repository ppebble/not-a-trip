# Japan anime pilgrimage data

## Scope

- `japan-anime-pilgrimage-2026.json` is the complete 2026 Anime Tourism
  Association selection: 146 work-region rows and 29 facility rows.
- `japan-anime-spot-additions.ts` contains exact visitable anchors that fit the
  existing `SeedSpot` schema. It restores `REAL-ANI-030` through `053` and adds
  ten address-backed official certification anchors through `063`.
- `japan-anime-spot-expansion.ts` adds `REAL-ANI-064` through `087`: twelve
  officially selected museums/facilities and twelve work-location anchors.
  Every expansion record has a separately checked point coordinate and a local
  licensed image; inference-only scene matches remain `needs_review`.
- `japan-anime-facility-expansion.ts` adds six additional official culture,
  museum, theme-park, and event anchors through `REAL-ANI-093`.
- Popularity is intentionally not used as an inclusion filter. The official
  catalog therefore retains both globally prominent titles and long-tail local
  works/facilities.

The official catalog is region-level evidence. It must not be converted into a
map pin until a physical address and coordinates are separately verified.
Address-derived coordinates remain `needs_review`; image ownership alone does
not promote them to `approved`.

## Refresh

```powershell
npm run pilgrimage:sync
npm run pilgrimage:check
```

The sync command fetches the official 2026 announcement, validates the expected
146/29 table split and contiguous 1-175 indices, then rewrites the checked-in
JSON. The check command fails when the official page and checked-in selection
rows differ.

## Seed

`scripts/seed-real-spots.ts --append` inserts only exact-place records into the
spots collection. It is an external database mutation and must be run only
after confirming the target `MONGODB_URI` and database. The catalog JSON is
research source data and is not bulk-converted into approximate city-centre
pins.
