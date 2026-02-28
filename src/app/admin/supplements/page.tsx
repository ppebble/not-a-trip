'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminSupplementList } from '@/components/admin/AdminSupplementList'
import { AdminSupplementReview } from '@/components/admin/AdminSupplementReview'
import type { SpotSupplement } from '@/types/report'

/**
 * 관리자 정보 보완 검토 페이지
 * Requirements: 3.1, 3.2
 * - Split-pane 레이아웃 (좌측 목록 + 우측 상세)
 * - 관리자 권한 검사 (미인증/비관리자 → 메인 페이지 리다이렉트)
 */
export default function AdminSupplementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedSupplement, setSelectedSupplement] =
    useState<SpotSupplement | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [status, session, router])

  const handleSelectSupplement = useCallback((supplement: SpotSupplement) => {
    setSelectedSupplement(supplement)
  }, [])

  const handleReviewComplete = useCallback(() => {
    setSelectedSupplement(null)
    setRefreshKey((k) => k + 1)
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            접근 권한 없음
          </h1>
          <p className="text-gray-600">관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">정보 보완 검토</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          사용자가 제출한 정보 보완을 검토하고 승인/반려할 수 있습니다
        </p>
      </div>

      {/* 메인 레이아웃: 좌측 목록 + 우측 상세 */}
      <div className="flex h-[calc(100vh-theme(spacing.14)-73px)]">
        {/* 좌측: 정보 보완 목록 */}
        <div className="w-96 flex-shrink-0 border-r border-gray-200 bg-white">
          <AdminSupplementList
            onSelectSupplement={handleSelectSupplement}
            selectedSupplementId={selectedSupplement?.id}
            refreshKey={refreshKey}
          />
        </div>

        {/* 우측: 정보 보완 상세/검토 */}
        <div className="flex-1 bg-gray-50">
          {selectedSupplement ? (
            <AdminSupplementReview
              key={selectedSupplement.id}
              supplement={selectedSupplement}
              onReviewComplete={handleReviewComplete}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-4xl">📝</p>
                <p className="mt-2 text-sm">
                  좌측 목록에서 정보 보완을 선택하세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
