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
const createNavyIcon = (isSelected: boolean = false) => {
  const size = isSelected ? 40 : 32
  const color = isSelected ? '#1e3a5f' : '#2d4a6f'
  const borderColor = isSelected ? '#fbbf24' : '#ffffff'

  return L.divIcon({
    className: 'custom-spot-pin',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid ${borderColor};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      ">
        <svg 
          style="transform: rotate(45deg); width: ${size * 0.5}px; height: ${size * 0.5}px;"
          viewBox="0 0 24 24" 
          fill="white"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
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
      <Popup className="spot-popup">
        <div className="min-w-[200px] p-2">
          {spot.thumbnailUrl && (
            <div className="relative mb-2 h-24 w-full overflow-hidden rounded">
              <Image
                src={spot.thumbnailUrl}
                alt={spot.name}
                fill
                className="object-cover"
                sizes="200px"
              />
            </div>
          )}
          <h3 className="text-sm font-semibold text-navy-800">{spot.name}</h3>
        </div>
      </Popup>
    </Marker>
  )
}
