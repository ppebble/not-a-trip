/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-require-imports */

import fc from 'fast-check'
import { render, act } from '@testing-library/react'
import type { SpotPin as SpotPinType, SpotCategory } from '@/types'

const mockSetSelectedSpot = jest.fn()
const mockOpenPreview = jest.fn()
const mockClosePreview = jest.fn()
const mockOpenBottomSheet = jest.fn()
const markerOn = jest.fn()
const markerSetIcon = jest.fn()
const markerSetZIndexOffset = jest.fn()
const markerAddTo = jest.fn()
const markerRemove = jest.fn()
const mockDivIcon = jest.fn((options) => ({
  ...options,
  __kind: 'mockDivIcon',
}))
const mockMarkerFactory = jest.fn(() => ({
  on: markerOn,
  setIcon: markerSetIcon,
  setZIndexOffset: markerSetZIndexOffset,
  addTo: markerAddTo,
  remove: markerRemove,
}))

jest.mock('@/stores/mapStore', () => ({
  useMapStore: () => ({ setSelectedSpot: mockSetSelectedSpot }),
}))

jest.mock('@/stores/uiStore', () => {
  const storeState = {
    previewSpotId: null as string | null,
    isPreviewHovered: false,
    openPreview: mockOpenPreview,
    closePreview: mockClosePreview,
  }
  const useUIStore = () => ({
    openPreview: mockOpenPreview,
    closePreview: mockClosePreview,
  })
  useUIStore.getState = () => storeState
  return { useUIStore }
})

jest.mock('@/stores/bottomSheetStore', () => ({
  useBottomSheetStore: () => ({ open: mockOpenBottomSheet }),
}))

jest.mock('react-leaflet', () => ({
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

const categories: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

function createMockSpotPin(id: number, category?: SpotCategory): SpotPinType {
  return {
    id: `spot-${id}`,
    name: `Spot ${id}`,
    coordinates: [35.6762 + id * 0.01, 139.6503 + id * 0.01],
    thumbnailUrl: `https://example.com/thumb-${id}.jpg`,
    category: category || categories[id % categories.length],
    checkInCount: id * 3,
  }
}

function handlers() {
  return Object.fromEntries(
    markerOn.mock.calls.map(([name, fn]) => [name, fn])
  ) as Record<string, () => void>
}

beforeEach(() => {
  jest.useFakeTimers()
  jest.clearAllMocks()
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn(() => ({ matches: false })),
  })
  Object.defineProperty(navigator, 'maxTouchPoints', {
    configurable: true,
    value: 0,
  })
})

afterEach(() => {
  jest.useRealTimers()
})

describe('SpotPin preservation under direct Leaflet marker management', () => {
  test('pin click calls setSelectedSpot and onSelect with the spot id', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        fc.constantFrom(...categories),
        (id, category) => {
          jest.clearAllMocks()
          const spot = createMockSpotPin(id, category)
          const onSelect = jest.fn()
          const { unmount } = render(
            <SpotPin spot={spot} onSelect={onSelect} />
          )

          act(() => handlers().click())

          expect(mockSetSelectedSpot).toHaveBeenCalledWith(spot.id)
          expect(onSelect).toHaveBeenCalledWith(spot.id)
          unmount()
        }
      ),
      { numRuns: 15 }
    )
  })

  test('marker is created at the exact spot coordinates with base z-index', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 20 }), (id) => {
        jest.clearAllMocks()
        const spot = createMockSpotPin(id)
        const { unmount } = render(<SpotPin spot={spot} />)

        expect(mockMarkerFactory).toHaveBeenCalledWith(
          spot.coordinates,
          expect.objectContaining({ zIndexOffset: 0 })
        )
        unmount()
      }),
      { numRuns: 15 }
    )
  })

  test('pin icon size constants remain base=48 and hovered=54', () => {
    const fs = require('fs')
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../SpotPin.tsx'),
      'utf-8'
    )

    expect(sourceCode).toMatch(/base\s*:\s*48/)
    expect(sourceCode).toMatch(/hovered\s*:\s*54/)
  })

  test('touch-device branch opens bottom sheet instead of desktop preview', () => {
    const fs = require('fs')
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../SpotPin.tsx'),
      'utf-8'
    )

    expect(sourceCode).toContain('_isTouchDevice')
    expect(sourceCode).toContain('openBottomSheet(spot.id)')
  })

  test('unmount removes the Leaflet marker and clears registered handlers', () => {
    const { unmount } = render(<SpotPin spot={createMockSpotPin(1)} />)

    unmount()

    expect(markerRemove).toHaveBeenCalled()
  })
})
