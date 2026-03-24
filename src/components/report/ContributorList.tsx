'use client'

import { useContributors } from '@/hooks/useGalleryQueries'

interface ContributorListProps {
  spotId: string
}

/**
 * 스팟 정보 보완 기여자 목록 컴포넌트
 * Requirements: 3.3
 */
export function ContributorList({ spotId }: ContributorListProps) {
  const { data: contributors = [], isLoading } = useContributors(spotId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="border-navy-400 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
        <span className="text-navy-400 text-xs">기여자 로딩 중...</span>
      </div>
    )
  }

  if (contributors.length === 0) return null

  return (
    <div>
      <h3 className="text-navy-700 mb-2 text-sm font-medium">📋 정보 기여자</h3>
      <div className="flex flex-wrap gap-2">
        {contributors.map((c) => (
          <span
            key={c.contributorId}
            className="bg-navy-50 text-navy-600 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {c.contributorName}
            {c.count > 1 && (
              <span className="text-navy-400">({c.count}건)</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
