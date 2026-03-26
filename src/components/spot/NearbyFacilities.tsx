'use client'

import { NearbyFacility, FacilityType } from '@/types'
import { useCallback, useMemo, useState } from 'react'
import { groupFacilitiesByType } from '@/lib/facility-utils'
import { useInvalidateFacilities } from '@/hooks/useSpotDetail'
import dynamic from 'next/dynamic'
import FacilityFilter from './FacilityFilter'
import FacilityCard from './FacilityCard'

const FacilityReportForm = dynamic(() => import('./FacilityReportForm'), {
  loading: () => null,
})

interface NearbyFacilitiesProps {
  facilities: NearbyFacility[]
  /** 스팟 ID — 제보 후 목록 갱신에 사용 */
  spotId?: string
  /** 스팟 좌표 — 제보 폼 기본 위치에 사용 */
  spotCoordinates?: { lat: number; lng: number }
}

// 편의시설 타입별 한글 라벨과 아이콘
const FACILITY_CONFIG: Record<
  FacilityType,
  { label: string; icon: string; color: string }
> = {
  restaurant: {
    label: '음식점',
    icon: '🍽️',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  convenience_store: {
    label: '편의점',
    icon: '🏪',
    color: 'bg-primary-100 text-primary-800 border-primary-200',
  },
  cafe: {
    label: '카페',
    icon: '☕',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  station: {
    label: '역/정류장',
    icon: '🚉',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  other: {
    label: '기타',
    icon: '📍',
    color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  },
  // Otaku_Category
  coin_locker: {
    label: '코인 로커',
    icon: '🔐',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  solo_dining: {
    label: '혼밥 식당',
    icon: '🍜',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  charging_cafe: {
    label: '충전/와이파이',
    icon: '🔌',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  public_restroom: {
    label: '화장실',
    icon: '🚻',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  goods_shop: {
    label: '굿즈/잡화',
    icon: '🛍️',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
  },
}

// 기본 표시 개수
const DEFAULT_VISIBLE_COUNT = 3

export default function NearbyFacilities({
  facilities,
  spotId,
  spotCoordinates,
}: NearbyFacilitiesProps) {
  const [showReportForm, setShowReportForm] = useState(false)
  const { invalidate } = useInvalidateFacilities(spotId ?? null)

  // 카테고리 필터 상태 (빈 Set = 전체 표시)
  const [selectedTypes, setSelectedTypes] = useState<Set<FacilityType>>(
    new Set()
  )

  const handleToggleFilter = useCallback((type: FacilityType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedTypes(new Set())
  }, [])

  // 필터 적용된 편의시설 목록
  const filteredFacilities = useMemo(() => {
    if (selectedTypes.size === 0) return facilities
    return facilities.filter((f) => selectedTypes.has(f.type))
  }, [facilities, selectedTypes])

  // 편의시설을 타입별로 분류 (공유 유틸리티 함수 사용)
  const facilitiesByType = useMemo(() => {
    const grouped = groupFacilitiesByType(filteredFacilities)

    // 각 타입별로 거리순 정렬
    Object.keys(grouped).forEach((type) => {
      grouped[type as FacilityType].sort((a, b) => a.distance - b.distance)
    })

    return grouped
  }, [filteredFacilities])

  // 시설이 존재하는 카테고리 (필터 칩 표시용 — 전체 기준)
  const availableTypes = useMemo(() => {
    return Object.entries(groupFacilitiesByType(facilities))
      .filter(([, items]) => items.length > 0)
      .map(([type]) => type as FacilityType)
  }, [facilities])

  // 타입 순서 (필터 적용 후 시설이 있는 타입만)
  const orderedTypes = useMemo(() => {
    return Object.entries(facilitiesByType)
      .filter(([, items]) => items.length > 0)
      .map(([type]) => type as FacilityType)
  }, [facilitiesByType])

  // 아코디언 열림 상태 (첫 번째 타입만 기본 열림)
  const [openTypes, setOpenTypes] = useState<Set<FacilityType>>(() => {
    return new Set(orderedTypes.length > 0 ? [orderedTypes[0]] : [])
  })

  // 더보기 상태 (타입별)
  const [expandedTypes, setExpandedTypes] = useState<Set<FacilityType>>(
    new Set()
  )

  const toggleAccordion = (type: FacilityType) => {
    setOpenTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const toggleExpand = (type: FacilityType) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  // 편의시설이 없는 경우
  if (facilities.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-main-text">근처 편의시설</h2>
          <button
            onClick={() => setShowReportForm(true)}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
          >
            편의시설 제보
          </button>
        </div>
        <div className="py-8 text-center">
          <div className="mb-2 text-4xl">🏪</div>
          <p className="text-sub-text">근처에 등록된 편의시설이 없습니다.</p>
        </div>
        <FacilityReportForm
          isOpen={showReportForm}
          onClose={() => setShowReportForm(false)}
          onSuccess={invalidate}
          spotCoordinates={spotCoordinates}
        />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-main-text">
          근처 편의시설 ({facilities.length}개)
        </h2>
        <button
          onClick={() => setShowReportForm(true)}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
        >
          편의시설 제보
        </button>
      </div>

      <FacilityFilter
        availableTypes={availableTypes}
        selectedTypes={selectedTypes}
        onToggle={handleToggleFilter}
        onSelectAll={handleSelectAll}
        config={FACILITY_CONFIG}
      />

      <div className="space-y-3">
        {orderedTypes.map((type) => {
          const typeFacilities = facilitiesByType[type]
          const config = FACILITY_CONFIG[type]
          const isOpen = openTypes.has(type)
          const isExpanded = expandedTypes.has(type)
          const hasMore = typeFacilities.length > DEFAULT_VISIBLE_COUNT
          const visibleFacilities = isExpanded
            ? typeFacilities
            : typeFacilities.slice(0, DEFAULT_VISIBLE_COUNT)

          return (
            <div
              key={type}
              className="overflow-hidden rounded-lg border border-border"
            >
              {/* 아코디언 헤더 */}
              <button
                onClick={() => toggleAccordion(type)}
                className="flex w-full items-center justify-between bg-accent-surface px-4 py-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{config.icon}</span>
                  <h3 className="text-lg font-semibold text-main-text">
                    {config.label}
                  </h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
                    {typeFacilities.length}
                  </span>
                </div>
                <svg
                  className={`h-5 w-5 text-sub-text transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* 아코디언 콘텐츠 */}
              {isOpen && (
                <div className="border-t border-border p-4">
                  <div className="space-y-3">
                    {visibleFacilities.map((facility) => (
                      <FacilityCard
                        key={facility.id}
                        facility={facility}
                        config={config}
                      />
                    ))}
                  </div>

                  {/* 더보기/접기 버튼 */}
                  {hasMore && (
                    <button
                      onClick={() => toggleExpand(type)}
                      className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-2 text-sm font-medium text-sub-text transition-colors hover:bg-accent-surface"
                    >
                      {isExpanded ? (
                        <>
                          <span>접기</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>
                            더보기 (+
                            {typeFacilities.length - DEFAULT_VISIBLE_COUNT})
                          </span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <FacilityReportForm
        isOpen={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSuccess={invalidate}
        spotCoordinates={spotCoordinates}
      />
    </div>
  )
}
