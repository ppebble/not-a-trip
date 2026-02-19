'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SpotCommunityPageProps {
  params: Promise<{ id: string }>
}

/**
 * 스팟별 커뮤니티 페이지 → 스팟 상세 페이지로 리다이렉트
 * Requirements: 6.2 - 스팟별 게시판을 인증 갤러리로 전환
 *
 * 기존 커뮤니티 게시판 대신 스팟 상세 페이지의 인증 갤러리로 이동합니다.
 */
export default function SpotCommunityPage({ params }: SpotCommunityPageProps) {
  const { id } = use(params)
  const router = useRouter()

  useEffect(() => {
    // 스팟 상세 페이지로 리다이렉트 (인증 갤러리가 포함됨)
    router.replace(`/spots/${id}`)
  }, [id, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-50">
      <div className="text-center">
        <div className="mb-4 text-4xl">🔄</div>
        <p className="text-navy-600">스팟 상세 페이지로 이동 중...</p>
      </div>
    </main>
  )
}
