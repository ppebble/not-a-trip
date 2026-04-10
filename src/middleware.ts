import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * 루트(/) 경로 접속 시 쿠키 기반 분기 리다이렉트
 * - has_visited=true → /map (기존 사용자)
 * - has_visited 없음 또는 읽기 실패 → /welcome (신규 사용자)
 * Requirements: 1.9
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 루트 경로에서만 분기 리다이렉트
  if (pathname === '/') {
    try {
      const hasVisited = request.cookies.get('has_visited')?.value
      if (hasVisited === 'true') {
        return NextResponse.redirect(new URL('/map', request.url))
      }
    } catch {
      // 쿠키 읽기 실패 시 신규 유저로 간주
    }

    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|icons|fonts|sw\\.js|manifest\\.json|monitoring).*)',
  ],
}
