# Requirements Document

## Introduction

코스 작성/목록 기능에서 코드리뷰가 지적한 상태 안정성 문제를 수정한다. 이 spec은 High Finding 2의 stale start-point submit 위험과 Medium Finding 4의 infinite-scroll dependency churn 위험을 route feature 영역으로 묶어 분리한다.

This result is derived via logical deduction: `RouteFormContent`의 submit callback은 start-point 값을 사용하지만 dependency contract가 누락되어 stale closure 가능성이 있고, `RouteListContent`는 매 렌더마다 새 배열을 만들어 observer effect 안정성을 약화한다.

## Source Evidence

- Review finding: High 2, route submission callback can submit stale start-point data.
- Review finding: Medium 4, route list infinite-scroll state derives a new `routes` array every render.
- Affected files:
  - `src/components/route/RouteFormContent.tsx`
  - `src/components/route/RouteListContent.tsx`
- Review-required warning classes: `react-hooks/exhaustive-deps`.

## Glossary

- **Start_Point_State**: `startPointName`, `startPointAddress`, and `startPointCoords` values used to construct a route start point.
- **Submit_Snapshot**: submit 시점에 최신 form state를 명시적으로 읽어 만든 저장 payload.
- **Stable_Route_List_State**: render마다 불필요하게 identity가 바뀌지 않는 route collection.
- **Observer_Churn**: IntersectionObserver effect가 dependency identity 변화 때문에 과도하게 재생성되는 상태.

## Requirements

### Requirement 1: route submit은 최신 start-point state를 저장해야 한다

**User Story:** As a route creator, I want the submitted start point to match the latest values I entered, so that the saved route does not contain stale data.

#### Acceptance Criteria

1. THE route submit logic SHALL construct `startPoint` from the latest Start_Point_State at submit time.
2. THE submit callback SHALL include `startPointName`, `startPointAddress`, and `startPointCoords` in its explicit dependency contract when those values are read inside the callback.
3. IF callback dependencies become too broad, THEN THE implementation SHALL introduce a clear Submit_Snapshot helper instead of relying on hidden closure behavior.
4. THE fix SHALL preserve existing validation and save semantics except where stale data prevention requires an explicit change.
5. Verification_Evidence SHALL include a targeted test or lint evidence proving the original missing dependency warning no longer exists.

---

### Requirement 2: route form dependency contracts must be readable and reviewable

**User Story:** As a maintainer, I want hook dependencies in route form submission to reflect actual data usage, so that future edits cannot silently reintroduce stale closures.

#### Acceptance Criteria

1. EVERY value read by the route submit callback SHALL be represented in the dependency array or captured through an explicitly documented stable helper.
2. THE implementation SHALL NOT silence `react-hooks/exhaustive-deps` for the submit callback without a code comment explaining a stable invariant.
3. IF memoized helpers are introduced, THEN their dependency contracts SHALL be as strict as the submit callback they replace.
4. THE remediation SHALL keep the code path visually scannable; dependency fixes SHALL NOT bury submit payload construction across unrelated files.
5. THE final summary SHALL state whether the route submit warning is fixed by dependency inclusion or by state extraction restructuring.

---

### Requirement 3: route list infinite scroll must use stable derived route data

**User Story:** As a route browser, I want infinite scroll to trigger predictably, so that observer churn does not cause duplicate pagination or missed loads.

#### Acceptance Criteria

1. THE route list SHALL NOT create an effect dependency value that changes identity solely because the component re-rendered.
2. IF the route array is derived from query pages, THEN it SHALL be memoized from stable source dependencies or accumulated through an explicit reducer/state transition.
3. THE infinite-scroll IntersectionObserver effect SHALL depend only on values that represent real loading or list state changes.
4. THE fix SHALL preserve route order, pagination cursor behavior, empty states, and loading indicators.
5. Verification_Evidence SHALL include lint output without the original route-list dependency warning or a targeted behavior test covering pagination stability.

---

### Requirement 4: route feature remediation must leave a focused verification package

**User Story:** As a reviewer, I want route feature fixes to include exact verification evidence, so that stale submit and infinite-scroll risks can be re-reviewed quickly.

#### Acceptance Criteria

1. THE remediation SHALL run the smallest targeted tests available for route form and route list behavior.
2. THE remediation SHALL run `npm run lint` and inspect hook dependency warnings.
3. THE remediation SHALL run `npm run type-check` after code changes.
4. IF no targeted route tests exist, THEN THE final summary SHALL state the static verification used and the residual test gap.
5. THE release gate SHALL remain blocked while High Finding 2 is unresolved.
