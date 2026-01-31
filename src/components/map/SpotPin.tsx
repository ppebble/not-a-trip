'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { SpotPin as SpotPinType, CATEGORY_CONFIG, SpotCategory } from '@/types'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'

interface SpotPinProps {
  spot: SpotPinType
  onSelect?: (spotId: string) => void
}

// Z-Index 상수
const Z_INDEX = {
  base: 0,
  selected: 500,
  hovered: 1000,
}

// 핀 크기 상수
const PIN_SIZES = {
  base: 48,
  hovered: 54,
  selected: 58,
}

// 카테고리별 색상 가져오기
const getCategoryColor = (category?: SpotCategory): string => {
  if (!category) return '#2d4a6f' // 기본 네이비 색상
  return CATEGORY_CONFIG[category]?.color || '#2d4a6f'
}

// 카테고리별 아이콘 가져오기
const getCategoryIcon = (category?: SpotCategory): string => {
  if (!category) return '📍' // 기본 아이콘
  return CATEGORY_CONFIG[category]?.icon || '📍'
}

// 작품 이미지 핀 아이콘 생성
const createImagePinIcon = (
  thumbnailUrl: string,
  isSelected: boolean = false,
  isHovered: boolean = false,
  category?: SpotCategory
) => {
  // 핀 크기 설정 (호버/선택 상태에 따라 확대)
  const getSize = () => {
    if (isSelected) return PIN_SIZES.selected
    if (isHovered) return PIN_SIZES.hovered
    return PIN_SIZES.base
  }
  const size = getSize()

  // 카테고리별 색상 적용
  const categoryColor = getCategoryColor(category)
  const categoryIcon = getCategoryIcon(category)

  // 테두리 색상 및 스타일 (카테고리 색상 적용)
  const getBorderColor = () => {
    if (isSelected) return '#fbbf24'
    if (isHovered) return '#60a5fa'
    return categoryColor
  }
  const borderColor = getBorderColor()
  const borderWidth = isSelected ? 4 : 3
  const getShadowIntensity = () => {
    if (isSelected) return 0.5
    if (isHovered) return 0.45
    return 0.3
  }
  const shadowIntensity = getShadowIntensity()

  // 호버 시 글로우 효과
  const glowEffect =
    isHovered && !isSelected
      ? 'box-shadow: 0 0 12px 2px rgba(96, 165, 250, 0.4);'
      : ''

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
        background: ${categoryColor};
        border-radius: 50%;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      ">
        ${categoryIcon}
      </div>`
    : `<div style="
        width: 100%;
        height: 100%;
        background: ${categoryColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      ">
        ${categoryIcon}
      </div>`

  // 호버 상태 클래스
  const hoverClass = isHovered ? 'is-hovered' : ''
  const selectedClass = isSelected ? 'is-selected' : ''

  return L.divIcon({
    className: `custom-image-spot-pin ${hoverClass} ${selectedClass}`,
    html: `
      <div class="image-pin-container ${hoverClass} ${selectedClass}" style="
        width: ${size}px;
        height: ${size + 12}px;
        position: relative;
        cursor: pointer;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,${shadowIntensity}));
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform: ${isHovered && !isSelected ? 'translateY(-4px)' : 'translateY(0)'};
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
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          ${glowEffect}
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
          transition: border-color 0.25s ease;
        "></div>
        
        ${
          isSelected
            ? `
          <!-- 선택 시 외곽 링 -->
          <div class="selection-ring" style="
            position: absolute;
            top: -6px;
            left: -6px;
            width: ${size + 12}px;
            height: ${size + 12}px;
            border: 3px solid #fbbf24;
            border-radius: 50%;
            opacity: 0.8;
            animation: ring-pulse 1.5s infinite;
          "></div>
          <!-- 선택 시 내부 글로우 -->
          <div class="selection-glow" style="
            position: absolute;
            top: 0;
            left: 0;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            box-shadow: inset 0 0 8px rgba(251, 191, 36, 0.3);
            pointer-events: none;
          "></div>
        `
            : ''
        }
        
        ${
          isHovered && !isSelected
            ? `
          <!-- 호버 시 외곽 링 -->
          <div class="hover-ring" style="
            position: absolute;
            top: -4px;
            left: -4px;
            width: ${size + 8}px;
            height: ${size + 8}px;
            border: 2px solid #60a5fa;
            border-radius: 50%;
            opacity: 0.6;
            animation: hover-ring-pulse 1s infinite;
          "></div>
        `
            : ''
        }
      </div>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -(size + 12)],
  })
}

export default function SpotPin({ spot, onSelect }: SpotPinProps) {
  const { selectedSpotId, setSelectedSpot } = useMapStore()
  const { openPreview, closePreview } = useUIStore()
  const [isHovered, setIsHovered] = useState(false)

  // 모바일 터치 관련 상태 (Requirements: 4.1, 4.2, 4.3)
  const [touchCount, setTouchCount] = useState(0)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // Debounce를 위한 타이머 ref
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // 터치 리셋 타이머 ref
  const touchResetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 터치 디바이스 감지
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch =
        'ontouchstart' in window ||
        window.matchMedia('(hover: none)').matches ||
        navigator.maxTouchPoints > 0
      setIsTouchDevice(hasTouch)
    }

    checkTouchDevice()

    // 윈도우 리사이즈 시 재확인 (태블릿 등 하이브리드 디바이스 대응)
    window.addEventListener('resize', checkTouchDevice)
    return () => window.removeEventListener('resize', checkTouchDevice)
  }, [])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (touchResetTimeoutRef.current) {
        clearTimeout(touchResetTimeoutRef.current)
      }
    }
  }, [])

  const isSelected = selectedSpotId === spot.id

  // 다른 곳 터치 시 툴팁 숨김 및 터치 카운트 리셋 (Requirements: 4.2)
  useEffect(() => {
    if (!isTouchDevice) return

    const handleOutsideTouch = (e: TouchEvent) => {
      // 마커 외부 터치 시 상태 리셋
      const target = e.target as HTMLElement
      const isMarkerTouch = target.closest('.custom-image-spot-pin')

      if (!isMarkerTouch && touchCount > 0) {
        setTouchCount(0)
        setIsHovered(false)
      }
    }

    document.addEventListener('touchstart', handleOutsideTouch)
    return () => document.removeEventListener('touchstart', handleOutsideTouch)
  }, [isTouchDevice, touchCount])

  // Z-Index 계산: 호버 > 선택 > 기본
  const getZIndexOffset = () => {
    if (isHovered) return Z_INDEX.hovered
    if (isSelected) return Z_INDEX.selected
    return Z_INDEX.base
  }
  const zIndexOffset = getZIndexOffset()

  // 아이콘을 메모이제이션하여 불필요한 재생성 방지 (카테고리 색상/아이콘 적용)
  const icon = useMemo(
    () =>
      createImagePinIcon(
        spot.thumbnailUrl,
        isSelected,
        isHovered,
        spot.category
      ),
    [spot.thumbnailUrl, spot.category, isSelected, isHovered]
  )

  const handleClick = useCallback(() => {
    // 모바일 터치 디바이스 처리 (Requirements: 4.1, 4.3)
    if (isTouchDevice) {
      // 기존 터치 리셋 타이머 취소
      if (touchResetTimeoutRef.current) {
        clearTimeout(touchResetTimeoutRef.current)
      }

      if (touchCount === 0) {
        // 첫 번째 터치: SpotPreview 열기
        setTouchCount(1)
        setIsHovered(true)
        setSelectedSpot(spot.id)
        openPreview(spot.id)

        // 3초 후 터치 카운트 리셋
        touchResetTimeoutRef.current = setTimeout(() => {
          setTouchCount(0)
        }, 3000)
        return
      }

      // 두 번째 터치: 추후 상세 모달 구현 예정
      setTouchCount(0)
      setIsHovered(false)
    }

    // 데스크톱 클릭: 추후 상세 모달 구현 예정
    // 현재는 스팟 선택만 처리
    setSelectedSpot(spot.id)

    // 외부 콜백 호출
    onSelect?.(spot.id)
  }, [
    spot.id,
    setSelectedSpot,
    openPreview,
    onSelect,
    isTouchDevice,
    touchCount,
  ])

  // Debounced 호버 핸들러 (50ms) - 호버 시 SpotPreview 열기
  const handleMouseOver = useCallback(() => {
    // 터치 디바이스에서는 호버 이벤트 무시
    if (isTouchDevice) return

    // 기존 타이머 취소
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    // 50ms 후 호버 상태 설정 및 SpotPreview 열기
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true)
      setSelectedSpot(spot.id)
      openPreview(spot.id)
    }, 50)
  }, [isTouchDevice, spot.id, setSelectedSpot, openPreview])

  // Debounced 호버 아웃 핸들러 (50ms) - 호버 아웃 시 SpotPreview 닫기
  const handleMouseOut = useCallback(() => {
    // 터치 디바이스에서는 호버 이벤트 무시
    if (isTouchDevice) return

    // 기존 타이머 취소
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    // 50ms 후 호버 상태 해제 및 SpotPreview 닫기
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
      closePreview()
    }, 50)
  }, [isTouchDevice, closePreview])

  return (
    <Marker
      position={spot.coordinates}
      icon={icon}
      zIndexOffset={zIndexOffset}
      eventHandlers={{
        click: handleClick,
        mouseover: handleMouseOver,
        mouseout: handleMouseOut,
      }}
    />
  )
}
