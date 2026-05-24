import {
  createRateLimitHeaders,
  evaluateSlidingWindowLimit,
  getClientIp,
} from './rate-limit'

describe('rate limit', () => {
  test('blocks when limit is exceeded within the window', () => {
    const key = `test-rate-${Date.now()}`
    const first = evaluateSlidingWindowLimit({
      key,
      limit: 2,
      windowMs: 60_000,
      now: 1_000,
    })
    const second = evaluateSlidingWindowLimit({
      key,
      limit: 2,
      windowMs: 60_000,
      now: 2_000,
    })
    const third = evaluateSlidingWindowLimit({
      key,
      limit: 2,
      windowMs: 60_000,
      now: 3_000,
    })

    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(true)
    expect(third.allowed).toBe(false)
    expect(third.retryAfterSeconds).toBeGreaterThan(0)
  })

  test('creates standard headers', () => {
    const headers = createRateLimitHeaders({
      allowed: false,
      remaining: 0,
      resetAt: 5_000,
      retryAfterSeconds: 12,
    })

    expect(headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(headers.get('X-RateLimit-Reset')).toBe('5')
    expect(headers.get('Retry-After')).toBe('12')
  })

  test('extracts x-forwarded-for client ip', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '203.0.113.10, 10.0.0.1',
      },
    })

    expect(getClientIp(request)).toBe('203.0.113.10')
  })
})
