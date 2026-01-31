'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { SpotPin as SpotPinType, SpotCategory, CATEGORY_CONFIG } from '@/types'

// Leaflet 컴포넌트는 SSR 비활성화 필요
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

// HoverTooltip 동적 임포트
const HoverTooltip = dynamic(() => import('@/components/map/HoverTooltip'), {
  ssr: false,
})

// 테스트용 스팟 데이터
const testSpots: SpotPinType[] = [
  {
    id: '1',
    name: '슬램덩크 농구장',
    coordinates: [35.3106, 139.4897],
    thumbnailUrl: '/uploads/1768301458149-cn502o.jpg',
    category: 'animation',
  },
  {
    id: '2',
    name: '토트넘 홋스퍼 스타디움',
    coordinates: [35.3156, 139.4947],
    thumbnailUrl: '/uploads/1768404159000-3r5dcl.jpg',
    category: 'sports',
  },
  {
    id: '3',
    name: '이태원 클라쓰 촬영지',
    coordinates: [35.3056, 139.4847],
    thumbnailUrl: '',
    category: 'movie_drama',
  },
  {
    id: '4',
    name: 'BTS 뮤직비디오 촬영지',
    coordinates: [35.3206, 139.4797],
    thumbnailUrl: '/uploads/1768404188413-5hnnlt.jpg',
    category: 'music',
  },
  {
    id: '5',
    name: '리그오브레전드 PC방',
    coordinates: [35.3006, 139.4997],
    thumbnailUrl: '',
    category: 'game',
  },
  {
    id: '6',
    name: '기타 장소',
    coordinates: [35.3256, 139.4897],
    thumbnailUrl: '',
    category: 'other',
  },
]

/**
 * HoverTooltip 컴포넌트 테스트 페이지
 */
export default function HoverTooltipTestPage() {
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<
    SpotCategory | 'all'
  >('all')

  const filteredSpots =
    selectedCategory === 'all'
      ? testSpots
      : testSpots.filter((spot) => spot.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          HoverTooltip 컴포넌트 테스트
        </h1>

        {/* 카테고리 필터 */}
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            카테고리 필터
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              전체
            </button>
            {(Object.keys(CATEGORY_CONFIG) as SpotCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === cat
                      ? CATEGORY_CONFIG[cat].color
                      : undefined,
                }}
              >
                {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
              </button>
            ))}
          </div>
        </div>

        {/* 지도 영역 */}
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            지도에서 마커 호버 테스트
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            마커에 마우스를 올리면 HoverTooltip이 표시됩니다.
          </p>

          <div className="h-[400px] w-full overflow-hidden rounded-lg border border-gray-200">
            <MapContainer
              center={[35.3106, 139.4897]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredSpots.map((spot) => (
                <Marker
                  key={spot.id}
                  position={spot.coordinates}
                  eventHandlers={{
                    mouseover: () => setHoveredSpotId(spot.id),
                    mouseout: () => setHoveredSpotId(null),
                  }}
                >
                  <HoverTooltip
                    spot={spot}
                    isVisible={hoveredSpotId === spot.id}
                  />
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* 현재 상태 */}
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            현재 상태
          </h2>
          <div className="rounded bg-gray-50 p-4">
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <span className="font-medium">호버된 스팟:</span>{' '}
                {hoveredSpotId
                  ? testSpots.find((s) => s.id === hoveredSpotId)?.name
                  : '(없음)'}
              </li>
              <li>
                <span className="font-medium">선택된 카테고리:</span>{' '}
                {selectedCategory === 'all'
                  ? '전체'
                  : CATEGORY_CONFIG[selectedCategory].label}
              </li>
              <li>
                <span className="font-medium">표시된 마커:</span>{' '}
                {filteredSpots.length}개
              </li>
            </ul>
          </div>
        </div>

        {/* 스팟 목록 */}
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            테스트 스팟 목록
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                className={`rounded-lg border p-3 transition-colors ${
                  hoveredSpotId === spot.id
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                onMouseEnter={() => setHoveredSpotId(spot.id)}
                onMouseLeave={() => setHoveredSpotId(null)}
              >
                <div className="flex items-center gap-3">
                  {spot.thumbnailUrl ? (
                    <img
                      src={spot.thumbnailUrl}
                      alt={spot.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded text-xl"
                      style={{
                        backgroundColor:
                          CATEGORY_CONFIG[spot.category || 'other'].color,
                      }}
                    >
                      {CATEGORY_CONFIG[spot.category || 'other'].icon}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{spot.name}</p>
                    <p className="text-sm text-gray-500">
                      {CATEGORY_CONFIG[spot.category || 'other'].icon}{' '}
                      {CATEGORY_CONFIG[spot.category || 'other'].label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
