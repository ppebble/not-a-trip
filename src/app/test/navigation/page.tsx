'use client'

import { useState } from 'react'
import { NavigationPanel } from '@/components/route/NavigationPanel'
import { CompletionEffect } from '@/components/route/CompletionEffect'
import type { RouteSpot } from '@/types/route'

const MOCK_SPOTS: RouteSpot[] = [
  {
    spotId: 'spot-1',
    spotName: '시모키타자와역',
    coordinates: { lat: 35.6612, lng: 139.6682 },
    thumbnailUrl: '',
    distanceFromPrev: null,
    walkTimeFromPrev: null,
    note: '봇치 더 록 성지',
  },
  {
    spotId: 'spot-2',
    spotName: 'STARRY 라이브하우스',
    coordinates: { lat: 35.6618, lng: 139.6695 },
    thumbnailUrl: '',
    distanceFromPrev: 150,
    walkTimeFromPrev: 2,
  },
  {
    spotId: 'spot-3',
    spotName: '소실된 카페',
    coordinates: { lat: 35.6625, lng: 139.6701 },
    thumbnailUrl: '',
    distanceFromPrev: 80,
    walkTimeFromPrev: 1,
    isAvailable: false,
  },
  {
    spotId: 'spot-4',
    spotName: '키타자와 공원',
    coordinates: { lat: 35.663, lng: 139.671 },
    thumbnailUrl: '',
    distanceFromPrev: 120,
    walkTimeFromPrev: 2,
  },
]

export default function NavigationTestPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [showCompletion, setShowCompletion] = useState(false)

  const availableSpots = MOCK_SPOTS.filter((s) => s.isAvailable !== false)
  const progress =
    availableSpots.length > 0
      ? (availableSpots.filter((s) => checkedIds.includes(s.spotId)).length /
          availableSpots.length) *
        100
      : 0
  const isCompleted =
    availableSpots.length > 0 &&
    availableSpots.every((s) => checkedIds.includes(s.spotId))

  const handleCheckIn = (spotId: string) => {
    if (!checkedIds.includes(spotId)) {
      const next = [...checkedIds, spotId]
      setCheckedIds(next)
      const allDone = availableSpots.every((s) => next.includes(s.spotId))
      if (allDone) setShowCompletion(true)
    }
  }

  const handleMoveToNext = () => {
    for (let i = currentIndex + 1; i < MOCK_SPOTS.length; i++) {
      if (MOCK_SPOTS[i].isAvailable !== false) {
        setCurrentIndex(i)
        return
      }
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setCheckedIds([])
    setShowCompletion(false)
  }

  return (
    <main className="min-h-screen bg-navy-50 pt-14">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-navy-900">
          🧪 NavigationPanel 테스트
        </h1>

        {/* 상태 패널 */}
        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-navy-700">
            현재 상태
          </h2>
          <div className="space-y-1 text-xs text-navy-500">
            <p>현재 스팟 인덱스: {currentIndex}</p>
            <p>인증 완료: {checkedIds.join(', ') || '없음'}</p>
            <p>진행률: {Math.round(progress)}%</p>
            <p>완주: {isCompleted ? '✅' : '❌'}</p>
          </div>
          <button
            onClick={handleReset}
            className="mt-3 rounded bg-navy-600 px-3 py-1.5 text-xs text-white hover:bg-navy-700"
          >
            초기화
          </button>
        </div>

        {/* 스팟 목록 */}
        <div className="mb-40 space-y-2">
          {MOCK_SPOTS.map((spot, idx) => (
            <div
              key={spot.spotId}
              className={`flex items-center gap-3 rounded-lg p-3 ${
                idx === currentIndex
                  ? 'border-2 border-red-400 bg-red-50'
                  : spot.isAvailable === false
                    ? 'bg-gray-50 opacity-50'
                    : checkedIds.includes(spot.spotId)
                      ? 'bg-green-50'
                      : 'bg-white'
              }`}
              onClick={() => setCurrentIndex(idx)}
              role="button"
              tabIndex={0}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                  spot.isAvailable === false
                    ? 'bg-gray-400'
                    : checkedIds.includes(spot.spotId)
                      ? 'bg-green-600'
                      : idx === currentIndex
                        ? 'bg-red-600'
                        : 'bg-navy-600'
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-sm ${spot.isAvailable === false ? 'text-gray-400 line-through' : 'text-navy-900'}`}
              >
                {spot.spotName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* NavigationPanel */}
      <NavigationPanel
        currentSpot={MOCK_SPOTS[currentIndex]}
        currentSpotIndex={currentIndex}
        spots={MOCK_SPOTS}
        progress={progress}
        distanceToNext={250}
        estimatedTimeToNext={3}
        checkedSpotIds={checkedIds}
        currentPosition={{ lat: 35.6615, lng: 139.669 }}
        isCompleted={isCompleted}
        onCheckIn={handleCheckIn}
        onMoveToNext={handleMoveToNext}
        onEndRoute={handleReset}
      />

      {/* CompletionEffect */}
      <CompletionEffect
        isVisible={showCompletion}
        routeName="봇치 더 록 시모키타자와 코스"
        onClose={() => setShowCompletion(false)}
      />
    </main>
  )
}
