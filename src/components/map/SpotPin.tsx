'use client'

import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react'
import { Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { SpotPin as SpotPinType, CATEGORY_CONFIG, SpotCategory } from '@/types'
import { useShallow } from 'zustand/react/shallow'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore, useIsPreviewHovered } from '@/stores/uiStore'
import { useBottomSheetStore } from '@/stores/bottomSheetStore'

interface SpotPinProps {
  spot: SpotPinType
  onSelect?: (spotId: string) => void
}

// Z-Index 상수 (근접 핀 간 z-index 충돌 방지를 위해 간격 확대)
// Leaflet은 위도 기반으로 ±1000 정도의 z-index를 자동 부여하므로
// hovered를 충분히 높게 설정하여 항상 최상위에 표시
const Z_INDEX = {
  base: 0,
  hovered: 10000,
}

// 핀 크기 상수
const PIN_SIZES = {
  base: 48,
  hovered: 54,
}

// 카테고리별 색상 가져오기
const getCategoryColor = (category?: SpotCategory): string => {
  if (!category) return '#2d4a6f' // 기본 네이비 색상
  return CATEGORY_CONFIG[category]?.color || '#2d4a6f'
}

// 카테고리별 아이콘 가져오기 (SVG 이미지 경로 또는 fallback 이모티콘)
const getCategoryIcon = (
  category?: SpotCategory
): { path: string; fallback: string } => {
  const fallbackIcons: Record<SpotCategory, string> = {
    animation: '🎬',
    sports: '⚽',
    movie_drama: '🎥',
    music: '🎵',
    game: '🎮',
    other: '📍',
  }

  if (!category) return { path: '/icons/categories/other.webp', fallback: '📍' }
  return {
    path: CATEGORY_CONFIG[category]?.icon || '/icons/categories/other.webp',
    fallback: fallbackIcons[category] || '📍',
  }
}

// 작품 이미지 핀 아이콘 생성
const createImagePinIcon = (
  thumbnailUrl: string,
  isHovered: boolean = false,
  category?: SpotCategory,
  checkInCount?: number
) => {
  const size = isHovered ? PIN_SIZES.hovered : PIN_SIZES.base

  // 카테고리별 색상 적용
  const categoryColor = getCategoryColor(category)
  const categoryIconData = getCategoryIcon(category)

  // 테두리 색상: 호버 시 노란색, 기본은 카테고리 색상
  const borderColor = isHovered ? '#fbbf24' : categoryColor
  const borderWidth = isHovered ? 4 : 3
  const shadowIntensity = isHovered ? 0.5 : 0.3

  // 호버 시 글로우 효과
  const glowEffect = isHovered
    ? 'box-shadow: 0 0 12px 2px rgba(251, 191, 36, 0.4);'
    : ''

  // 인기 스팟 뱃지 (인증 수 10개 이상)
  const isPopular = checkInCount && checkInCount >= 10
  const popularBadge = isPopular
    ? `<div style="
        position: absolute;
        top: -4px;
        right: -4px;
        background: linear-gradient(135deg, #f59e0b, #ef4444);
        color: white;
        font-size: 10px;
        font-weight: bold;
        padding: 2px 4px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 10;
      ">🔥${checkInCount}</div>`
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
      ">
        <img 
          src="${categoryIconData.path}" 
          alt="category" 
          style="width: 24px; height: 24px;"
          onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=font-size:24px>${categoryIconData.fallback}</span>';"
        />
      </div>`
    : `<div style="
        width: 100%;
        height: 100%;
        background: ${categoryColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img 
          src="${categoryIconData.path}" 
          alt="category" 
          style="width: 24px; height: 24px;"
          onerror="this.style.display='none'; this.parentElement.innerHTML+='<span style=font-size:24px>${categoryIconData.fallback}</span>';"
        />
      </div>`

  // 호버 상태 클래스
  const hoverClass = isHovered ? 'is-hovered' : ''

  return L.divIcon({
    className: `custom-image-spot-pin ${hoverClass}`,
    html: `
      <div class="image-pin-container ${hoverClass}" style="
        width: ${size}px;
        height: ${size + 12}px;
        position: relative;
        cursor: pointer;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,${shadowIntensity}));
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
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
        
        ${popularBadge}
      </div>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -(size + 12)],
  })
}

export default memo(function SpotPin({ spot, onSelect }: SpotPinProps) {
  const map = useMap()
  const { setSelectedSpot } = useMapStore(
    useShallow((state) => ({
      setSelectedSpot: state.setSelectedSpot,
    }))
  )
  const { openPreview, closePreview, previewSpotId } = useUIStore(
    useShallow((state) => ({
      openPreview: state.openPreview,
      closePreview: state.closePreview,
      previewSpotId: state.previewSpotId,
    }))
  )
  const isPreviewHovered = useIsPreviewHovered()
  const { open: openBottomSheet } = useBottomSheetStore(
    useShallow((state) => ({ open: state.open }))
  )
  const [isHovered, setIsHovered] = useState(false)

  // isPreviewHovered의 최신 값을 참조하기 위한 ref
  const isPreviewHoveredRef = useRef(isPreviewHovered)
  useEffect(() => {
    isPreviewHoveredRef.current = isPreviewHovered
  }, [isPreviewHovered])

  // previewSpotId의 최신 값을 참조하기 위한 ref (다른 핀 호버 감지용)
  const previewSpotIdRef = useRef(previewSpotId)
  useEffect(() => {
    previewSpotIdRef.current = previewSpotId
  }, [previewSpotId])

  // 마커의 화면 좌표 계산
  const getMarkerScreenPosition = useCallback(() => {
    const point = map.latLngToContainerPoint(spot.coordinates)
    return { x: point.x, y: point.y }
  }, [map, spot.coordinates])

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

  // Z-Index 계산: 호버 시 최상위
  const zIndexOffset = isHovered ? Z_INDEX.hovered : Z_INDEX.base

  // 아이콘을 메모이제이션하여 불필요한 재생성 방지 (카테고리 색상/아이콘 적용)
  const icon = useMemo(
    () =>
      createImagePinIcon(
        spot.thumbnailUrl,
        isHovered,
        spot.category,
        spot.checkInCount
      ),
    [spot.thumbnailUrl, spot.category, spot.checkInCount, isHovered]
  )

  const handleClick = useCallback(() => {
    // 모바일 터치 디바이스 처리 (Requirements: 1.2, 4.1, 4.3)
    if (isTouchDevice) {
      // 기존 터치 리셋 타이머 취소
      if (touchResetTimeoutRef.current) {
        clearTimeout(touchResetTimeoutRef.current)
      }

      if (touchCount === 0) {
        // 첫 번째 터치: Bottom Sheet 열기 (모바일)
        setTouchCount(1)
        setIsHovered(true)
        setSelectedSpot(spot.id)
        openBottomSheet(spot.id)

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
    openBottomSheet,
    onSelect,
    isTouchDevice,
    touchCount,
  ])

  // Debounced 호버 핸들러 - 호버 시 SpotPreview 열기
  const handleMouseOver = useCallback(() => {
    // 터치 디바이스에서는 호버 이벤트 무시
    if (isTouchDevice) return

    // 기존 타이머 취소
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    // 100ms 후 호버 상태 설정 및 SpotPreview 열기
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true)
      openPreview(spot.id, getMarkerScreenPosition())
    }, 100)
  }, [isTouchDevice, spot.id, openPreview, getMarkerScreenPosition])

  // Debounced 호버 아웃 핸들러 - 호버 아웃 시 SpotPreview 닫기
  const handleMouseOut = useCallback(() => {
    // 터치 디바이스에서는 호버 이벤트 무시
    if (isTouchDevice) return

    // 기존 타이머 취소
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    // 250ms 후 호버 상태 해제 (핀 간 전환 시 안정성 확보)
    hoverTimeoutRef.current = setTimeout(() => {
      // 툴팁 위에 마우스가 있으면 닫지 않음 (ref로 최신 값 참조)
      if (isPreviewHoveredRef.current) return
      // 다른 핀의 mouseover가 이미 트리거된 경우 closePreview 스킵
      if (previewSpotIdRef.current && previewSpotIdRef.current !== spot.id)
        return
      setIsHovered(false)
      closePreview()
    }, 250)
  }, [isTouchDevice, closePreview, spot.id])

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
})
