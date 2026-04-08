'use client'

import { useState, memo } from 'react'
import Image from 'next/image'
import { CheckIn, Badge } from '@/types'

export interface ComparisonCardProps {
  checkIn: CheckIn
  spot: {
    id: string
    name: string
  }
  badges?: Badge[]
  isPriority?: boolean
  onClick?: () => void
}

/**
 * 인증샷 비교 카드 컴포넌트
 * 작품 원본 캡처와 유저 인증샷을 함께 보여주는 카드
 *
 * Requirements: 2.2, 2.3, 2.4
 * - 2.2: 작품 씬과 유저 사진을 split view로 표시
 * - 2.3: 유저 닉네임, 스팟 이름, 뱃지 아이콘 표시
 * - 2.4: 호버 시 스케일 애니메이션 및 오버레이
 */
export const ComparisonCard = memo(function ComparisonCard({
  checkIn,
  spot,
  badges = [],
  isPriority = false,
  onClick,
}: ComparisonCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [sceneImageError, setSceneImageError] = useState(false)

  const hasSceneImage = checkIn.sceneImageUrl && !sceneImageError

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-xl bg-surface shadow-md transition-all duration-300 ease-out ${isHovered ? 'scale-[1.02] shadow-xl' : 'scale-100'} `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`${checkIn.userName}님의 ${spot.name} 인증샷`}
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {hasSceneImage ? (
          /* 씬 비교 모드: Split View */
          <div className="relative h-full w-full">
            {/* 왼쪽: 작품 씬 */}
            <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
              <Image
                src={checkIn.sceneImageUrl!}
                alt="작품 속 장면"
                fill
                className="object-cover"
                onError={() => setSceneImageError(true)}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={isPriority}
              />
              {/* 씬 라벨 */}
              <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                작품
              </span>
            </div>

            {/* 오른쪽: 유저 인증샷 */}
            <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden border-l-2 border-white">
              <Image
                src={checkIn.photoUrl}
                alt={`${checkIn.userName}님의 인증샷`}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                priority={isPriority}
              />
              {/* 인증샷 라벨 */}
              <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                인증
              </span>
            </div>

            {/* 중앙 구분선 */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-surface shadow-sm" />
          </div>
        ) : (
          /* 단일 이미지 모드 */
          <Image
            src={imageError ? '/images/placeholder-spot.jpg' : checkIn.photoUrl}
            alt={`${checkIn.userName}님의 인증샷`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={isPriority}
          />
        )}

        {/* 호버 오버레이 */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} `}
        >
          {/* 추가 정보 (호버 시 표시) */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            {checkIn.comment && (
              <p className="mb-2 line-clamp-2 text-sm text-white">
                {checkIn.comment}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span>❤️ {checkIn.likeCount}</span>
              <span>•</span>
              <span>
                {new Date(checkIn.visitedAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 영역 */}
      <div className="p-3">
        {/* 유저 정보 */}
        <div className="mb-2 flex items-center gap-2">
          {checkIn.userImage ? (
            <Image
              src={checkIn.userImage}
              alt={checkIn.userName}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs">
              {checkIn.userName.charAt(0)}
            </div>
          )}
          <span
            className="text-sm font-medium text-neutral-900"
            data-testid="user-nickname"
          >
            {checkIn.userName}
          </span>
        </div>

        {/* 스팟 이름 */}
        <p
          className="mb-2 truncate text-sm text-neutral-600"
          data-testid="spot-name"
        >
          📍 {spot.name}
        </p>

        {/* 뱃지 아이콘 */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1" data-testid="badge-icons">
            {badges.slice(0, 3).map((badge) => (
              <span
                key={badge.id}
                className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700"
                title={badge.name}
              >
                🏅 {badge.name}
              </span>
            ))}
            {badges.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                +{badges.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
})
