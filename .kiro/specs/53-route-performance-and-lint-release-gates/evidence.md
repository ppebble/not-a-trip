# Spec 53 Evidence — Route Performance and Lint Release Gates

## Build route evidence

Command:

```bash
npm run build:route-budget
```

Budget file: `config/route-js-budgets.json`

| Route | Code-review baseline | 2026-06-02 measured | Budget | Status |
| --- | ---: | ---: | ---: | --- |
| shared First Load JS | 224 kB | 224 kB | 230 kB | pass |
| `/spots/[id]` | 299 kB | 302 kB | 310 kB | pass |
| `/routes/[id]` | 277 kB | 277 kB | 285 kB | pass |
| `/gallery` | 270 kB | 271 kB | 280 kB | pass |
| `/map` | 267 kB | 267 kB | 275 kB | pass |

Latest local build log is written to `.omx/release-gates/next-build-latest.log` by the budget script and is intentionally not a tracked release artifact.

## Lint warning evidence

Commands:

```bash
npm run lint
npm run lint:release
```

Baseline file: `config/lint-release-warning-baseline.json`

Current classified warning baseline:

| Category | Count | Release policy |
| --- | ---: | --- |
| `react-hooks/exhaustive-deps` | 0 | must not regress |
| `jsx-a11y/*` | 0 | must not regress |
| production `console` | 59 | tracked baseline; must not increase |
| `@typescript-eslint/no-explicit-any` | 0 | must not regress |
| unused variables | 30 | tracked baseline; must not increase |
| other warnings | 5 | tracked baseline; must not increase |

`npm run lint` currently reports 94 warnings and 0 errors. `npm run lint:release` passes because no release-critical category exceeds the checked-in baseline.

## Tooling migration notes

- `package.json` now uses `eslint src` for `lint` and `eslint src --fix` for `lint:fix`, removing direct `next lint` usage.
- The lint scope is deliberately `src`; raw `eslint .` currently sweeps `.omx`, `.kiro`, and generated `next-env.d.ts` artifacts and fails on files outside the previous `next lint` app scope. Expanding scope must be a separate cleanup with its own baseline.
- `next build` still prints the Next plugin detection warning from Next's build-time lint integration even though ESLint CLI loads `next/core-web-vitals` through `FlatCompat`. The authoritative release lint gate is now `npm run lint:release`.
- The route budget gate runs a production `next build`, parses the emitted route table, and fails if shared or core discovery route First Load JS exceeds the checked-in budget.
