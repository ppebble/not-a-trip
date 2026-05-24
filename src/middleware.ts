import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  createRateLimitHeaders,
  evaluateSlidingWindowLimit,
  getClientIp,
} from '@/lib/security/rate-limit'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request)
    const result = evaluateSlidingWindowLimit({
      key: `api-ip:${ip}`,
      limit: 60,
      windowMs: 60 * 1000,
    })
    const headers = createRateLimitHeaders(result)

    if (!result.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429, headers }
      )
    }

    const response = NextResponse.next()
    headers.forEach((value, key) => response.headers.set(key, value))
    return response
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
