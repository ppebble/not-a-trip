import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import {
  createRateLimitHeaders,
  evaluateSlidingWindowLimit,
  getApiRateLimitPolicy,
  getClientIp,
} from '@/lib/security/rate-limit'

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    if (pathname === '/api/internal/ops/request') {
      return NextResponse.next()
    }

    event.waitUntil(
      fetch(new URL('/api/internal/ops/request', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-ops-ingest': '1',
        },
        body: JSON.stringify({ path: pathname }),
      }).catch(() => undefined)
    )

    const policy = getApiRateLimitPolicy({
      method: request.method,
      pathname,
    })

    if (policy) {
      const ip = getClientIp(request)
      const result = evaluateSlidingWindowLimit({
        key: `api:${policy.bucket}:${ip}:${policy.pathname}`,
        limit: policy.limit,
        windowMs: policy.windowMs,
      })
      const headers = createRateLimitHeaders(result)

      if (!result.allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429, headers }
        )
      }

      const response = NextResponse.next()
      headers.forEach((value, key) => response.headers.set(key, value))
      return response
    }
  }

  if (pathname === '/') {
    try {
      const hasVisited = request.cookies.get('has_visited')?.value
      if (hasVisited === 'true') {
        return NextResponse.redirect(new URL('/map', request.url))
      }
    } catch {
      // Ignore cookie read failures and treat as a first-time visitor.
    }

    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!api|_next/static|_next/image|favicon\\.ico|icons|fonts|sw\\.js|manifest\\.json|monitoring).*)',
  ],
}
