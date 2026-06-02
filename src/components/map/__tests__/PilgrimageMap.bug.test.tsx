/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-require-imports, react-hooks/exhaustive-deps */

import fc from 'fast-check'
import { render, cleanup, act } from '@testing-library/react'
import type { SpotPin as SpotPinType, SpotCategory } from '@/types'

let mapContainerMountCount = 0
let mapContainerUnmountCount = 0

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

jest.mock(
  '@/components/mobile/LocationButton',
  () =>
    function MockLocationButton() {
      return <div data-testid="location-button" />
    }
)

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
    }: {
      children: React.ReactNode
      whenReady?: () => void
      [key: string]: unknown
    },
    ref: React.Ref<unknown>
  ) {
    const mapInstance = React.useMemo(
      () => ({
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
      }),
      []
    )

    React.useEffect(() => {
      mapContainerMountCount++
      if (typeof ref === 'function') ref(mapInstance)
      else if (ref && typeof ref === 'object') {
        ;(ref as React.MutableRefObject<unknown>).current = mapInstance
      }
      whenReady?.()
      return () => {
        mapContainerUnmountCount++
      }
    }, [])

    return <div data-testid="map-container">{children}</div>
  })

  return {
    MapContainer,
    TileLayer: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="tile-layer">{children}</div>
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

function generateSpotArray(
  count: number,
  prefix: string
): fc.Arbitrary<SpotPinType[]> {
  return fc
    .array(
      fc.record({
        name: fc
          .string({ minLength: 1, maxLength: 50 })
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
    .map((items) =>
      items.map((item, idx) => ({ ...item, id: `${prefix}-${idx}` }))
    )
}

const allSpotsArbitrary = fc
  .integer({ min: 10, max: 50 })
  .chain((count) => generateSpotArray(count, 'spot'))
const filteredSpotsArbitrary = (allSpots: SpotPinType[]) =>
  fc.shuffledSubarray(allSpots, {
    minLength: Math.min(3, allSpots.length),
    maxLength: Math.min(15, allSpots.length),
  })

const PilgrimageMap = require('../PilgrimageMap').default

beforeEach(() => {
  mapContainerMountCount = 0
  mapContainerUnmountCount = 0
})

afterEach(() => cleanup())

describe('PilgrimageMap map-container stability', () => {
  test('changing spots does not remount MapContainer and updates markers', () => {
    fc.assert(
      fc.property(
        allSpotsArbitrary.chain((allSpots) =>
          filteredSpotsArbitrary(allSpots).map((filteredSpots) => ({
            allSpots,
            filteredSpots,
          }))
        ),
        ({ allSpots, filteredSpots }) => {
          cleanup()
          mapContainerMountCount = 0
          mapContainerUnmountCount = 0

          const { rerender, getAllByTestId } = render(
            <PilgrimageMap
              initialCenter={[35.6762, 139.6503]}
              initialZoom={6}
              spots={allSpots}
            />
          )
          const initialMountCount = mapContainerMountCount
          expect(getAllByTestId('marker').length).toBe(allSpots.length)

          act(() => {
            rerender(
              <PilgrimageMap
                initialCenter={[35.6762, 139.6503]}
                initialZoom={6}
                spots={filteredSpots}
              />
            )
          })
          expect(mapContainerUnmountCount).toBe(0)
          expect(mapContainerMountCount).toBe(initialMountCount)
          expect(getAllByTestId('marker').length).toBe(filteredSpots.length)

          act(() => {
            rerender(
              <PilgrimageMap
                initialCenter={[35.6762, 139.6503]}
                initialZoom={6}
                spots={allSpots}
              />
            )
          })
          expect(mapContainerUnmountCount).toBe(0)
          expect(mapContainerMountCount).toBe(initialMountCount)
          expect(getAllByTestId('marker').length).toBe(allSpots.length)
        }
      ),
      { numRuns: 20 }
    )
  })

  test('PilgrimageMap does not use timeout-based invalidateSize', () => {
    const fs = require('fs')
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../PilgrimageMap.tsx'),
      'utf-8'
    )

    expect(
      sourceCode.match(/setTimeout\s*\(\s*\(\)\s*=>\s*\{[^}]*invalidateSize/g)
    ).toBeNull()
    expect(
      /ResizeObserver/.test(sourceCode) || /useResizeObserver/.test(sourceCode)
    ).toBe(true)
  })

  test('rapid category filter changes update markers without remounting MapContainer', () => {
    fc.assert(
      fc.property(
        allSpotsArbitrary.chain((allSpots) =>
          fc
            .array(fc.constantFrom(...categories), {
              minLength: 5,
              maxLength: 10,
            })
            .map((filterSequence) => ({
              allSpots,
              filterSequence,
            }))
        ),
        ({ allSpots, filterSequence }) => {
          cleanup()
          mapContainerMountCount = 0
          mapContainerUnmountCount = 0
          const { rerender, queryAllByTestId } = render(
            <PilgrimageMap
              initialCenter={[35.6762, 139.6503]}
              initialZoom={6}
              spots={allSpots}
            />
          )
          const initialMountCount = mapContainerMountCount

          for (const category of filterSequence) {
            const filtered = allSpots.filter((s) => s.category === category)
            act(() => {
              rerender(
                <PilgrimageMap
                  initialCenter={[35.6762, 139.6503]}
                  initialZoom={6}
                  spots={filtered}
                />
              )
            })
            expect(queryAllByTestId('marker').length).toBe(filtered.length)
          }

          expect(mapContainerUnmountCount).toBe(0)
          expect(mapContainerMountCount).toBe(initialMountCount)
        }
      ),
      { numRuns: 10 }
    )
  })
})
