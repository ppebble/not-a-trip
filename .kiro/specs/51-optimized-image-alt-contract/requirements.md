# Requirements Document

## Introduction

공용 `OptimizedImage` 컴포넌트가 이미지 접근성 계약을 명확히 강제하도록 수정한다. 이 spec은 `.kiro/specs/48-pre-publishing-cleanup/code-review-report.md`의 High Finding 3을 shared image primitive 기능 영역으로 분리한다.

This result is derived via logical deduction: wrapper가 `ImageProps`를 넓게 상속하면서 `alt` 계약을 wrapper boundary에서 명시하지 않으면, 디자인 시스템 primitive가 접근성 실패를 소비자 전체로 확산시킬 수 있다.

## Source Evidence

- Review finding: High 3, shared image component does not encode required alt-text contract.
- Affected file: `src/components/common/OptimizedImage.tsx`.
- Warning class: `jsx-a11y/alt-text`.
- Required semantic rule: informative images need meaningful `alt`; decorative images must intentionally use `alt=""`.

## Glossary

- **OptimizedImage_Primitive**: Next.js `Image`를 감싸는 shared image component.
- **Alt_Text_Contract**: image wrapper caller가 semantic alternative text 또는 decorative intent를 명시해야 한다는 계약.
- **Decorative_Image**: 보조기술에 설명할 의미가 없어 `alt=""`를 사용해야 하는 이미지.
- **Wrapper_Boundary**: consumer가 직접 사용하는 `OptimizedImage` props interface.

## Requirements

### Requirement 1: OptimizedImage는 alt를 명시적 필수 prop으로 노출해야 한다

**User Story:** As a frontend developer, I want `OptimizedImage` to require `alt` at the wrapper boundary, so that accessibility intent is visible at every call site.

#### Acceptance Criteria

1. THE OptimizedImage_Primitive SHALL define an explicit props type that includes required `alt: string`.
2. THE props type SHALL NOT hide `alt` inside an opaque inherited `ImageProps` contract.
3. THE wrapper SHALL forward the explicit `alt` value to the underlying Next.js `Image` component.
4. THE implementation SHALL preserve existing image optimization behavior, class merging, loading, sizing, and fallback behavior unless those conflict with the Alt_Text_Contract.
5. TypeScript SHALL reject an `OptimizedImage` call without `alt`.

---

### Requirement 2: decorative image usage must be documented and intentional

**User Story:** As an accessibility reviewer, I want decorative image usage to be explicit, so that empty alt text is a deliberate semantic choice rather than an omission.

#### Acceptance Criteria

1. THE OptimizedImage_Primitive documentation or inline type comment SHALL state that Decorative_Image usage must pass `alt=""`.
2. THE remediation SHALL NOT auto-generate generic alt text that hides missing semantic decisions.
3. IF existing call sites use decorative imagery, THEN they SHALL pass an explicit empty alt string.
4. IF existing call sites show meaningful content, THEN they SHALL pass a meaningful non-empty alt string.
5. THE final summary SHALL mention whether any call sites required alt adjustments.

---

### Requirement 3: lint and tests must prove the wrapper no longer masks alt failures

**User Story:** As a release maintainer, I want lint or tests to catch missing alt at the shared primitive, so that future image regressions fail before publish.

#### Acceptance Criteria

1. `jsx-a11y/alt-text` SHALL NOT report the original warning for `OptimizedImage` after remediation.
2. THE remediation SHALL include targeted type-level, lint, or component test evidence that missing `alt` is rejected.
3. THE verification SHALL include `npm run type-check` after changes.
4. THE verification SHALL include `npm run lint` and inspect accessibility warnings.
5. THE release gate SHALL remain blocked while High Finding 3 is unresolved.
