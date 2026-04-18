'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSpots, SpotPin } from '@/hooks/useSpots'
import { RelatedContent, CATEGORY_CONFIG, SpotCategory } from '@/types'
import { CategoryIcon } from '@/components/common'
import { MapPinIcon } from '@/components/icons'

interface SameContentSpotsProps {
  /** 현재 스팟 ID (자기 자신 제외용) */
  currentSpotId: string
  /** 관련 작품 목록 */
  relatedContent: RelatedContent[]
}

/**
 * 같은 작품의 다른 스팟 목록 컴포넌트
 * 첫 번째 relatedContent.name 기준으로 검색하여 현재 스팟을 제외한 목록 표시
 * Requirements: 4.6, 4.7
 */
export function SameContentSpots({
  currentSpotId,
  relatedContent,
}: SameContentSpotsProps) {
  const contentName = relatedContent[0]?.name
  const { data: spots, isLoading } = useSpots(
    undefined,
    contentName,
    !!contentName
  )

  if (!contentName) return null

  const otherSpots = spots?.filter((spot) => spot.id !== currentSpotId) ?? []

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
        <div className="p-4 md:p-6">
          <h2 className="mb-4 text-lg font-bold text-main-text md:text-xl">
            같은 작품의 다른 스팟
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-40 flex-shrink-0 animate-pulse overflow-hidden rounded-lg border border-border"
              >
                <div className="aspect-video bg-neutral-200" />
                <div className="p-2">
                  <div className="mb-1 h-3 w-3/4 rounded bg-neutral-200" />
                  <div className="h-2 w-1/2 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (otherSpots.length === 0) return null

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
      <div className="p-4 md:p-6">
        <h2 className="mb-4 text-lg font-bold text-main-text md:text-xl">
          같은 작품의 다른 스팟
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {otherSpots.map((spot) => (
            <SameContentSpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SameContentSpotCard({ spot }: { spot: SpotPin }) {
  const [imageError, setImageError] = useState(false)
  const categoryConfig = spot.category ? CATEGORY_CONFIG[spot.category] : null

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group w-40 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden bg-neutral-100">
        {spot.thumbnailUrl && !imageError ? (
          <Image
            src={spot.thumbnailUrl}
            alt={spot.name}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MapPinIcon size={24} />
          </div>
        )}
      </div>
      <div className="p-2">
        <p className="truncate text-sm font-medium text-main-text">
          {spot.name}
        </p>
        {categoryConfig && (
          <span
            className="mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs"
            style={{
              backgroundColor: categoryConfig.bgColor,
              color: categoryConfig.fgColor,
            }}
          >
            <CategoryIcon category={spot.category as SpotCategory} size="lg" />
            {categoryConfig.label}
          </span>
        )}
      </div>
    </Link>
  )
}
