# Requirements Document

## Introduction

핵심 discovery route의 bundle budget과 lint/build warning gate를 출시 판단 가능한 상태로 만든다. 이 spec은 code review Medium Finding 7과 8을 performance/tooling release gate 영역으로 분리한다.

This result is derived via logical deduction: 현재 production build는 통과하지만 shared First Load JS와 주요 route 비용이 높고, lint는 review-blocking warning categories를 green gate 뒤에 숨길 수 있다. 출시 게이트는 exit code만이 아니라 경고의 의미까지 판단해야 한다.

## Source Evidence

- Review finding: Medium 7, bundle size is already high on core discovery routes.
- Review finding: Medium 8, lint/build tooling passes while carrying warnings that should be release gates.
- Build evidence from review:
  - shared First Load JS: 224 kB.
  - `/spots/[id]`: 299 kB.
  - `/routes/[id]`: 277 kB.
  - `/gallery`: 270 kB.
  - `/map`: 267 kB.
- Tooling warning categories: Next lint deprecation, plugin detection, `react-hooks/exhaustive-deps`, `jsx-a11y/*`, production `console`, `no-explicit-any`, unused variables.

## Glossary

- **Route_JS_Budget**: route-level First Load JS threshold used to block or flag performance regressions.
- **Core_Discovery_Route**: product discovery path routes including map, gallery, spot detail, and route detail.
- **Release_Critical_Lint_Warning**: warning category that can represent correctness, accessibility, or production-operability failure.
- **Warning_Gate**: release check that inspects warning categories, not only command exit status.

## Requirements

### Requirement 1: core route bundle costs must be measured and preserved as evidence

**User Story:** As a release owner, I want route-level JS costs recorded after remediation, so that performance decisions are based on build evidence rather than guesswork.

#### Acceptance Criteria

1. THE remediation SHALL run a production build after route, image, client-boundary, or dependency changes.
2. THE final evidence SHALL record First Load JS for shared code and Core_Discovery_Route pages.
3. THE remediation SHALL compare current values against the code-review baseline where possible.
4. IF the production build cannot run, THEN THE final summary SHALL state the exact command, failure reason, and next-best evidence.
5. THE release gate SHALL NOT claim performance improvement without before/after build output.

---

### Requirement 2: bundle budgets must be introduced or filed as explicit follow-up

**User Story:** As a mobile user, I want core discovery routes to stay within a controlled JavaScript budget, so that initial load does not degrade silently after launch.

#### Acceptance Criteria

1. IF fixed now, THEN THE project SHALL define Route_JS_Budget thresholds for `/spots/[id]`, `/routes/[id]`, `/gallery`, and `/map`.
2. IF fixed now, THEN budget checking SHALL be executable locally or in CI with documented commands.
3. IF deferred, THEN THE follow-up SHALL include target routes, initial baseline values, proposed thresholds, and owner.
4. THE remediation SHALL NOT perform broad speculative performance rewrites without build evidence and rollback clarity.
5. THE final summary SHALL classify route budget status as `fixed`, `partially-fixed`, or `deferred`.

---

### Requirement 3: release-critical lint warnings must be separated from acceptable warning noise

**User Story:** As a maintainer, I want correctness and accessibility warnings to fail or be tracked distinctly, so that a passing lint command cannot hide release blockers.

#### Acceptance Criteria

1. THE remediation SHALL run `npm run lint` after code changes.
2. THE final evidence SHALL identify whether warnings remain in `react-hooks/exhaustive-deps`, `jsx-a11y/*`, production `console`, `no-explicit-any`, and unused variable categories.
3. Warnings tied to High Findings from spec 48 SHALL be resolved before publish readiness is claimed.
4. Remaining non-blocking warnings SHALL be classified with impact and follow-up path.
5. THE release decision SHALL NOT rely on lint exit code alone.

---

### Requirement 4: lint tooling migration risk must be tracked

**User Story:** As a build maintainer, I want deprecated lint tooling and Next plugin detection issues tracked, so that the release gate remains enforceable after framework changes.

#### Acceptance Criteria

1. IF `next lint` deprecation warnings remain, THEN THE remediation SHALL file or document a migration path to ESLint CLI.
2. IF Next.js plugin detection warnings remain, THEN THE remediation SHALL document the suspected cause and required config check.
3. IF fixed now, THEN lint commands in `package.json` SHALL use the supported tooling path and preserve existing rule coverage.
4. THE migration SHALL NOT weaken existing TypeScript, React Hooks, or accessibility checks.
5. THE final summary SHALL classify lint tooling status as `fixed`, `partially-fixed`, or `deferred`.
