'use client'

import { useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Icon, LeafletMouseEvent } from 'leaflet'

interface LocationPickerMapContentProps {
  center: { lat: number; lng: number }
  selectedPos: { lat: number; lng: number } | null
  onMapClick: (pos: { lat: number; lng: number }) => void
}

// 커스텀 마커 아이콘
const pinIcon = new Icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

/** 지도 클릭 이벤트 핸들러 */
function ClickHandler({
  onClick,
}: {
  onClick: (pos: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function LocationPickerMapContent({
  center,
  selectedPos,
  onMapClick,
}: LocationPickerMapContentProps) {
  const handleClick = useCallback(
    (pos: { lat: number; lng: number }) => {
      onMapClick(pos)
    },
    [onMapClick]
  )

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={16}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={handleClick} />
      {selectedPos && (
        <Marker position={[selectedPos.lat, selectedPos.lng]} icon={pinIcon} />
      )}
    </MapContainer>
  )
}
