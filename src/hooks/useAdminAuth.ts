'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { Session } from 'next-auth'

interface UseAdminAuthReturn {
  /** 세션 로딩 중 여부 */
  isLoading: boolean
  /** 관리자 권한 확인 결과 */
  isAuthorized: boolean
  /** NextAuth 세션 객체 */
  session: Session | null
}

/**
 * 관리자 페이지 공통 인증/권한 훅
 *
 * - useSession() 기반 세션 로딩 상태 관리
 * - 관리자 권한 확인 (role === 'admin')
 * - 비관리자 자동 리다이렉트 ('/')
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAdmin = !!session?.user && session.user.role === 'admin'

  // 비관리자 리다이렉트 — 리다이렉트 중에는 isAuthorized=false 유지
  // 사용하는 쪽에서 !isAuthorized일 때 return null로 빈 화면 유지
  useEffect(() => {
    if (isLoading) return
    if (!isAdmin) {
      router.push('/')
    }
  }, [isLoading, isAdmin, router])

  return { isLoading, isAuthorized: isAdmin, session }
}
