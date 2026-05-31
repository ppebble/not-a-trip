# Spec 50 Tasks - Route Submit and List State Stability

## Requirements trace

- Requirement 1: route submit uses the latest start-point state.
- Requirement 2: route form hook dependency contracts are explicit and reviewable.
- Requirement 3: route list infinite scroll uses stable derived route data.
- Requirement 4: route remediation leaves focused verification evidence.

## Task checklist

- [x] 1. Lock route stability scope
  - [x] 1.1 Confirm `RouteFormContent` reads start-point state inside submit logic
  - [x] 1.2 Confirm `RouteListContent` derives `routes` in a way that can change identity per render
  - [x] 1.3 Preserve existing validation, save, pagination, and empty/loading UI semantics

- [x] 2. Fix route submit dependency contract
  - [x] 2.1 Add latest start-point state to the submit callback dependency contract
  - [x] 2.2 Keep start-point payload construction adjacent to submit logic
  - [x] 2.3 Avoid disabling `react-hooks/exhaustive-deps`

- [x] 3. Stabilize route list derived state
  - [x] 3.1 Memoize the current page route fallback so empty data does not create a new array per render
  - [x] 3.2 Memoize the derived `routes` collection from stable source dependencies
  - [x] 3.3 Keep IntersectionObserver dependencies tied to real page/loading/list changes

- [x] 4. Run completion checks
  - [x] 4.1 Run `npm run lint` and inspect route hook warnings
  - [x] 4.2 Run `npm run type-check`
  - [x] 4.3 Run `npx prettier --check` on changed files
  - [x] 4.4 Update this task checklist with final status