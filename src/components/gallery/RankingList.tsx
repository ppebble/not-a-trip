'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AppIcon } from '@/components/common/AppIcon'

/**
 * 스팟 랭킹 아이템
 */
export interface SpotRankingItem {
  spotId: string
  spotName: string
  spotThumbnail?: string
  weeklyCheckIns: number
}

/**
 * 인증샷 랭킹 아이템
 */
export interface CheckInRankingItem {
  checkInId: string
  photoUrl: string
  userName: string
  likeCount: number
}

export interface RankingListProps {
  spotRanking: SpotRankingItem[]
  checkInRanking: CheckInRankingItem[]
  onSpotClick?: (spotId: string) => void
  onCheckInClick?: (checkInId: string) => void
}

/**
 * 순위에 따른 메달 이모지 반환
 */
function getRankMedal(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇'
    case 2:
      return '🥈'
    case 3:
      return '🥉'
    default:
      return ''
  }
}

/**
 * 순위에 따른 배경 스타일 반환
 */
function getRankStyle(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
    case 2:
      return 'bg-gradient-to-r from-neutral-50 to-neutral-50 border-neutral-200'
    case 3:
      return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
    default:
      return 'bg-surface border-neutral-100'
  }
}

/**
 * 명예의 전당 랭킹 리스트 컴포넌트
 * 이번 주 인기 스팟과 인기 인증샷을 랭킹으로 표시
 *
 * Requirements: 3.3
 * - 이번 주 인증 많은 스팟 랭킹
 * - 좋아요 많은 인증샷 랭킹
 */
export function RankingList({
  spotRanking,
  checkInRanking,
  onSpotClick,
  onCheckInClick,
}: RankingListProps) {
  const [spotImageErrors, setSpotImageErrors] = useState<Set<string>>(new Set())
  const [checkInImageErrors, setCheckInImageErrors] = useState<Set<string>>(
    new Set()
  )

  const handleSpotImageError = (spotId: string) => {
    setSpotImageErrors((prev) => new Set(prev).add(spotId))
  }

  const handleCheckInImageError = (checkInId: string) => {
    setCheckInImageErrors((prev) => new Set(prev).add(checkInId))
  }

  return (
    <div className="space-y-8">
      {/* 이번 주 인기 스팟 섹션 */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
          <AppIcon name="popular" size={24} />
          <span>이번 주 인기 스팟</span>
        </h2>

        {spotRanking.length === 0 ? (
          <div className="rounded-lg bg-neutral-50 p-8 text-center">
            <p className="text-neutral-500">
              아직 이번 주 인증 데이터가 없습니다
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {spotRanking.map((item, index) => {
              const rank = index + 1
              const medal = getRankMedal(rank)
              const rankStyle = getRankStyle(rank)
              const hasImageError = spotImageErrors.has(item.spotId)

              return (
                <div
                  key={item.spotId}
                  className={`flex items-center gap-4 rounded-xl border p-3 transition-all duration-200 hover:shadow-md ${rankStyle} ${onSpotClick ? 'cursor-pointer' : ''} `}
                  onClick={() => onSpotClick?.(item.spotId)}
                  role={onSpotClick ? 'button' : undefined}
                  tabIndex={onSpotClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (onSpotClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      onSpotClick(item.spotId)
                    }
                  }}
                >
                  {/* 순위 */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                    {medal ? (
                      <span className="text-2xl">{medal}</span>
                    ) : (
                      <span className="text-lg font-bold text-neutral-400">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* 썸네일 */}
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                    {item.spotThumbnail && !hasImageError ? (
                      <Image
                        src={item.spotThumbnail}
                        alt={item.spotName}
                        fill
                        className="object-cover"
                        onError={() => handleSpotImageError(item.spotId)}
                        sizes="56px"
                        unoptimized={item.spotThumbnail.startsWith('http')}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-xl">
                        <AppIcon name="spot" size={32} className="opacity-30" />
                      </div>
                    )}
                  </div>

                  {/* 스팟 정보 */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-medium text-neutral-900"
                      data-testid="spot-name"
                    >
                      {item.spotName}
                    </p>
                    <p className="text-sm text-neutral-500">
                      이번 주{' '}
                      <span className="font-semibold text-primary">
                        {item.weeklyCheckIns}
                      </span>
                      회 인증
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* 인기 인증샷 섹션 */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
          <span>❤️</span>
          <span>인기 인증샷</span>
        </h2>

        {checkInRanking.length === 0 ? (
          <div className="rounded-lg bg-neutral-50 p-8 text-center">
            <p className="text-neutral-500">
              아직 좋아요를 받은 인증샷이 없습니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {checkInRanking.map((item, index) => {
              const rank = index + 1
              const medal = getRankMedal(rank)
              const hasImageError = checkInImageErrors.has(item.checkInId)

              return (
                <div
                  key={item.checkInId}
                  className={`group relative overflow-hidden rounded-xl bg-surface shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${onCheckInClick ? 'cursor-pointer' : ''} `}
                  onClick={() => onCheckInClick?.(item.checkInId)}
                  role={onCheckInClick ? 'button' : undefined}
                  tabIndex={onCheckInClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (
                      onCheckInClick &&
                      (e.key === 'Enter' || e.key === ' ')
                    ) {
                      e.preventDefault()
                      onCheckInClick(item.checkInId)
                    }
                  }}
                >
                  {/* 이미지 */}
                  <div className="relative aspect-square w-full overflow-hidden">
                    {!hasImageError ? (
                      <Image
                        src={item.photoUrl}
                        alt={`${item.userName}님의 인증샷`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => handleCheckInImageError(item.checkInId)}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        unoptimized={item.photoUrl.startsWith('http')}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-3xl">
                        📷
                      </div>
                    )}

                    {/* 순위 뱃지 */}
                    <div
                      className={`absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full ${rank <= 3 ? 'shadow-md/90 bg-surface/90' : 'bg-black/50'} `}
                    >
                      {medal ? (
                        <span className="text-base">{medal}</span>
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {rank}
                        </span>
                      )}
                    </div>

                    {/* 좋아요 수 오버레이 */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="truncate text-xs text-white"
                          data-testid="user-name"
                        >
                          {item.userName}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-white">
                          ❤️ {item.likeCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
