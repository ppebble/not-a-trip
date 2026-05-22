'use client'

/**
 * SpotMarkerLayer - 以??덈꺼 湲곕컲 2?④퀎 ? + MarkerClusterGroup
 *
 * 以??덈꺼???곕씪 ? ?뺥깭瑜??먮룞 ?꾪솚:
 * - ??12 (愿묒뿭): 移댄뀒怨좊━ ?대え吏 ?꾪듃 (22px) ??DOM 鍮꾩슜 理쒖냼
 * - 13~15 (以묎컙): 移댄뀒怨좊━ 而щ윭 ? + ?ㅽ뙚 ?대쫫 ?쇰꺼 (32px)
 * - ??16 (洹쇱젒): ?대?吏 ?먰삎 ? (48px) ???대윭?ㅽ꽣 ?댁젣
 *
 * 以?蹂寃???紐⑤뱺 留덉빱???꾩씠肄섏쓣 ?쇨큵 援먯껜?쒕떎.
 * ?대윭?ㅽ꽣留곸? 以???15?먯꽌留??쒖꽦?붾맂??
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

// ??? ?곗튂 ?붾컮?댁뒪 媛먯? ??????????????????????????????????????????????????????
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

// ??? 移댄뀒怨좊━ ?좏떥 ???????????????????????????????????????????????????????????
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

// ??? 以??덈꺼蹂??꾩씠肄??앹꽦 ???????????????????????????????????????????????????

type ZoomTier = 'dot' | 'label' | 'image'

function getZoomTier(zoom: number): ZoomTier {
  if (zoom <= 12) return 'dot'
  if (zoom <= 15) return 'label'
  return 'image'
}

/** 愿묒뿭 (??2): 移댄뀒怨좊━ ?대え吏 ?꾪듃 ??22px, ?대?吏 ?놁쓬, shadow ?놁쓬 */
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

/** 以묎컙 (13~15): 移댄뀒怨좊━ 而щ윭 ? + ?ㅽ뙚 ?대쫫 ???대?吏 ?놁쓬 */
function createLabelIcon(name: string, category?: SpotCategory): L.DivIcon {
  const color = getCategoryColor(category)
  const emoji = getCategoryEmoji(category)
  // ?대쫫? 理쒕? 8?먮줈 truncate
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

/** 洹쇱젒 (??6): ?대?吏 ?먰삎 ? ??48px */
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

/** ?몃쾭 ?꾩씠肄?(以??덈꺼 臾닿?, ??긽 ?대?吏 ? ?뺣?) */
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

/** 以??덈꺼??留욌뒗 ?꾩씠肄?諛섑솚 */
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

// ??? ?대윭?ㅽ꽣 ?꾩씠肄??????????????????????????????????????????????????????????
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

// ??? 硫붿씤 而댄룷?뚰듃 ???????????????????????????????????????????????????????????
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

  // ?대윭?ㅽ꽣 洹몃９ ?앹꽦 (??踰덈쭔)
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

    // 以?蹂寃????꾩씠肄??쇨큵 援먯껜
    const onZoomEnd = () => {
      const newTier = getZoomTier(map.getZoom())
      if (newTier === currentTierRef.current) return
      currentTierRef.current = newTier

      // ?몃쾭 ?댁젣
      hoveredRef.current = null

      // 紐⑤뱺 留덉빱 ?꾩씠肄?援먯껜
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

    // ?쒓굅
    const toRemove: L.Marker[] = []
    currentMarkers.forEach((marker, id) => {
      if (!newSpotIds.has(id)) {
        toRemove.push(marker)
        currentMarkers.delete(id)
      }
    })
    if (toRemove.length > 0) clusterGroup.removeLayers(toRemove)

    // 異붽?
    const toAdd: L.Marker[] = []
    for (const spot of spots) {
      if (currentMarkers.has(spot.id)) continue

      const icon = getIconForZoom(spot, tier)
      const marker = L.marker(spot.coordinates, { icon })

      // ?대┃
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
        useMapStore.getState().setSelectedSpot(spot.id)
        onSpotSelectRef.current?.(spot.id)
      })

      // ?몃쾭
      marker.on('mouseover', () => {
        if (_isTouchDevice) return
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = setTimeout(() => {
          // ?댁쟾 ?몃쾭 ?댁젣
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
