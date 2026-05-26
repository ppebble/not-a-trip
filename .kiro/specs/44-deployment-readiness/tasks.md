# Spec 44 Tasks - Deployment Readiness

## Requirements trace

- Requirement 1: production build optimization validation
- Requirement 2: image remotePatterns review
- Requirement 3: PWA cache and offline validation
- Requirement 4: SSR/CSR boundary validation
- Requirement 5: mobile performance validation
- Requirement 6: SEO / metadata / crawler validation
- Requirement 7: environment readiness validation
- Requirement 8: error page and offline fallback validation

## Task checklist

- [x] 1. Build analyzer and bundle regression coverage
  - [x] 1.1 Add `src/lib/deployment/build-analyzer.ts`
  - [x] 1.2 Add `src/lib/deployment/build-analyzer.test.ts`
  - [x] 1.3 Report per-route gzip bundle size and shared chunks
  - [x] 1.4 Surface route over-budget warnings and dynamic import counts

- [x] 2. Image remotePatterns deployment review
  - [x] 2.1 Add `src/lib/deployment/image-config-validator.ts`
  - [x] 2.2 Add `src/lib/deployment/image-config-validator.test.ts`
  - [x] 2.3 Ignore docs / scripts / tests when inferring production image hosts
  - [x] 2.4 Remove placeholder-only image hosts from `next.config.ts`
  - [x] 2.5 Remove legacy localhost upload host from `next.config.ts`

- [x] 3. PWA cache and offline validation
  - [x] 3.1 Add `src/lib/deployment/pwa-cache-validator.ts`
  - [x] 3.2 Add `src/lib/deployment/pwa-cache-validator.test.ts`
  - [x] 3.3 Verify offline fallback, activation, cache clearing, and stale-while-revalidate checks

- [x] 4. SSR / CSR boundary validation
  - [x] 4.1 Add `src/lib/deployment/ssr-csr-boundary-checker.ts`
  - [x] 4.2 Add `src/lib/deployment/ssr-csr-boundary-checker.test.ts`
  - [x] 4.3 Report unnecessary client boundaries and server imports of client-only libraries

- [x] 5. Mobile performance readiness validation
  - [x] 5.1 Add `src/lib/deployment/performance-auditor.ts`
  - [x] 5.2 Add `src/lib/deployment/performance-auditor.test.ts`
  - [x] 5.3 Verify font-display swap and dynamic map loading heuristics

- [x] 6. SEO / crawler readiness validation
  - [x] 6.1 Add `src/lib/deployment/seo-validator.ts`
  - [x] 6.2 Add `src/lib/deployment/seo-validator.test.ts`
  - [x] 6.3 Add canonical metadata and absolute OG image checks
  - [x] 6.4 Verify `robots.ts` and `sitemap.ts`

- [x] 7. Environment readiness validation
  - [x] 7.1 Add `src/lib/env-check.ts`
  - [x] 7.2 Add `src/lib/env-check.test.ts`
  - [x] 7.3 Validate MongoDB, NextAuth, OAuth, public env, and Sentry readiness rules

- [x] 8. Error page and offline fallback validation
  - [x] 8.1 Add `src/lib/deployment/error-page-validator.ts`
  - [x] 8.2 Add `src/lib/deployment/error-page-validator.test.ts`
  - [x] 8.3 Add `src/app/not-found.tsx`
  - [x] 8.4 Expand `src/app/global-error.tsx` Sentry context and home navigation checks

- [x] 9. Verification checkpoint
  - [x] 9.1 Run deployment validator Jest suites
  - [x] 9.2 Run `npm run type-check`
  - [x] 9.3 Run `npm run build`

## Notes

- Spec 44 implementation landed earlier under the shared specs 41-44 foundation work; this task file backfills the missing requirements-based execution record.
- The remaining follow-up for this pass was production image allowlist cleanup plus validator scoping so placeholder and script-only hosts do not leak into deployment checks.
