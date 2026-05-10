'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SubTabNavigation } from '@/components/profile/SubTabNavigation'
import {
  useUserReportedSpots,
  useUserReports,
  useUserSupplements,
  useUserStatusReports,
} from '@/hooks/useUserQueries'

interface ContributionSectionProps {
  userId: string
  isOwner: boolean
}

type ContributionTab = 'spots' | 'reports' | 'supplements' | 'statusReports'

const CONTRIBUTION_TABS = [
  { key: 'spots', label: '등록한 스팟' },
  { key: 'reports', label: '신규 제보' },
  { key: 'supplements', label: '정보보완' },
  { key: 'statusReports', label: '상태신고' },
] as const

/**
 * 날짜 포맷 함수
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 처리 상태 뱃지 컴포넌트
 */
function StatusBadge({
  status,
}: {
  status: 'pending' | 'approved' | 'rejected'
}) {
  const config = {
    pending: { label: '검토 중', className: 'bg-yellow-100 text-yellow-700' },
    approved: { label: '승인됨', className: 'bg-green-100 text-green-700' },
    rejected: { label: '반려됨', className: 'bg-red-100 text-red-700' },
  }
  const { label, className } = config[status]
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  )
}

/**
 * 기여 섹션 컴포넌트 — 등록한 스팟, 신규 제보, 정보보완, 상태신고
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 11.2, 11.3
 */
export function ContributionSection({
  userId,
  isOwner,
}: ContributionSectionProps) {
  const [activeTab, setActiveTab] = useState<ContributionTab>('spots')

  const isReportsEnabled = activeTab === 'reports'
  const isSupplementsEnabled = activeTab === 'supplements'
  const isStatusReportsEnabled = activeTab === 'statusReports'

  const { data: reportedSpots = [], isLoading: spotsLoading } =
    useUserReportedSpots(userId)
  const { data: reports = [], isLoading: reportsLoading } = useUserReports(
    userId,
    isReportsEnabled
  )
  const { data: supplements = [], isLoading: supplementsLoading } =
    useUserSupplements(userId, isSupplementsEnabled)
  const { data: statusReports = [], isLoading: statusReportsLoading } =
    useUserStatusReports(userId, isStatusReportsEnabled)

  return (
    <div>
      {/* 하위 탭 네비게이션 */}
      <div className="mb-5">
        <SubTabNavigation
          tabs={
            CONTRIBUTION_TABS as unknown as { key: string; label: string }[]
          }
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as ContributionTab)}
        />
      </div>

      {/* 등록한 스팟 탭 */}
      {activeTab === 'spots' && (
        <RegisteredSpotsTab
          spots={reportedSpots}
          isLoading={spotsLoading}
          isOwner={isOwner}
        />
      )}

      {/* 신규 제보 탭 */}
      {activeTab === 'reports' && (
        <ReportsTab
          reports={reports}
          isLoading={reportsLoading}
          isOwner={isOwner}
        />
      )}

      {/* 정보보완 탭 */}
      {activeTab === 'supplements' && (
        <SupplementsTab
          supplements={supplements}
          isLoading={supplementsLoading}
        />
      )}

      {/* 상태신고 탭 */}
      {activeTab === 'statusReports' && (
        <StatusReportsTab
          statusReports={statusReports}
          isLoading={statusReportsLoading}
        />
      )}
    </div>
  )
}

// ── 등록한 스팟 탭 ──────────────────────────────────────────

interface RegisteredSpotsTabProps {
  spots: { id: string; name: string; address: string }[]
  isLoading: boolean
  isOwner: boolean
}

function RegisteredSpotsTab({
  spots,
  isLoading,
  isOwner,
}: RegisteredSpotsTabProps) {
  if (isLoading) {
    return <ListSkeleton />
  }

  if (spots.length === 0) {
    return (
      <EmptyState
        message="아직 등록한 스팟이 없습니다"
        actionLabel={isOwner ? '스팟 등록하기' : undefined}
        actionHref={isOwner ? '/spots/register' : undefined}
      />
    )
  }

  return (
    <div className="space-y-3">
      {spots.map((spot) => (
        <Link
          key={spot.id}
          href={`/spots/${spot.id}`}
          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-surface p-4 shadow-sm transition-colors hover:bg-neutral-50"
        >
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-neutral-800">
              {spot.name}
            </h3>
            {spot.address && (
              <p className="mt-0.5 truncate text-sm text-neutral-500">
                {spot.address}
              </p>
            )}
          </div>
          <svg
            className="ml-3 h-4 w-4 flex-shrink-0 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      ))}
    </div>
  )
}

// ── 신규 제보 탭 ──────────────────────────────────────────

interface ReportsTabProps {
  reports: {
    id: string
    spotName: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
  }[]
  isLoading: boolean
  isOwner: boolean
}

function ReportsTab({ reports, isLoading, isOwner }: ReportsTabProps) {
  if (isLoading) {
    return <ListSkeleton />
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        message="아직 제보한 스팟이 없습니다"
        actionLabel={isOwner ? '스팟 제보하기' : undefined}
        actionHref={isOwner ? '/reports/new' : undefined}
      />
    )
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-surface p-4 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-neutral-800">
              {report.spotName}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500">
              {formatDate(report.createdAt)}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0">
            <StatusBadge status={report.status} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 정보보완 탭 ──────────────────────────────────────────

interface SupplementsTabProps {
  supplements: {
    id: string
    spotName: string
    type: string
    status: 'pending' | 'approved' | 'rejected'
    createdAt: string
  }[]
  isLoading: boolean
}

function SupplementsTab({ supplements, isLoading }: SupplementsTabProps) {
  if (isLoading) {
    return <ListSkeleton />
  }

  if (supplements.length === 0) {
    return <EmptyState message="아직 정보보완 신청이 없습니다" />
  }

  return (
    <div className="space-y-3">
      {supplements.map((supplement) => (
        <div
          key={supplement.id}
          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-surface p-4 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-neutral-800">
              {supplement.spotName}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500">
              {supplement.type} · {formatDate(supplement.createdAt)}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0">
            <StatusBadge status={supplement.status} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 상태신고 탭 ──────────────────────────────────────────

interface StatusReportsTabProps {
  statusReports: {
    id: string
    spotName: string
    reportedStatus: string
    resolved: boolean
    createdAt: string
  }[]
  isLoading: boolean
}

function StatusReportsTab({ statusReports, isLoading }: StatusReportsTabProps) {
  if (isLoading) {
    return <ListSkeleton />
  }

  if (statusReports.length === 0) {
    return <EmptyState message="아직 상태신고가 없습니다" />
  }

  return (
    <div className="space-y-3">
      {statusReports.map((report) => (
        <div
          key={report.id}
          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-surface p-4 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-neutral-800">
              {report.spotName}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500">
              {report.reportedStatus} · {formatDate(report.createdAt)}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                report.resolved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {report.resolved ? '처리됨' : '처리 중'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 공통 컴포넌트 ──────────────────────────────────────────

interface EmptyStateProps {
  message: string
  actionLabel?: string
  actionHref?: string
}

function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
        <svg
          className="h-8 w-8 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <p className="text-neutral-500">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </div>
  )
}
