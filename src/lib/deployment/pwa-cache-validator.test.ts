import { validatePwaCaching } from './pwa-cache-validator'

describe('validatePwaCaching', () => {
  it('verifies current service worker and offline page protections', () => {
    const result = validatePwaCaching({
      repoRoot: process.cwd(),
    })

    expect(result.checks.hasOfflineFallback).toBe(true)
    expect(result.checks.hasSkipWaiting).toBe(true)
    expect(result.checks.hasClientsClaim).toBe(true)
    expect(result.checks.hasClearCachesMessage).toBe(true)
    expect(result.checks.hasSpotDataStaleWhileRevalidate).toBe(true)
    expect(result.checks.offlinePageShowsNetworkStatus).toBe(true)
    expect(result.checks.offlinePageHasRetryAction).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})
