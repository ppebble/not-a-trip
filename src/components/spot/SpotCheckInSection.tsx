'use client'

import { useState, useEffect } from 'react'
import {
  CheckInButton,
  CheckInGallery,
  BadgeEarnedModal,
} from '@/components/checkin'
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
  const [checkInCount, setCheckInCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([])

  // 인증 수 조회
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`/api/checkins?spotId=${spotId}&limit=1`)
        if (res.ok) {
          const data = await res.json()
          setCheckInCount(data.total)
        }
      } catch (error) {
        console.error('Error fetching checkin count:', error)
      }
    }
    fetchCount()
  }, [spotId, refreshKey])

  const handleCheckInSuccess = (badges?: UserBadge[]) => {
    // 갤러리 새로고침
    setRefreshKey((prev) => prev + 1)

    // 뱃지 획득 시 모달 표시
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
        <CheckInGallery
          key={refreshKey}
          spotId={spotId}
          limit={8}
          showLoadMore={true}
        />
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
