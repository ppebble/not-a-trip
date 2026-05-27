export interface SlidingWindowLimitOptions {
  key: string
  limit: number
  windowMs: number
  now?: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

export interface ApiRateLimitPolicy {
  bucket: 'read' | 'write'
  limit: number
  windowMs: number
  pathname: string
}

type StoreRecord = number[]

const globalStore = globalThis as typeof globalThis & {
  __notATripRateLimitStore__?: Map<string, StoreRecord>
}

function getStore(): Map<string, StoreRecord> {
  if (!globalStore.__notATripRateLimitStore__) {
    globalStore.__notATripRateLimitStore__ = new Map()
  }

  return globalStore.__notATripRateLimitStore__
}

export function evaluateSlidingWindowLimit(
  options: SlidingWindowLimitOptions
): RateLimitResult {
  const now = options.now ?? Date.now()
  const store = getStore()
  const windowStart = now - options.windowMs
  const timestamps = (store.get(options.key) ?? []).filter(
    (timestamp) => timestamp > windowStart
  )

  if (timestamps.length >= options.limit) {
    const oldest = timestamps[0] ?? now
    const resetAt = oldest + options.windowMs
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000))
    store.set(options.key, timestamps)

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfterSeconds,
    }
  }

  timestamps.push(now)
  store.set(options.key, timestamps)

  return {
    allowed: true,
    remaining: Math.max(0, options.limit - timestamps.length),
    resetAt: now + options.windowMs,
    retryAfterSeconds: 0,
  }
}

export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers()
  headers.set('X-RateLimit-Remaining', String(result.remaining))
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))

  if (!result.allowed) {
    headers.set('Retry-After', String(result.retryAfterSeconds))
  }

  return headers
}

export function shouldBypassApiRateLimit(
  nodeEnv: string | undefined = process.env.NODE_ENV,
  enableDevRateLimit: string | undefined = process.env.ENABLE_DEV_RATE_LIMIT
): boolean {
  return nodeEnv === 'development' && enableDevRateLimit !== 'true'
}

export function getApiRateLimitPolicy({
  method,
  pathname,
  nodeEnv = process.env.NODE_ENV,
  enableDevRateLimit = process.env.ENABLE_DEV_RATE_LIMIT,
}: {
  method: string
  pathname: string
  nodeEnv?: string
  enableDevRateLimit?: string
}): ApiRateLimitPolicy | null {
  if (shouldBypassApiRateLimit(nodeEnv, enableDevRateLimit)) {
    return null
  }

  const normalizedMethod = method.toUpperCase()
  const isRead = normalizedMethod === 'GET' || normalizedMethod === 'HEAD'

  return {
    bucket: isRead ? 'read' : 'write',
    limit: isRead ? 300 : 40,
    windowMs: 60 * 1000,
    pathname,
  }
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers?.get?.('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers?.get?.('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}
