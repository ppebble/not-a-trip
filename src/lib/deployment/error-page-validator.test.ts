import { validateErrorPages } from './error-page-validator'

describe('validateErrorPages', () => {
  it('verifies custom 404, retry, home navigation, and sentry context', () => {
    const result = validateErrorPages({
      repoRoot: process.cwd(),
    })

    expect(result.checks.hasCustomNotFoundPage).toBe(true)
    expect(result.checks.hasGlobalErrorBoundary).toBe(true)
    expect(result.checks.hasRetryAction).toBe(true)
    expect(result.checks.hasGoHomeAction).toBe(true)
    expect(result.checks.hasOfflineFallbackPage).toBe(true)
    expect(result.checks.sentryCapturesUrlContext).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})
