'use client'

import { useState } from 'react'
import {
  CheckInButton,
  CheckInGallery,
  BadgeEarnedModal,
} from '@/components/checkin'
import {
  useCheckInCount,
  useInvalidateCheckIns,
  useInvalidateCheckInCount,
} from '@/hooks/useGalleryQueries'
import { UserBadge } from '@/types'

interface SpotCheckInSectionProps {
  spotId: string
  spotName: string
  sceneImageUrl?: string
}

/**
 * 스팟 상세 페이지의 인증 섹션
 * Requirements: 5.1, 5.3, 6.2
 */
export function SpotCheckInSection({
  spotId,
  spotName,
  sceneImageUrl,
}: SpotCheckInSectionProps) {
  const { data: checkInCount = 0 } = useCheckInCount(spotId)
  const invalidateCheckIns = useInvalidateCheckIns()
  const invalidateCheckInCount = useInvalidateCheckInCount(spotId)
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([])

  const handleCheckInSuccess = (badges?: UserBadge[]) => {
    // React Query 캐시 무효화로 갤러리 + 카운트 새로고침
    invalidateCheckIns()
    invalidateCheckInCount()

    if (badges && badges.length > 0) {
      setEarnedBadges(badges)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">순례 인증</h2>
            <p className="mt-1 text-sm text-gray-500">
              {checkInCount > 0
                ? `${checkInCount}명이 이 장소를 인증했습니다`
                : '첫 번째 순례자가 되어보세요!'}
            </p>
          </div>
          <CheckInButton
            spotId={spotId}
            spotName={spotName}
            sceneImageUrl={sceneImageUrl}
            onSuccess={() => handleCheckInSuccess()}
          />
        </div>

        {/* 인증 갤러리 */}
        <CheckInGallery spotId={spotId} limit={8} showLoadMore={true} />
      </div>

      {/* 뱃지 획득 모달 */}
      {earnedBadges.length > 0 && (
        <BadgeEarnedModal
          badges={earnedBadges}
          onClose={() => setEarnedBadges([])}
        />
      )}
    </div>
  )
}
