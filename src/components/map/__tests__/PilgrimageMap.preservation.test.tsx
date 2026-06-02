/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-require-imports, react-hooks/exhaustive-deps */

import fc from 'fast-check'
import { render, cleanup, act } from '@testing-library/react'
import type { SpotPin as SpotPinType, SpotCategory } from '@/types'

let capturedMapContainerProps: Record<string, unknown> = {}
let capturedLocationButtonProps: Record<string, unknown> = {}

const mockMapInstance = {
  invalidateSize: jest.fn(),
  getCenter: jest.fn(() => ({ lat: 35.6762, lng: 139.6503 })),
  getZoom: jest.fn(() => 10),
  getPane: jest.fn(() => ({
    classList: { add: jest.fn(), remove: jest.fn() },
  })),
  on: jest.fn(),
  off: jest.fn(),
  flyTo: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
}

jest.mock('@/stores/mapStore', () => ({
  useMapStore: () => ({
    center: [35.6762, 139.6503] as [number, number],
    zoom: 10,
    selectedSpotId: null,
    setCenter: jest.fn(),
    setZoom: jest.fn(),
    setSelectedSpot: jest.fn(),
  }),
}))

jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    openPreview: jest.fn(),
    closePreview: jest.fn(),
    setPreviewHovered: jest.fn(),
  }),
}))

jest.mock('@/stores/bottomSheetStore', () => ({
  useBottomSheetStore: () => ({
    isOpen: false,
    spotId: null,
    open: jest.fn(),
    close: jest.fn(),
  }),
}))

jest.mock(
  '../SpotPreview',
  () =>
    function MockSpotPreview() {
      return <div data-testid="spot-preview" />
    }
)

jest.mock(
  '@/components/mobile/BottomSheet',
  () =>
    function MockBottomSheet() {
      return <div data-testid="bottom-sheet" />
    }
)

jest.mock('@/components/mobile/LocationButton', () => {
  return function MockLocationButton(props: Record<string, unknown>) {
    capturedLocationButtonProps = props
    return <button data-testid="location-button" />
  }
})

jest.mock(
  '@/components/mobile/GpsErrorFallback',
  () =>
    function MockGpsErrorFallback() {
      return <div data-testid="gps-error" />
    }
)

jest.mock('../SpotMarkerLayer', () => {
  return function MockSpotMarkerLayer({ spots }: { spots: SpotPinType[] }) {
    return (
      <>
        {spots.map((spot) => (
          <div
            key={spot.id}
            data-testid="marker"
            data-position={JSON.stringify(spot.coordinates)}
          />
        ))}
      </>
    )
  }
})

jest.mock('../map.css', () => ({}))
jest.mock('leaflet/dist/leaflet.css', () => ({}))
jest.mock('leaflet.markercluster', () => ({}))
jest.mock('leaflet.markercluster/dist/MarkerCluster.css', () => ({}))
jest.mock('leaflet.markercluster/dist/MarkerCluster.Default.css', () => ({}))

jest.mock('leaflet', () => ({
  __esModule: true,
  default: { Icon: { Default: { imagePath: '' } }, divIcon: jest.fn() },
  Icon: { Default: { imagePath: '' } },
  divIcon: jest.fn(),
}))

jest.mock('react-leaflet', () => {
  const React = require('react')
  const MapContainer = React.forwardRef(function MockMapContainer(
    {
      children,
      whenReady,
      center,
      zoom,
      className,
      zoomControl,
      scrollWheelZoom,
      doubleClickZoom,
      dragging,
      touchZoom,
      boxZoom,
      keyboard,
      bounceAtZoomLimits,
      minZoom,
      maxBounds,
      maxBoundsViscosity,
    }: {
      children: React.ReactNode
      whenReady?: () => void
      [key: string]: unknown
    },
    ref: React.Ref<unknown>
  ) {
    capturedMapContainerProps = {
      center,
      zoom,
      className,
      zoomControl,
      scrollWheelZoom,
      doubleClickZoom,
      dragging,
      touchZoom,
      boxZoom,
      keyboard,
      bounceAtZoomLimits,
      minZoom,
      maxBounds,
      maxBoundsViscosity,
    }

    React.useEffect(() => {
      if (typeof ref === 'function') ref(mockMapInstance)
      else if (ref && typeof ref === 'object') {
        ;(ref as React.MutableRefObject<unknown>).current = mockMapInstance
      }
      whenReady?.()
    }, [])

    return (
      <div data-testid="map-container" className={className as string}>
        {children}
      </div>
    )
  })

  return {
    MapContainer,
    TileLayer: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="tile-layer">{children}</div>
    ),
    Marker: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="current-location-marker">{children}</div>
    ),
    Popup: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="current-location-popup">{children}</div>
    ),
    useMap: () => ({
      latLngToContainerPoint: jest.fn(() => ({ x: 100, y: 100 })),
    }),
  }
})

const categories: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

function generateSpots(count: number): fc.Arbitrary<SpotPinType[]> {
  return fc
    .array(
      fc.record({
        name: fc
          .string({ minLength: 1, maxLength: 30 })
          .filter((s) => s.trim().length > 0),
        coordinates: fc.tuple(
          fc.double({ min: -90, max: 90, noNaN: true }),
          fc.double({ min: -180, max: 180, noNaN: true })
        ) as fc.Arbitrary<[number, number]>,
        thumbnailUrl: fc.constant('https://example.com/thumb.jpg'),
        category: fc.constantFrom(...categories),
      }),
      { minLength: count, maxLength: count }
    )
    .map((items) => items.map((item, idx) => ({ ...item, id: `spot-${idx}` })))
}

const spotsArbitrary = fc
  .integer({ min: 0, max: 100 })
  .chain((count) => generateSpots(count))
const PilgrimageMap = require('../PilgrimageMap').default

beforeEach(() => {
  capturedMapContainerProps = {}
  capturedLocationButtonProps = {}
  mockMapInstance.flyTo.mockClear()
})

afterEach(() => cleanup())

describe('PilgrimageMap preservation', () => {
  test('renders one marker for each spot', () => {
    fc.assert(
      fc.property(spotsArbitrary, (spots) => {
        cleanup()
        const { queryAllByTestId } = render(
          <PilgrimageMap
            initialCenter={[35.6762, 139.6503]}
            initialZoom={6}
            spots={spots}
          />
        )
        expect(queryAllByTestId('marker').length).toBe(spots.length)
      }),
      { numRuns: 30 }
    )
  })

  test('MapContainer interaction props stay enabled', () => {
    render(
      <PilgrimageMap
        initialCenter={[35.6762, 139.6503]}
        initialZoom={6}
        spots={[]}
      />
    )

    expect(capturedMapContainerProps.scrollWheelZoom).toBe(true)
    expect(capturedMapContainerProps.doubleClickZoom).toBe(true)
    expect(capturedMapContainerProps.dragging).toBe(true)
    expect(capturedMapContainerProps.touchZoom).toBe(true)
    expect(capturedMapContainerProps.boxZoom).toBe(true)
    expect(capturedMapContainerProps.keyboard).toBe(true)
    expect(capturedMapContainerProps.zoomControl).toBe(false)
    expect(capturedMapContainerProps.bounceAtZoomLimits).toBe(false)
    expect(capturedMapContainerProps.minZoom).toBe(2)
  })

  test('LocationButton is rendered and moves the map when callback fires', () => {
    fc.assert(
      fc.property(
        fc.record({
          lat: fc.double({ min: -90, max: 90, noNaN: true }),
          lng: fc.double({ min: -180, max: 180, noNaN: true }),
        }),
        ({ lat, lng }) => {
          cleanup()
          mockMapInstance.flyTo.mockClear()
          capturedLocationButtonProps = {}

          const { getByTestId } = render(
            <PilgrimageMap
              initialCenter={[35.6762, 139.6503]}
              initialZoom={6}
              spots={[]}
            />
          )

          expect(getByTestId('location-button')).toBeTruthy()
          const onLocationFound =
            capturedLocationButtonProps.onLocationFound as
              | ((lat: number, lng: number) => void)
              | undefined
          expect(onLocationFound).toBeDefined()
          act(() => {
            onLocationFound?.(lat, lng)
          })
          expect(mockMapInstance.flyTo).toHaveBeenCalledWith([lat, lng], 15, {
            duration: 1,
          })
        }
      ),
      { numRuns: 20 }
    )
  })

  test('custom zoom controls, SpotPreview, and BottomSheet are always present', () => {
    const { getByLabelText, getByTestId } = render(
      <PilgrimageMap
        initialCenter={[35.6762, 139.6503]}
        initialZoom={6}
        spots={[]}
      />
    )

    expect(getByLabelText('Zoom in')).toBeTruthy()
    expect(getByLabelText('Zoom out')).toBeTruthy()
    expect(getByTestId('spot-preview')).toBeTruthy()
    expect(getByTestId('bottom-sheet')).toBeTruthy()
  })
})
