# Requirements Document

## Introduction

디자인 토큰, focus ring, reduced-motion 적용을 출시 품질 수준으로 끌어올리거나 명시적으로 추적 가능한 후속 작업으로 고정한다. 이 spec은 code review Medium Finding 5와 6을 design-system/accessibility hardening 영역으로 분리한다.

This result is derived via logical deduction: 토큰은 `tailwind.config.ts`에 존재하지만 raw utility 사용이 광범위하고, global CSS는 focus/motion 규칙을 중앙에서 충분히 보장하지 못한다. 이는 즉시 404나 데이터 손상은 아니지만 출시 후 UI 일관성과 접근성 회귀를 만든다.

## Source Evidence

- Review finding: Medium 5, design tokens exist but component code bypasses them heavily.
- Review finding: Medium 6, motion and focus accessibility are not centralized enough for launch confidence.
- Affected examples:
  - `tailwind.config.ts`
  - `src/app/globals.css`
  - profile, check-in, mobile overlay, admin UI surfaces using raw palette/shadow utilities.

## Glossary

- **Design_Token_Contract**: reusable UI should prefer semantic tokens and primitives over one-off raw palette utilities.
- **Primitive_Component**: Button, Card, Badge, EmptyState, FormField, Toggle, CameraOverlay controls 등 반복 UI를 담당하는 reusable component.
- **Focus_Visibility_Contract**: keyboard navigation users must receive visible focus indicators.
- **Reduced_Motion_Contract**: global animations must respect `prefers-reduced-motion` unless an exception is documented.
- **Deferred_A11y_Risk**: 지금 수정하지 않지만 owner와 검증 경로가 명확한 접근성 위험.

## Requirements

### Requirement 1: 디자인 토큰 우회 위험은 추적 가능해야 한다

**User Story:** As a UI maintainer, I want raw style drift to be constrained or tracked, so that the declared design system does not remain decorative only.

#### Acceptance Criteria

1. THE remediation SHALL identify raw palette and one-off utility hotspots in profile, check-in, mobile overlay, and admin surfaces.
2. IF fixed now, THEN repeated UI patterns SHALL be consolidated into existing or minimal Primitive_Component paths.
3. IF deferred, THEN THE follow-up SHALL list the affected surfaces, risk, owner, and proposed enforcement mechanism.
4. THE remediation SHALL NOT introduce a new primitive that duplicates an existing primitive without consolidating usage.
5. THE final summary SHALL classify Design_Token_Contract status as `fixed`, `partially-fixed`, or `deferred`.

---

### Requirement 2: raw utility enforcement must have a concrete mechanism

**User Story:** As a reviewer, I want token enforcement to be checkable, so that future code review does not rely on memory or taste.

#### Acceptance Criteria

1. IF fixed now, THEN THE implementation SHALL add or document a lint/review rule limiting raw palette utilities outside Primitive_Component files.
2. IF deferred, THEN THE follow-up SHALL propose a concrete enforcement path, such as ESLint/Tailwind lint rules, PR checklist checks, or component ownership rules.
3. THE enforcement mechanism SHALL distinguish semantic tokens from banned one-off raw palette usage.
4. THE enforcement mechanism SHALL avoid blocking legitimate layout utilities unrelated to color, surface, shadow, or state semantics.
5. THE final summary SHALL state exactly what remains unenforced.

---

### Requirement 3: focus visibility must remain visible for keyboard users

**User Story:** As a keyboard user, I want every interactive element to show visible focus, so that global CSS never makes navigation invisible.

#### Acceptance Criteria

1. THE remediation SHALL evaluate `src/app/globals.css` focus rules that remove broad outlines.
2. IF fixed now, THEN global CSS SHALL preserve or restore visible `focus-visible` behavior for interactive elements.
3. IF the broad `*:focus { outline: none; }` pattern remains, THEN every interactive primitive SHALL own a tested visible focus style or the risk SHALL be deferred explicitly.
4. THE remediation SHALL NOT remove visible focus without a replacement.
5. Verification_Evidence SHALL include CSS diff review, component test, visual check, or documented deferral.

---

### Requirement 4: reduced-motion coverage must apply to all global animation utilities or be deferred explicitly

**User Story:** As a motion-sensitive user, I want launch UI animations to respect my reduced-motion preference, so that global animation utilities do not create avoidable discomfort.

#### Acceptance Criteria

1. THE remediation SHALL inventory global animation utilities defined in `src/app/globals.css`.
2. IF fixed now, THEN all global animation utilities SHALL be disabled or simplified under `prefers-reduced-motion: reduce` unless an exception is documented.
3. IF deferred, THEN THE deferral SHALL list uncovered animation utilities and expected verification steps.
4. THE remediation SHALL preserve intended non-motion layout and visibility states.
5. THE final summary SHALL classify Reduced_Motion_Contract status as `fixed`, `partially-fixed`, or `deferred`.
