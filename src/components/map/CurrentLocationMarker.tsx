'use client'

import { useMemo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import { divIcon, type DivIcon } from 'leaflet'
import { MAP_MARKER_ASSETS } from '@/components/common/mascotAssets'

interface CurrentLocationMarkerProps {
  position: [number, number]
}

function createCurrentLocationIcon(): DivIcon {
  const color = 'rgb(var(--color-secondary-500))'

  return divIcon({
    className: 'current-location-marker',
    html: `<div style="position:relative;width:34px;height:46px;display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 6px 12px rgb(var(--color-text) / 0.22));">
      <div style="width:34px;height:34px;border-radius:9999px;background:${color};border:2px solid rgb(var(--color-surface));display:flex;align-items:center;justify-content:center;padding:6px;overflow:hidden;">
        <img src="${MAP_MARKER_ASSETS.current}" alt="" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=&quot;color:white;font-size:14px;font-weight:700;&quot;>ME</span>'" />
      </div>
      <div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid ${color};margin-top:-2px;"></div>
      <span style="position:absolute;inset:4px;border-radius:9999px;background:rgb(var(--color-secondary-500) / 0.25);animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></span>
    </div>`,
    iconSize: [34, 46],
    iconAnchor: [17, 46],
    popupAnchor: [0, -38],
  })
}

export default function CurrentLocationMarker({
  position,
}: CurrentLocationMarkerProps) {
  const icon = useMemo(() => createCurrentLocationIcon(), [])

  return (
    <Marker position={position} icon={icon}>
      <Popup>
        <div className="p-1 text-sm text-main-text">현재 위치</div>
      </Popup>
    </Marker>
  )
}
