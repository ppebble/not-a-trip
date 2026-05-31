# Spec 51 Tasks - OptimizedImage Alt Contract

## Requirements trace

- Requirement 1: `OptimizedImage` exposes required explicit `alt` at the wrapper boundary.
- Requirement 2: decorative image usage is documented and intentional through `alt=""`.
- Requirement 3: lint/type verification proves the wrapper no longer masks alt failures.

## Task checklist

- [x] 1. Lock image accessibility scope
  - [x] 1.1 Confirm `OptimizedImage` currently inherits `alt` through broad `ImageProps`
  - [x] 1.2 Confirm existing `OptimizedImage` call sites already pass explicit alt text
  - [x] 1.3 Preserve existing blur placeholder, safe-src, sizing, and optimization behavior

- [x] 2. Encode the explicit alt contract
  - [x] 2.1 Change `OptimizedImageProps` to require `alt: string` directly
  - [x] 2.2 Omit inherited `alt` from the underlying `ImageProps` spread contract
  - [x] 2.3 Forward the explicit `alt` prop directly to Next.js `Image`
  - [x] 2.4 Document decorative images as intentional `alt=""` usage

- [x] 3. Add type-level contract evidence
  - [x] 3.1 Add a type-check fixture for meaningful alt usage
  - [x] 3.2 Add a type-check fixture for decorative `alt=""` usage
  - [x] 3.3 Add a `@ts-expect-error` fixture proving missing alt is rejected

- [x] 4. Run completion checks
  - [x] 4.1 Run `npm run lint` and inspect `jsx-a11y/alt-text` warnings
  - [x] 4.2 Run `npm run type-check`
  - [x] 4.3 Run `npx prettier --check` on changed files
  - [x] 4.4 Update this task checklist with final status