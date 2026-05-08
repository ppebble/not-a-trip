'use client'

/**
 * SpotMarkerLayer - 줌 레벨 기반 2단계 핀 + MarkerClusterGroup
 *
 * 줌 레벨에 따라 핀 형태를 자동 전환:
 * - ≤ 12 (광역): 카테고리 이모지 도트 (22px) — DOM 비용 최소
 * - 13~15 (중간): 카테고리 컬러 핀 + 스팟 이름 라벨 (32px)
 * - ≥ 16 (근접): 이미지 원형 핀 (48px) — 클러스터 해제
 *
 * 줌 변경 시 모든 마커의 아이콘을 일괄 교체한다.
 * 클러스터링은 줌 ≤ 15에서만 활성화된다.
 */

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { SpotPin as SpotPinType, CATEGORY_CONFIG, SpotCategory } from '@/types'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'
import { useBottomSheetStore } from '@/stores/bottomSheetStore'

interface SpotMarkerLayerProps {
  spots: SpotPinType[]
  onSpotSelect?: (spotId: string) => void
}

// ─── 터치 디바이스 감지 ──────────────────────────────────────────────────────
function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || window.matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 0
}
let _isTouchDevice = detectTouchDevice()
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => { _isTouchDevice = detectTouchDevice() }, { passive: true })
}

// ─── 카테고리 유틸 ───────────────────────────────────────────────────────────
const CATEGORY_EMOJI: Record<SpotCategory, string> = {
  animation: '🎬', sports: '⚽', movie_drama: '🎥',
  music: '🎵', game: '🎮', other: '📍',
}

const getCategoryColor = (category?: SpotCategory): string => {
  if (!category) return '#4164a5'
  return CATEGORY_CONFIG[category]?.bgColor || '#4164a5'
}

const getCategoryEmoji = (category?: SpotCategory): string => {
  if (!category) return '📍'
  return CATEGORY_EMOJI[category] || '📍'
}

const getCategoryIconPath = (category?: SpotCategory): string => {
  if (!category) return '/icons/categories/other.webp'
  return CATEGORY_CONFIG[category]?.icon || '/icons/categories/other.webp'
}

// ─── 줌 레벨별 아이콘 생성 ───────────────────────────────────────────────────

type ZoomTier = 'dot' | 'label' | 'image'

function getZoomTier(zoom: number): ZoomTier {
  if (zoom <= 12) return 'dot'
  if (zoom <= 15) return 'label'
  return 'image'
}

/** 광역 (≤12): 카테고리 이모지 도트 — 22px, 이미지 없음, shadow 없음 */
function createDotIcon(category?: SpotCategory): L.DivIcon {
  const color = getCategoryColor(category)
  const emoji = getCategoryEmoji(category)
  return L.divIcon({
    className: 'spot-dot-pin',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;">${emoji}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

/** 중간 (13~15): 카테고리 컬러 핀 + 스팟 이름 — 이미지 없음 */
function createLabelIcon(name: string, category?: SpotCategory): L.DivIcon {
  const color = getCategoryColor(category)
  const emoji = getCategoryEmoji(category)
  // 이름은 최대 8자로 truncate
  const displayName = name.length > 8 ? name.slice(0, 8) + '…' : name
  return L.divIcon({
    className: 'spot-label-pin',
    html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="width:32px;height:32px;border-radius:50%;background:${color};border:2.5px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 1px 3px rgba(0,0,0,0.2);">${emoji}</div>
      <div style="margin-top:2px;padding:1px 4px;border-radius:4px;background:rgba(255,255,255,0.92);font-size:10px;font-weight:600;color:#1f2937;white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 2px rgba(0,0,0,0.1);">${displayName}</div>
    </div>`,
    iconSize: [80, 50],
    iconAnchor: [40, 20],
  })
}

/** 근접 (≥16): 이미지 원형 핀 — 48px */
function createImageIcon(thumbnailUrl: string, category?: SpotCategory): L.DivIcon {
  const color = getCategoryColor(category)
  const catIconPath = getCategoryIconPath(category)
  const emoji = getCategoryEmoji(category)
  const hasImage = thumbnailUrl && thumbnailUrl.length > 0

  const imageHtml = hasImage
    ? `<img src="${thumbnailUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/><div style="display:none;width:100%;height:100%;background:${color};border-radius:50%;align-items:center;justify-content:center;"><img src="${catIconPath}" style="width:20px;height:20px;" onerror="this.outerHTML='<span style=font-size:20px>${emoji}</span>';"/></div>`
    : `<div style="width:100%;height:100%;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;"><img src="${catIconPath}" style="width:20px;height:20px;" onerror="this.outerHTML='<span style=font-size:20px>${emoji}</span>';"/></div>`

  return L.divIcon({
    className: 'spot-image-pin',
    html: `<div style="width:48px;height:58px;position:relative;cursor:pointer;">
      <div style="width:48px;height:48px;border-radius:50%;border:3px solid ${color};overflow:hidden;background:#e5e7eb;">${imageHtml}</div>
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid ${color};"></div>
    </div>`,
    iconSize: [48, 58],
    iconAnchor: [24, 58],
  })
}

/** 호버 아이콘 (줌 레벨 무관, 항상 이미지 핀 확대) */
function createHoveredIcon(thumbnailUrl: string, category?: SpotCategory): L.DivIcon {
  const color = getCategoryColor(category)
  const catIconPath = getCategoryIconPath(category)
  const emoji = getCategoryEmoji(category)
  const hasImage = thumbnailUrl && thumbnailUrl.length > 0

  const imageHtml = hasImage
    ? `<img src="${thumbnailUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/><div style="display:none;width:100%;height:100%;background:${color};border-radius:50%;align-items:center;justify-content:center;"><img src="${catIconPath}" style="width:22px;height:22px;" onerror="this.outerHTML='<span style=font-size:22px>${emoji}</span>';"/></div>`
    : `<div style="width:100%;height:100%;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;"><img src="${catIconPath}" style="width:22px;height:22px;" onerror="this.outerHTML='<span style=font-size:22px>${emoji}</span>';"/></div>`

  return L.divIcon({
    className: 'spot-image-pin is-hovered',
    html: `<div style="width:56px;height:66px;position:relative;cursor:pointer;">
      <div style="width:56px;height:56px;border-radius:50%;border:4px solid #fbbf24;overflow:hidden;background:#e5e7eb;box-shadow:0 0 10px 2px rgba(251,191,36,0.4);">${imageHtml}</div>
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid #fbbf24;"></div>
    </div>`,
    iconSize: [56, 66],
    iconAnchor: [28, 66],
  })
}

/** 줌 레벨에 맞는 아이콘 반환 */
function getIconForZoom(spot: SpotPinType, tier: ZoomTier): L.DivIcon {
  switch (tier) {
    case 'dot': return createDotIcon(spot.category)
    case 'label': return createLabelIcon(spot.name, spot.category)
    case 'image': return createImageIcon(spot.thumbnailUrl, spot.category)
  }
}

// ─── 클러스터 아이콘 ─────────────────────────────────────────────────────────
function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount()
  let size = 36, bgColor = '#4164a5', fontSize = '12px'
  if (count >= 50) { size = 48; bgColor = '#dc2626'; fontSize = '14px' }
  else if (count >= 20) { size = 44; bgColor = '#ea580c'; fontSize = '13px' }
  else if (count >= 10) { size = 40; bgColor = '#ca8a04'; fontSize = '13px' }

  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bgColor};color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${fontSize};border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.25);">${count}</div>`,
    className: 'marker-cluster-custom',
    iconSize: L.point(size, size),
  })
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export default function SpotMarkerLayer({ spots, onSpotSelect }: SpotMarkerLayerProps) {
  const map = useMap()
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const spotsRef = useRef<SpotPinType[]>(spots)
  const currentTierRef = useRef<ZoomTier>(getZoomTier(map.getZoom()))
  const hoveredRef = useRef<{ id: string } | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStateRef = useRef<{ id: string; count: number; timer: ReturnType<typeof setTimeout> | null }>({ id: '', count: 0, timer: null })
  const onSpotSelectRef = useRef(onSpotSelect)
  onSpotSelectRef.current = onSpotSelect
  spotsRef.current = spots

  // 클러스터 그룹 생성 (한 번만)
  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
      animateAddingMarkers: false,
      disableClusteringAtZoom: 16,
      iconCreateFunction: createClusterIcon,
    })
    clusterGroupRef.current = clusterGroup
    map.addLayer(clusterGroup)

    // 줌 변경 시 아이콘 일괄 교체
    const onZoomEnd = () => {
      const newTier = getZoomTier(map.getZoom())
      if (newTier === currentTierRef.current) return
      currentTierRef.current = newTier

      // 호버 해제
      hoveredRef.current = null

      // 모든 마커 아이콘 교체
      markersRef.current.forEach((marker, id) => {
        const spot = spotsRef.current.find((s) => s.id === id)
        if (spot) marker.setIcon(getIconForZoom(spot, newTier))
      })
    }
    map.on('zoomend', onZoomEnd)

    return () => {
      map.off('zoomend', onZoomEnd)
      map.removeLayer(clusterGroup)
      clusterGroupRef.current = null
      markersRef.current.clear()
    }
  }, [map])

  // spots 변경 시 마커 동기화
  useEffect(() => {
    const clusterGroup = clusterGroupRef.current
    if (!clusterGroup) return

    const currentMarkers = markersRef.current
    const newSpotIds = new Set(spots.map((s) => s.id))
    const tier = currentTierRef.current

    // 제거
    const toRemove: L.Marker[] = []
    currentMarkers.forEach((marker, id) => {
      if (!newSpotIds.has(id)) {
        toRemove.push(marker)
        currentMarkers.delete(id)
      }
    })
    if (toRemove.length > 0) clusterGroup.removeLayers(toRemove)

    // 추가
    const toAdd: L.Marker[] = []
    for (const spot of spots) {
      if (currentMarkers.has(spot.id)) continue

      const icon = getIconForZoom(spot, tier)
      const marker = L.marker(spot.coordinates, { icon })

      // 클릭
      marker.on('click', () => {
        if (_isTouchDevice) {
          const ts = touchStateRef.current
          if (ts.timer) clearTimeout(ts.timer)
          if (ts.id !== spot.id || ts.count === 0) {
            ts.id = spot.id
            ts.count = 1
            useMapStore.getState().setSelectedSpot(spot.id)
            useBottomSheetStore.getState().open(spot.id)
            ts.timer = setTimeout(() => { ts.count = 0 }, 3000)
            return
          }
          ts.count = 0
          return
        }
        useMapStore.getState().setSelectedSpot(spot.id)
        onSpotSelectRef.current?.(spot.id)
      })

      // 호버
      marker.on('mouseover', () => {
        if (_isTouchDevice) return
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = setTimeout(() => {
          // 이전 호버 해제
          if (hoveredRef.current && hoveredRef.current.id !== spot.id) {
            const prev = currentMarkers.get(hoveredRef.current.id)
            const prevSpot = spotsRef.current.find((s) => s.id === hoveredRef.current!.id)
            if (prev && prevSpot) {
              prev.setIcon(getIconForZoom(prevSpot, currentTierRef.current))
              prev.setZIndexOffset(0)
            }
          }
          marker.setIcon(createHoveredIcon(spot.thumbnailUrl, spot.category))
          marker.setZIndexOffset(10000)
          hoveredRef.current = { id: spot.id }
          const point = map.latLngToContainerPoint(spot.coordinates)
          useUIStore.getState().openPreview(spot.id, { x: point.x, y: point.y })
        }, 100)
      })

      marker.on('mouseout', () => {
        if (_isTouchDevice) return
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = setTimeout(() => {
          marker.setIcon(getIconForZoom(spot, currentTierRef.current))
          marker.setZIndexOffset(0)
          hoveredRef.current = null
          const uiState = useUIStore.getState()
          if (uiState.isPreviewHovered) return
          if (uiState.previewSpotId && uiState.previewSpotId !== spot.id) return
          useUIStore.getState().closePreview()
        }, 250)
      })

      currentMarkers.set(spot.id, marker)
      toAdd.push(marker)
    }

    if (toAdd.length > 0) clusterGroup.addLayers(toAdd)
  }, [spots, map])

  return null
}
