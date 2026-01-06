'use client'

import { NearbyFacility, FacilityType } from '@/types'
import { useMemo } from 'react'

interface NearbyFacilitiesProps {
  facilities: NearbyFacility[]
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
    color: 'bg-blue-100 text-blue-800 border-blue-200',
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
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
}

export default function NearbyFacilities({
  facilities,
}: NearbyFacilitiesProps) {
  // 편의시설을 타입별로 분류
  const facilitiesByType = useMemo(() => {
    const grouped: Record<FacilityType, NearbyFacility[]> = {
      restaurant: [],
      convenience_store: [],
      cafe: [],
      station: [],
      other: [],
    }

    facilities.forEach((facility) => {
      if (grouped[facility.type]) {
        grouped[facility.type].push(facility)
      } else {
        grouped.other.push(facility)
      }
    })

    // 각 타입별로 거리순 정렬
    Object.keys(grouped).forEach((type) => {
      grouped[type as FacilityType].sort((a, b) => a.distance - b.distance)
    })

    return grouped
  }, [facilities])

  // 편의시설이 없는 경우
  if (facilities.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">근처 편의시설</h2>
        <div className="py-8 text-center">
          <div className="mb-2 text-4xl">🏪</div>
          <p className="text-gray-500">근처에 등록된 편의시설이 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-900">
        근처 편의시설 ({facilities.length}개)
      </h2>

      <div className="space-y-6">
        {Object.entries(facilitiesByType).map(([type, typeFacilities]) => {
          if (typeFacilities.length === 0) return null

          const config = FACILITY_CONFIG[type as FacilityType]

          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{config.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {config.label} ({typeFacilities.length})
                </h3>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {typeFacilities.map((facility) => (
                  <FacilityCard
                    key={facility.id}
                    facility={facility}
                    config={config}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface FacilityCardProps {
  facility: NearbyFacility
  config: { label: string; icon: string; color: string }
}

function FacilityCard({ facility, config }: FacilityCardProps) {
  // 거리를 사용자 친화적 형태로 변환
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    } else {
      return `${(meters / 1000).toFixed(1)}km`
    }
  }

  // 외부 지도 링크 생성 (Google Maps)
  const handleMapClick = () => {
    const [lat, lng] = facility.coordinates
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(facility.name)}`
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center space-x-2">
            <h4 className="truncate font-semibold text-gray-900">
              {facility.name}
            </h4>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${config.color}`}
            >
              {config.label}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{facility.address}</span>
            </div>

            <div className="flex items-center space-x-1">
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              <span className="font-medium text-navy-600">
                {formatDistance(facility.distance)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleMapClick}
          className="ml-2 flex-shrink-0 rounded-md bg-navy-50 p-2 text-navy-600 transition-colors hover:bg-navy-100 hover:text-navy-700"
          title="지도에서 보기"
        >
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
