# Spec 53 Tasks — Route Performance and Lint Release Gates

## Status: completed

- [x] Capture current production build route First Load JS evidence.
- [x] Define executable route JS budgets for core discovery routes.
- [x] Add local route budget gate command.
- [x] Migrate project lint script away from deprecated `next lint` to ESLint CLI without expanding scope into generated/runtime OMX artifacts.
- [x] Add lint warning release gate that classifies release-critical categories separately from generic warning noise.
- [x] Record current warning baseline and fail on category regressions.
- [x] Document remaining lint/build tooling warnings and follow-up path.
- [x] Verify lint, release lint gate, type-check, and route budget gate.

## Commands

```bash
npm run lint
npm run lint:release
npm run type-check
npm run build:route-budget
npm run release:check
```

## Final classification

- `Route_JS_Budget`: fixed
- `Warning_Gate`: fixed
- `Lint_Tooling_Migration`: partially-fixed
  - `npm run lint` and `npm run lint:fix` now use ESLint CLI.
  - `next build` still emits Next plugin detection text from Next's internal build-time lint integration. The release path no longer relies on that text as the lint authority; `npm run lint:release` is the release-warning gate.
