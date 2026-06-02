/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-require-imports */

import fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import type { SpotPin as SpotPinType } from '@/types'

const mockMarkerFactory = jest.fn(() => ({
  on: jest.fn(),
  setIcon: jest.fn(),
  setZIndexOffset: jest.fn(),
  addTo: jest.fn(),
  remove: jest.fn(),
}))
const mockDivIcon = jest.fn((options) => ({
  ...options,
  __kind: 'mockDivIcon',
}))

jest.mock('@/stores/mapStore', () => ({
  useMapStore: () => ({ setSelectedSpot: jest.fn() }),
}))

jest.mock('@/stores/uiStore', () => {
  const useUIStore = () => ({ openPreview: jest.fn(), closePreview: jest.fn() })
  useUIStore.getState = () => ({
    previewSpotId: null,
    isPreviewHovered: false,
    closePreview: jest.fn(),
  })
  return { useUIStore }
})

jest.mock('@/stores/bottomSheetStore', () => ({
  useBottomSheetStore: () => ({ open: jest.fn() }),
}))

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  useMap: () => ({
    latLngToContainerPoint: jest.fn(() => ({ x: 100, y: 100 })),
  }),
}))

jest.mock('leaflet', () => ({
  __esModule: true,
  default: {
    divIcon: mockDivIcon,
    marker: mockMarkerFactory,
    Icon: { Default: { imagePath: '' } },
  },
  divIcon: mockDivIcon,
  marker: mockMarkerFactory,
  Icon: { Default: { imagePath: '' } },
}))
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn(() => ({ matches: false })),
})
Object.defineProperty(navigator, 'maxTouchPoints', {
  configurable: true,
  value: 0,
})
delete (window as unknown as { ontouchstart?: unknown }).ontouchstart

const SpotPin = require('../SpotPin').default

afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})

const coordinatesArbitrary = fc.tuple(
  fc.double({ min: -90, max: 90, noNaN: true }),
  fc.double({ min: -180, max: 180, noNaN: true })
) as fc.Arbitrary<[number, number]>

const spotPinArbitrary = fc.record({
  id: fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0),
  name: fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0),
  coordinates: coordinatesArbitrary,
  thumbnailUrl: fc.webUrl(),
})

function expectMarkerCreatedAt(spotData: SpotPinType) {
  render(<SpotPin spot={spotData} />)
  expect(mockMarkerFactory).toHaveBeenCalledWith(
    spotData.coordinates,
    expect.objectContaining({ icon: expect.any(Object) })
  )
}

describe('SpotPin coordinate property tests', () => {
  test('Property 1: spot pin marker coordinates match spot coordinates', () => {
    fc.assert(
      fc.property(spotPinArbitrary, (spotData: SpotPinType) => {
        cleanup()
        jest.clearAllMocks()
        expectMarkerCreatedAt(spotData)
      }),
      { numRuns: 100 }
    )
  })

  test('Property 1 Edge Case: extreme coordinate values', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          coordinates: fc.constantFrom(
            [-90, -180] as [number, number],
            [90, 180] as [number, number],
            [0, 0] as [number, number],
            [-90, 180] as [number, number],
            [90, -180] as [number, number]
          ),
          thumbnailUrl: fc.webUrl(),
        }),
        (spotData: SpotPinType) => {
          cleanup()
          jest.clearAllMocks()
          expectMarkerCreatedAt(spotData)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1 Edge Case: precision boundary values', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          coordinates: fc.tuple(
            fc
              .double({ min: -90, max: 90, noNaN: true })
              .map((n) => Math.round(n * 1000000) / 1000000),
            fc
              .double({ min: -180, max: 180, noNaN: true })
              .map((n) => Math.round(n * 1000000) / 1000000)
          ) as fc.Arbitrary<[number, number]>,
          thumbnailUrl: fc.webUrl(),
        }),
        (spotData: SpotPinType) => {
          cleanup()
          jest.clearAllMocks()
          expectMarkerCreatedAt(spotData)
        }
      ),
      { numRuns: 100 }
    )
  })
})
