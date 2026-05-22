'use client'

/**
 * SpotPin - 순수 Leaflet API 기반 마커 컴포넌트
 *
 * react-leaflet의 <Marker>를 사용하지 않고 useEffect + L.marker()로 직접 관리한다.
 * 이렇게 하면 Leaflet의 줌/이동 시 React 렌더 사이클이 전혀 트리거되지 않아
 * 줌 INP가 대폭 개선된다.
 *
 * 핵심 원칙:
 * - 마커 생성/제거: useEffect (마운트/언마운트)
 * - 아이콘 업데이트: isHovered 변경 시에만 setIcon() 호출
 * - 이벤트 핸들러: ref를 통해 최신 클로저 참조 유지 (리스너 재등록 없음)
 */

import { useEffect, useRef, memo } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { SpotPin as SpotPinType, CATEGORY_CONFIG, SpotCategory } from '@/types'
import { useShallow } from 'zustand/react/shallow'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'
import { useBottomSheetStore } from '@/stores/bottomSheetStore'

interface SpotPinProps {
  spot: SpotPinType
  onSelect?: (spotId: string) => void
}

// ─── 터치 디바이스 감지 (모듈 레벨 싱글턴) ───────────────────────────────────
function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    window.matchMedia('(hover: none)').matches ||
    navigator.maxTouchPoints > 0
  )
}

let _isTouchDevice = detectTouchDevice()

if (typeof window !== 'undefined') {
  window.addEventListener(
    'resize',
    () => {
      _isTouchDevice = detectTouchDevice()
    },
    { passive: true }
  )
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── 외부 터치 감지 (모듈 레벨 이벤트 버스) ─────────────────────────────────
type OutsideTouchCallback = (isMarkerTouch: boolean) => void
const _outsideTouchCallbacks = new Set<OutsideTouchCallback>()

if (typeof window !== 'undefined') {
  document.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      if (_outsideTouchCallbacks.size === 0) return
      const target = e.target as HTMLElement
      const isMarkerTouch = !!target.closest('.custom-image-spot-pin')
      _outsideTouchCallbacks.forEach((cb) => cb(isMarkerTouch))
    },
    { passive: true }
  )
}
// ─────────────────────────────────────────────────────────────────────────────

// Z-Index 상수
const Z_INDEX = { base: 0, hovered: 10000 }

// 핀 크기 상수
const PIN_SIZES = { base: 48, hovered: 54 }

const MAP_THEME_COLORS = {
  defaultCategory: 'rgb(var(--category-other-bg))',
  hoveredAccent: 'rgb(var(--color-secondary-500))',
  popularStart: 'rgb(var(--color-secondary-500))',
  popularEnd: 'rgb(var(--color-danger))',
  markerPlaceholder: 'rgb(var(--color-accent-surface))',
} as const

// 카테고리별 색상
const getCategoryColor = (category?: SpotCategory): string => {
  if (!category) return MAP_THEME_COLORS.defaultCategory
  return CATEGORY_CONFIG[category]?.bgColor || MAP_THEME_COLORS.defaultCategory
}

// 카테고리별 아이콘
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

// 아이콘 HTML 생성
const createImagePinIcon = (
  thumbnailUrl: string,
  isHovered: boolean = false,
  category?: SpotCategory,
  checkInCount?: number
) => {
  const size = isHovered ? PIN_SIZES.hovered : PIN_SIZES.base
  const categoryColor = getCategoryColor(category)
  const categoryIconData = getCategoryIcon(category)
  const borderColor = isHovered ? MAP_THEME_COLORS.hoveredAccent : categoryColor
  const borderWidth = isHovered ? 4 : 3
  const shadowIntensity = isHovered ? 0.5 : 0.3
  const glowEffect = isHovered
    ? 'box-shadow: 0 0 12px 2px rgb(var(--color-secondary-500) / 0.4);'
    : ''

  const isPopular = checkInCount && checkInCount >= 10
  const popularBadge = isPopular
    ? `<div style="position:absolute;top:-4px;right:-4px;background:linear-gradient(135deg,${MAP_THEME_COLORS.popularStart},${MAP_THEME_COLORS.popularEnd});color:white;font-size:10px;font-weight:bold;padding:2px 4px;border-radius:8px;box-shadow:0 2px 4px rgb(var(--color-text) / 0.2);z-index:10;">🔥${checkInCount}</div>`
    : ''

  const hasImage = thumbnailUrl && thumbnailUrl.length > 0
  const imageContent = hasImage
    ? `<img src="${thumbnailUrl}" alt="spot" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/>
       <div class="fallback-icon" style="display:none;width:100%;height:100%;background:${categoryColor};border-radius:50%;align-items:center;justify-content:center;">
         <img src="${categoryIconData.path}" alt="category" style="width:24px;height:24px;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=font-size:24px>${categoryIconData.fallback}</span>';"/>
       </div>`
    : `<div style="width:100%;height:100%;background:${categoryColor};border-radius:50%;display:flex;align-items:center;justify-content:center;">
         <img src="${categoryIconData.path}" alt="category" style="width:24px;height:24px;" onerror="this.style.display='none';this.parentElement.innerHTML+='<span style=font-size:24px>${categoryIconData.fallback}</span>';"/>
       </div>`

  const hoverClass = isHovered ? 'is-hovered' : ''

  return L.divIcon({
    className: `custom-image-spot-pin ${hoverClass}`,
    html: `
      <div class="image-pin-container ${hoverClass}" style="width:${size}px;height:${size + 12}px;position:relative;cursor:pointer;filter:drop-shadow(0 4px 8px rgba(0,0,0,${shadowIntensity}));transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);">
        <div class="image-circle" style="width:${size}px;height:${size}px;border-radius:50%;border:${borderWidth}px solid ${borderColor};overflow:hidden;background:${MAP_THEME_COLORS.markerPlaceholder};box-shadow:0 2px 8px rgb(var(--color-text) / 0.2);transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);${glowEffect}">
          ${imageContent}
        </div>
        <div class="pin-tail" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid ${borderColor};transition:border-color 0.25s ease;"></div>
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

  // Store 액션들 — ref로 관리하여 이벤트 핸들러 재등록 없이 최신 값 참조
  const { setSelectedSpot } = useMapStore(
    useShallow((s) => ({ setSelectedSpot: s.setSelectedSpot }))
  )
  const { openPreview, closePreview } = useUIStore(
    useShallow((s) => ({
      openPreview: s.openPreview,
      closePreview: s.closePreview,
    }))
  )
  // previewSpotId, isPreviewHovered는 구독하지 않고 ref로만 읽음
  // → store 변경 시 SpotPin 리렌더 없음
  const { open: openBottomSheet } = useBottomSheetStore(
    useShallow((s) => ({ open: s.open }))
  )

  // 최신 액션을 ref로 유지 — 이벤트 핸들러 재등록 없이 클로저 문제 해결
  // previewSpotId, isPreviewHovered는 구독하지 않고 이벤트 핸들러에서 getState()로 직접 읽음
  const stateRef = useRef({
    isHovered: false,
    touchCount: 0,
    setSelectedSpot,
    openPreview,
    closePreview,
    openBottomSheet,
    onSelect,
  })

  // 액션 ref 동기화 (렌더마다 최신 값으로 갱신, 마커 재생성 없음)
  stateRef.current.setSelectedSpot = setSelectedSpot
  stateRef.current.openPreview = openPreview
  stateRef.current.closePreview = closePreview
  stateRef.current.openBottomSheet = openBottomSheet
  stateRef.current.onSelect = onSelect

  // 마커 인스턴스 ref
  const markerRef = useRef<L.Marker | null>(null)
  // 타이머 ref
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 외부 터치 콜백 ref
  const outsideTouchCbRef = useRef<OutsideTouchCallback | null>(null)

  useEffect(() => {
    // ── 아이콘 생성 ──
    const baseIcon = createImagePinIcon(
      spot.thumbnailUrl,
      false,
      spot.category,
      spot.checkInCount
    )

    // ── 마커 생성 ──
    const marker = L.marker(spot.coordinates, {
      icon: baseIcon,
      zIndexOffset: Z_INDEX.base,
    })

    // ── 이벤트 핸들러 (한 번만 등록, ref로 최신 상태 참조) ──

    const setHovered = (hovered: boolean) => {
      if (stateRef.current.isHovered === hovered) return
      stateRef.current.isHovered = hovered
      marker.setIcon(
        createImagePinIcon(
          spot.thumbnailUrl,
          hovered,
          spot.category,
          spot.checkInCount
        )
      )
      marker.setZIndexOffset(hovered ? Z_INDEX.hovered : Z_INDEX.base)
    }

    marker.on('click', () => {
      const s = stateRef.current
      if (_isTouchDevice) {
        if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
        if (s.touchCount === 0) {
          s.touchCount = 1
          setHovered(true)
          s.setSelectedSpot(spot.id)
          s.openBottomSheet(spot.id)
          touchTimerRef.current = setTimeout(() => {
            s.touchCount = 0
          }, 3000)
          return
        }
        s.touchCount = 0
        setHovered(false)
        return
      }
      s.setSelectedSpot(spot.id)
      s.onSelect?.(spot.id)
    })

    marker.on('mouseover', () => {
      if (_isTouchDevice) return
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = setTimeout(() => {
        setHovered(true)
        const point = map.latLngToContainerPoint(spot.coordinates)
        stateRef.current.openPreview(spot.id, { x: point.x, y: point.y })
      }, 100)
    })

    marker.on('mouseout', () => {
      if (_isTouchDevice) return
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = setTimeout(() => {
        setHovered(false)
        // store 구독 없이 직접 최신 상태 읽기 → SpotPin 리렌더 없음
        const uiState = useUIStore.getState()
        if (uiState.isPreviewHovered) return
        if (uiState.previewSpotId && uiState.previewSpotId !== spot.id) return
        stateRef.current.closePreview()
      }, 250)
    })

    // ── 외부 터치 감지 등록 ──
    const outsideTouchCb: OutsideTouchCallback = (isMarkerTouch) => {
      if (!isMarkerTouch && stateRef.current.touchCount > 0) {
        stateRef.current.touchCount = 0
        setHovered(false)
      }
    }
    outsideTouchCbRef.current = outsideTouchCb
    _outsideTouchCallbacks.add(outsideTouchCb)

    // ── 지도에 추가 ──
    marker.addTo(map)
    markerRef.current = marker

    return () => {
      // 정리
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current)
      if (outsideTouchCbRef.current)
        _outsideTouchCallbacks.delete(outsideTouchCbRef.current)
      marker.remove()
      markerRef.current = null
    }
    // spot.id가 바뀌면 마커를 재생성, 나머지는 ref로 처리
  }, [
    map,
    spot.id,
    spot.coordinates,
    spot.thumbnailUrl,
    spot.category,
    spot.checkInCount,
  ])

  // React 렌더에서는 아무것도 렌더링하지 않음 — 마커는 Leaflet이 직접 관리
  return null
})
