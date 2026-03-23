'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import * as Sentry from '@sentry/nextjs'

/**
 * Sentry 사용자 컨텍스트 관리 컴포넌트
 *
 * 세션 상태에 따라 Sentry 사용자 컨텍스트를 설정/해제한다.
 * PII(개인정보) 보호를 위해 사용자 ID만 전송하며,
 * 이메일/이름 등 개인정보는 절대 포함하지 않는다.
 */
export function SentryUserManager(): null {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user?.id) {
      // ID만 설정 — 이메일/이름 등 개인정보 절대 포함하지 않음
      Sentry.setUser({ id: session.user.id })
    } else {
      Sentry.setUser(null)
    }
  }, [session, status])

  return null
}
