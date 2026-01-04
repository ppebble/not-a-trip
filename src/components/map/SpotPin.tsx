'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Image from 'next/image'
import { SpotPin as SpotPinType } from '@/types'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'

interface SpotPinProps {
  spot: SpotPinType
  onSelect?: (spotId: string) => void
}

// 네이비 테마 커스텀 마커 아이콘 생성
const createNavyIcon = (
  isSelected: boolean = false,
  isHovered: boolean = false
) => {
  const baseSize = 32
  const selectedSize = 40
  const hoveredSize = 36

  let size = baseSize
  if (isSelected) size = selectedSize
  else if (isHovered) size = hoveredSize

  const color = isSelected ? '#1e3a5f' : isHovered ? '#2563eb' : '#2d4a6f'
  const borderColor = isSelected ? '#fbbf24' : '#ffffff'
  const shadowIntensity = isSelected ? 0.4 : isHovered ? 0.35 : 0.3
  const pulseAnimation = isSelected ? 'spot-pin-pulse 2s infinite' : 'none'

  return L.divIcon({
    className: 'custom-spot-pin',
    html: `
      <div class="spot-pin-container" style="
        width: ${size}px;
        height: ${size}px;
        position: relative;
        cursor: pointer;
      ">
        <div class="spot-pin-marker" style="
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
          border: 3px solid ${borderColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,${shadowIntensity}), 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: ${pulseAnimation};
        ">
          <svg 
            style="transform: rotate(45deg); width: ${size * 0.5}px; height: ${size * 0.5}px;"
            viewBox="0 0 24 24" 
            fill="white"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        ${
          isSelected
            ? `
          <div class="spot-pin-ring" style="
            position: absolute;
            top: -4px;
            left: -4px;
            width: ${size + 8}px;
            height: ${size + 8}px;
            border: 2px solid #fbbf24;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            opacity: 0.6;
            animation: spot-pin-ring-pulse 2s infinite;
          "></div>
        `
            : ''
        }
      </div>
      <style>
        @keyframes spot-pin-pulse {
          0%, 100% { transform: rotate(-45deg) scale(1); }
          50% { transform: rotate(-45deg) scale(1.05); }
        }
        @keyframes spot-pin-ring-pulse {
          0%, 100% { opacity: 0.6; transform: rotate(-45deg) scale(1); }
          50% { opacity: 0.3; transform: rotate(-45deg) scale(1.1); }
        }
        .spot-pin-container:hover .spot-pin-marker {
          transform: rotate(-45deg) scale(1.1);
          box-shadow: 0 6px 16px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.15);
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

export default function SpotPin({ spot, onSelect }: SpotPinProps) {
  const { selectedSpotId, setSelectedSpot } = useMapStore()
  const { openPreview } = useUIStore()

  const isSelected = selectedSpotId === spot.id

  const handleClick = () => {
    // 스팟 선택 상태 업데이트
    setSelectedSpot(spot.id)

    // 미리보기 팝업 열기
    openPreview(spot.id)

    // 외부 콜백 호출
    onSelect?.(spot.id)
  }

  return (
    <Marker
      position={spot.coordinates}
      icon={createNavyIcon(isSelected)}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Popup
        className="spot-popup"
        closeButton={false}
        maxWidth={350}
        minWidth={320}
      >
        <div className="spot-popup-content">
          {spot.thumbnailUrl && (
            <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg">
              <Image
                src={spot.thumbnailUrl}
                alt={spot.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="350px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

              {/* 이미지 위 오버레이 정보 */}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="inline-block rounded-full bg-navy-600/80 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  📍 성지순례 스팟
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <h3 className="mb-1 text-lg font-bold leading-tight text-navy-800">
                {spot.name}
              </h3>
              <p className="text-sm leading-relaxed text-navy-600">
                애니메이션 작품의 실제 배경이 된 특별한 장소입니다. 팬들이 자주
                찾는 인기 성지순례 스팟 중 하나입니다.
              </p>
            </div>

            {/* 추가 정보 섹션 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center space-x-1 text-navy-600">
                <span>🎬</span>
                <span>애니메이션</span>
              </div>
              <div className="flex items-center space-x-1 text-navy-600">
                <span>⭐</span>
                <span>인기 스팟</span>
              </div>
              <div className="flex items-center space-x-1 text-navy-600">
                <span>📸</span>
                <span>사진 촬영 가능</span>
              </div>
              <div className="flex items-center space-x-1 text-navy-600">
                <span>🚶</span>
                <span>도보 접근</span>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex items-center justify-between border-t border-navy-100 pt-2">
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1 text-xs text-navy-600 transition-colors hover:text-navy-800">
                  <span>❤️</span>
                  <span>좋아요</span>
                </button>
                <button className="flex items-center space-x-1 text-xs text-navy-600 transition-colors hover:text-navy-800">
                  <span>💬</span>
                  <span>댓글</span>
                </button>
              </div>

              <button
                className="flex items-center space-x-1 rounded-full bg-navy-600 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-200 hover:bg-navy-700"
                onClick={(e) => {
                  e.stopPropagation()
                  // 상세 페이지로 이동하는 로직 추가 예정
                }}
              >
                <span>자세히 보기</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
