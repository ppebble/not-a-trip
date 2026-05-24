'use client'

import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useAdminDashboardSummary } from '@/hooks/useAdminQueries'
import { AdminDashboardCard } from '@/components/admin/AdminDashboardCard'
import { AppIcon } from '@/components/common/AppIcon'

function formatTrendLabel(date: string): string {
  return date.slice(5)
}

export default function AdminDashboardPage() {
  const { isLoading: authLoading, isAuthorized } = useAdminAuth()
  const {
    data: summary,
    isLoading: dataLoading,
    error,
  } = useAdminDashboardSummary()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200 bg-surface px-6 py-4">
        <h1 className="text-xl font-bold text-neutral-800">관리자 대시보드</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          운영 지표와 검토 대기 현황을 한 번에 확인합니다.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error instanceof Error
              ? error.message
              : '서버 오류가 발생했습니다.'}
          </div>
        )}

        {dataLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-xl border border-neutral-200 bg-surface"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl border border-neutral-200 bg-surface"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <AdminDashboardCard
                title="제보 관리"
                description="사용자 제출 신규 제보를 검토하고 승인/반려합니다."
                icon="📥"
                pendingCount={summary?.pendingReports ?? 0}
                href="/admin/reports"
              />
              <AdminDashboardCard
                title="정보 보완 검토"
                description="사용자 제안 보완 정보를 검토하고 승인/반려합니다."
                icon="🧩"
                pendingCount={summary?.pendingSupplements ?? 0}
                href="/admin/supplements"
              />
              <AdminDashboardCard
                title="상태 제보 검토"
                description="현장 상태 제보를 검토하고 처리합니다."
                icon="🛠️"
                pendingCount={summary?.pendingStatusReports ?? 0}
                href="/admin/status-reports"
              />
              <AdminDashboardCard
                title="콘텐츠 이미지 관리"
                description="콘텐츠 마스터 이미지를 관리합니다."
                icon={<AppIcon name="gallery" size={24} />}
                pendingCount={0}
                href="/admin/content-images"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                ['오늘 DAU', summary?.dauToday ?? 0],
                ['오늘 체크인', summary?.totalCheckInsToday ?? 0],
                ['24시간 5xx 비율', `${summary?.errorRate24h ?? 0}%`],
                ['오늘 신규 사용자', summary?.newUsersToday ?? 0],
                ['오늘 신규 스팟', summary?.newSpotsToday ?? 0],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-xl border border-neutral-200 bg-surface p-5 shadow-sm"
                >
                  <p className="text-sm text-neutral-500">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-neutral-800">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <section className="rounded-xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-800">
                    최근 7일 DAU
                  </h2>
                  <span className="text-xs text-neutral-500">
                    {summary?.generatedAt
                      ? new Date(summary.generatedAt).toLocaleString('ko-KR')
                      : ''}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {summary?.dauTrend.map((point) => (
                    <div key={point.date}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-neutral-500">
                          {formatTrendLabel(point.date)}
                        </span>
                        <span className="font-medium text-neutral-800">
                          {point.count}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-neutral-100">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${Math.max(
                              8,
                              ((point.count || 0) /
                                Math.max(
                                  ...((summary?.dauTrend ?? []).map(
                                    (item) => item.count
                                  ) || [1])
                                )) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-neutral-200 bg-surface p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-neutral-800">
                  최근 7일 체크인 추이
                </h2>
                <div className="mt-4 space-y-3">
                  {summary?.checkInTrend.map((point) => (
                    <div key={point.date}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-neutral-500">
                          {formatTrendLabel(point.date)}
                        </span>
                        <span className="font-medium text-neutral-800">
                          {point.count}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-neutral-100">
                        <div
                          className="h-2 rounded-full bg-secondary"
                          style={{
                            width: `${Math.max(
                              8,
                              ((point.count || 0) /
                                Math.max(
                                  ...((summary?.checkInTrend ?? []).map(
                                    (item) => item.count
                                  ) || [1])
                                )) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
