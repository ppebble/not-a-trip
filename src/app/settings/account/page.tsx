'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AccountSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user?.id) {
      // 로그인 상태: 프로필 관리 섹션으로 리다이렉트
      router.replace(`/profile/${session.user.id}?section=management`)
    } else if (status === 'unauthenticated') {
      // 비로그인 상태: 로그인 페이지로 리다이렉트
      router.replace('/auth/signin?callbackUrl=/settings/account')
    }
  }, [status, session, router])

  // 리다이렉트 중 로딩 표시
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sub-text">이동 중...</p>
    </div>
  )
}
