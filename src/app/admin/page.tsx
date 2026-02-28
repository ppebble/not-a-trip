'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AdminDashboardCard } from '@/components/admin/AdminDashboardCard'
import type { DashboardSummaryResponse } from '@/types/report'

/**
 * 관리자 대시보드 랜딩 페이지
 * Requirements: 1.1, 1.2, 1.3, 1.4
 * - 관리자 권한 검사 (미인증/비관리자 → 메인 페이지 리다이렉트)
 * - GET /api/admin/dashboard/summary 호출하여 대기 항목 수 로드
 * - 4개 AdminDashboardCard 렌더링
 */
export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 권한 체크
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [status, session, router])

  // 대시보드 요약 데이터 로드
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'admin') return

    const fetchSummary = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/dashboard/summary')
        if (!res.ok) throw new Error('요약 데이터를 불러올 수 없습니다')
        const data: DashboardSummaryResponse = await res.json()
        setSummary(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '서버 오류가 발생했습니다'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [status, session])

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
        <h1 className="text-xl font-bold text-gray-800">관리자 대시보드</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          모든 관리 기능의 현황을 확인하고 빠르게 이동할 수 있습니다
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AdminDashboardCard
              title="제보 관리"
              description="사용자가 제출한 성지 제보를 검토하고 승인/반려합니다"
              icon="📋"
              pendingCount={summary?.pendingReports ?? 0}
              href="/admin/reports"
            />
            <AdminDashboardCard
              title="정보 보완 검토"
              description="사용자가 제출한 정보 보완을 검토하고 승인/반려합니다"
              icon="📝"
              pendingCount={summary?.pendingSupplements ?? 0}
              href="/admin/supplements"
            />
            <AdminDashboardCard
              title="상태 신고 검토"
              description="사용자가 신고한 스팟 상태를 검토하고 확인 처리합니다"
              icon="🚨"
              pendingCount={summary?.pendingStatusReports ?? 0}
              href="/admin/status-reports"
            />
            <AdminDashboardCard
              title="콘텐츠 이미지 관리"
              description="콘텐츠 마스터 이미지를 관리합니다"
              icon="🖼️"
              pendingCount={0}
              href="/admin/content-images"
            />
          </div>
        )}
      </div>
    </div>
  )
}
