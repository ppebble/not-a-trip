'use client'

/**
 * SpotMarkerLayer - 줌 레벨 기반 3단계 마커 + MarkerClusterGroup
 *
 * 줌 레벨에 따라 마커 형태를 자동 전환한다:
 * - 12 이하(광역): 카테고리 약어 점 마커(22px)로 DOM 비용 최소화
 * - 13~15(중간): 카테고리 컬러 점 + 스팟 이름 라벨(32px)
 * - 16 이상(근접): 스팟 이미지 원형 핀(48px), 클러스터 해제
 *
 * 줌 변경 시 모든 마커 아이콘을 일괄 교체한다.
 * 클러스터링은 줌 15까지만 활성화된다.
 */

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { SpotPin as SpotPinType, CATEGORY_CONFIG, SpotCategory } from '@/types'
import { MAP_MARKER_ASSETS } from '@/components/common/mascotAssets'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'
import { useBottomSheetStore } from '@/stores/bottomSheetStore'

interface SpotMarkerLayerProps {
  spots: SpotPinType[]
  onSpotSelect?: (spotId: string) => void
}

// 터치 디바이스 감지
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

// 카테고리 약어
const CATEGORY_EMOJI: Record<SpotCategory, string> = {
  animation: 'A',
  sports: 'S',
  movie_drama: 'M',
  music: 'U',
  game: 'G',
  other: 'O',
}

const MAP_THEME_COLORS = {
  defaultCategory: 'rgb(var(--category-other-bg))',
  markerSurface: 'rgb(var(--color-surface))',
  markerText: 'rgb(var(--color-text))',
  markerPlaceholder: 'rgb(var(--color-accent-surface))',
  hoveredAccent: 'rgb(var(--color-secondary-500))',
  markerBorder: 'rgb(var(--color-surface))',
  clusterText: 'rgb(var(--color-background))',
  clusterBase: 'rgb(var(--color-primary-600))',
  clusterWarn: 'rgb(var(--color-primary-700))',
  clusterHot: 'rgb(var(--color-secondary-500))',
  clusterCritical: 'rgb(var(--color-danger))',
}

const getCategoryColor = (category?: SpotCategory): string => {
  if (!category) return MAP_THEME_COLORS.defaultCategory
  return CATEGORY_CONFIG[category]?.bgColor || MAP_THEME_COLORS.defaultCategory
}

const getCategoryEmoji = (category?: SpotCategory): string => {
  if (!category) return 'O'
  return CATEGORY_EMOJI[category] || 'O'
}

const getCategoryIconPath = (category?: SpotCategory): string => {
  if (!category) return '/icons/categories/other.webp'
  return CATEGORY_CONFIG[category]?.icon || '/icons/categories/other.webp'
}

// 줌 레벨별 아이콘 생성

type ZoomTier = 'dot' | 'label' | 'image'

function getZoomTier(zoom: number): ZoomTier {
  if (zoom <= 12) return 'dot'
  if (zoom <= 15) return 'label'
  return 'image'
}

/** 광역(12 이하): 카테고리 약어 점 마커, 이미지 없음, shadow 없음 */
function createDotIcon(category?: SpotCategory): L.DivIcon {
  const color = getCategoryColor(category)
  const emoji = getCategoryEmoji(category)
  return L.divIcon({
    className: 'spot-dot-pin',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid ${MAP_THEME_COLORS.markerBorder};display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;">${emoji}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

/** 중간(13~15): 카테고리 컬러 점 + 스팟 이름 라벨, 이미지 없음 */
function createLabelIcon(name: string, category?: SpotCategory): L.DivIcon {
  const color = getCategoryColor(category)
  const emoji = getCategoryEmoji(category)
  // 이름은 최대 8자로 truncate
  const displayName = name.length > 8 ? `${name.slice(0, 8)}...` : name
  return L.divIcon({
    className: 'spot-label-pin',
    html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="width:32px;height:32px;border-radius:50%;background:${color};border:2.5px solid ${MAP_THEME_COLORS.markerBorder};display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 1px 3px rgb(var(--color-text) / 0.2);">${emoji}</div>
      <div style="margin-top:2px;padding:1px 4px;border-radius:4px;background:rgb(var(--color-surface) / 0.92);font-size:10px;font-weight:600;color:${MAP_THEME_COLORS.markerText};white-space:nowrap;max-width:80px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 2px rgb(var(--color-text) / 0.1);">${displayName}</div>
    </div>`,
    iconSize: [80, 50],
    iconAnchor: [40, 20],
  })
}

/** 근접(16 이상): 이미지 원형 핀 48px */
function createImageIcon(
  thumbnailUrl: string,
  category?: SpotCategory
): L.DivIcon {
  const color = getCategoryColor(category)
  const _catIconPath = getCategoryIconPath(category)
  const emoji = getCategoryEmoji(category)
  const hasImage = thumbnailUrl && thumbnailUrl.length > 0

  const imageHtml = hasImage
    ? `<img src="${thumbnailUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/><div style="display:none;width:100%;height:100%;background:${color};border-radius:50%;align-items:center;justify-content:center;padding:7px;"><img src="${MAP_MARKER_ASSETS.spot}" style="width:100%;height:100%;object-fit:contain;" onerror="this.outerHTML='<span style=font-size:20px>${emoji}</span>';"/></div>`
    : `<div style="width:100%;height:100%;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;padding:7px;"><img src="${MAP_MARKER_ASSETS.spot}" style="width:100%;height:100%;object-fit:contain;" onerror="this.outerHTML='<span style=font-size:20px>${emoji}</span>';"/></div>`

  return L.divIcon({
    className: 'spot-image-pin',
    html: `<div style="width:48px;height:58px;position:relative;cursor:pointer;">
      <div style="width:48px;height:48px;border-radius:50%;border:3px solid ${color};overflow:hidden;background:${MAP_THEME_COLORS.markerPlaceholder};">${imageHtml}</div>
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid ${color};"></div>
    </div>`,
    iconSize: [48, 58],
    iconAnchor: [24, 58],
  })
}

/** 호버 아이콘: 줌 레벨과 무관하게 항상 이미지 핀 형태 */
function createHoveredIcon(
  thumbnailUrl: string,
  category?: SpotCategory
): L.DivIcon {
  const color = getCategoryColor(category)
  const _catIconPath = getCategoryIconPath(category)
  const emoji = getCategoryEmoji(category)
  const hasImage = thumbnailUrl && thumbnailUrl.length > 0

  const imageHtml = hasImage
    ? `<img src="${thumbnailUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/><div style="display:none;width:100%;height:100%;background:${color};border-radius:50%;align-items:center;justify-content:center;padding:7px;"><img src="${MAP_MARKER_ASSETS.spot}" style="width:100%;height:100%;object-fit:contain;" onerror="this.outerHTML='<span style=font-size:22px>${emoji}</span>';"/></div>`
    : `<div style="width:100%;height:100%;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;padding:7px;"><img src="${MAP_MARKER_ASSETS.spot}" style="width:100%;height:100%;object-fit:contain;" onerror="this.outerHTML='<span style=font-size:22px>${emoji}</span>';"/></div>`

  return L.divIcon({
    className: 'spot-image-pin is-hovered',
    html: `<div style="width:56px;height:66px;position:relative;cursor:pointer;">
      <div style="width:56px;height:56px;border-radius:50%;border:4px solid ${MAP_THEME_COLORS.hoveredAccent};overflow:hidden;background:${MAP_THEME_COLORS.markerPlaceholder};box-shadow:0 0 10px 2px rgb(var(--color-secondary-500) / 0.4);">${imageHtml}</div>
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid ${MAP_THEME_COLORS.hoveredAccent};"></div>
    </div>`,
    iconSize: [56, 66],
    iconAnchor: [28, 66],
  })
}

/** 줌 레벨에 맞는 아이콘 반환 */
function getIconForZoom(spot: SpotPinType, tier: ZoomTier): L.DivIcon {
  switch (tier) {
    case 'dot':
      return createDotIcon(spot.category)
    case 'label':
      return createLabelIcon(spot.name, spot.category)
    case 'image':
      return createImageIcon(spot.thumbnailUrl, spot.category)
  }
}

function closeSpotInteractionOverlays() {
  useUIStore.getState().closePreview()
  useBottomSheetStore.getState().close()
  useMapStore.getState().setSelectedSpot(null)
}

// 클러스터 아이콘
function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount()
  let size = 36
  let bgColor = MAP_THEME_COLORS.clusterBase
  let fontSize = '12px'
  if (count >= 50) {
    size = 48
    bgColor = MAP_THEME_COLORS.clusterCritical
    fontSize = '14px'
  } else if (count >= 20) {
    size = 44
    bgColor = MAP_THEME_COLORS.clusterHot
    fontSize = '13px'
  } else if (count >= 10) {
    size = 40
    bgColor = MAP_THEME_COLORS.clusterWarn
    fontSize = '13px'
  }

  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bgColor};color:${MAP_THEME_COLORS.clusterText};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${fontSize};border:3px solid ${MAP_THEME_COLORS.markerBorder};box-shadow:0 2px 4px rgb(var(--color-text) / 0.25);">${count}</div>`,
    className: 'marker-cluster-custom',
    iconSize: L.point(size, size),
  })
}

// 메인 컴포넌트
export default function SpotMarkerLayer({
  spots,
  onSpotSelect,
}: SpotMarkerLayerProps) {
  const map = useMap()
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const spotsRef = useRef<SpotPinType[]>(spots)
  const currentTierRef = useRef<ZoomTier>(getZoomTier(map.getZoom()))
  const hoveredRef = useRef<{ id: string } | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStateRef = useRef<{
    id: string
    count: number
    timer: ReturnType<typeof setTimeout> | null
  }>({ id: '', count: 0, timer: null })
  const onSpotSelectRef = useRef(onSpotSelect)
  onSpotSelectRef.current = onSpotSelect
  spotsRef.current = spots

  // 클러스터 그룹 생성(1회)
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
    const currentMarkers = markersRef.current
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
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
      const touchTimer = touchStateRef.current.timer
      if (touchTimer) clearTimeout(touchTimer)
      map.off('zoomend', onZoomEnd)
      map.removeLayer(clusterGroup)
      clusterGroupRef.current = null
      hoveredRef.current = null
      touchStateRef.current = { id: '', count: 0, timer: null }
      currentMarkers.clear()
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
            ts.timer = setTimeout(() => {
              ts.count = 0
            }, 3000)
            return
          }
          ts.count = 0
          return
        }
        closeSpotInteractionOverlays()
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
            const prevSpot = spotsRef.current.find(
              (s) => s.id === hoveredRef.current!.id
            )
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
