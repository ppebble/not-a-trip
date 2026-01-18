'use client'

import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { SpotPin as SpotPinType } from '@/types'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'

interface SpotPinProps {
  spot: SpotPinType
  onSelect?: (spotId: string) => void
}

// 작품 이미지 핀 아이콘 생성
const createImagePinIcon = (
  thumbnailUrl: string,
  isSelected: boolean = false,
  isHovered: boolean = false
) => {
  // 핀 크기 설정 (기존보다 확대)
  const baseSize = 48
  const selectedSize = 56
  const hoveredSize = 52

  let size = baseSize
  if (isSelected) size = selectedSize
  else if (isHovered) size = hoveredSize

  // 테두리 색상
  const borderColor = isSelected ? '#fbbf24' : '#2d4a6f'
  const borderWidth = isSelected ? 4 : 3
  const shadowIntensity = isSelected ? 0.5 : isHovered ? 0.4 : 0.3

  // 이미지 URL이 있으면 이미지 핀, 없으면 기본 아이콘
  const hasImage = thumbnailUrl && thumbnailUrl.length > 0

  const imageContent = hasImage
    ? `<img 
        src="${thumbnailUrl}" 
        alt="spot" 
        style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        "
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div class="fallback-icon" style="
        display: none;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #2d4a6f 0%, #1e3a5f 100%);
        border-radius: 50%;
        align-items: center;
        justify-content: center;
      ">
        <svg viewBox="0 0 24 24" fill="white" style="width: 60%; height: 60%;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>`
    : `<div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #2d4a6f 0%, #1e3a5f 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg viewBox="0 0 24 24" fill="white" style="width: 60%; height: 60%;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>`

  return L.divIcon({
    className: 'custom-image-spot-pin',
    html: `
      <div class="image-pin-container" style="
        width: ${size}px;
        height: ${size + 12}px;
        position: relative;
        cursor: pointer;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,${shadowIntensity}));
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <!-- 원형 이미지 컨테이너 -->
        <div class="image-circle" style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${borderWidth}px solid ${borderColor};
          overflow: hidden;
          background: #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          ${isSelected ? 'animation: image-pin-pulse 2s infinite;' : ''}
        ">
          ${imageContent}
        </div>
        
        <!-- 핀 꼬리 (삼각형) -->
        <div class="pin-tail" style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid ${borderColor};
        "></div>
        
        ${
          isSelected
            ? `
          <!-- 선택 시 외곽 링 -->
          <div class="selection-ring" style="
            position: absolute;
            top: -4px;
            left: -4px;
            width: ${size + 8}px;
            height: ${size + 8}px;
            border: 2px solid #fbbf24;
            border-radius: 50%;
            opacity: 0.6;
            animation: ring-pulse 2s infinite;
          "></div>
        `
            : ''
        }
      </div>
      
      <style>
        @keyframes image-pin-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.08); }
        }
        .image-pin-container:hover .image-circle {
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .custom-image-spot-pin {
          background: transparent !important;
          border: none !important;
        }
      </style>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -(size + 12)],
  })
}

export default function SpotPin({ spot, onSelect }: SpotPinProps) {
  const { selectedSpotId, setSelectedSpot } = useMapStore()
  const { openPreview } = useUIStore()

  const isSelected = selectedSpotId === spot.id

  const handleClick = () => {
    // 스팟 선택 상태 업데이트
    setSelectedSpot(spot.id)

    // 미리보기 팝업 열기 (SpotPreview 컴포넌트가 표시됨)
    openPreview(spot.id)

    // 외부 콜백 호출
    onSelect?.(spot.id)
  }

  return (
    <Marker
      position={spot.coordinates}
      icon={createImagePinIcon(spot.thumbnailUrl, isSelected)}
      eventHandlers={{
        click: handleClick,
      }}
    />
  )
}
