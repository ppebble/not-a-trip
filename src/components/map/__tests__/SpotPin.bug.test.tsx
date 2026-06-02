/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-require-imports */

import { render, act } from '@testing-library/react'
import type { SpotPin as SpotPinType } from '@/types'

const mockSetSelectedSpot = jest.fn()
const mockOpenPreview = jest.fn()
const mockClosePreview = jest.fn()
const mockOpenBottomSheet = jest.fn()
const mockLatLngToContainerPoint = jest.fn(() => ({ x: 100, y: 100 }))
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
  useMap: () => ({ latLngToContainerPoint: mockLatLngToContainerPoint }),
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

const spot: SpotPinType = {
  id: 'spot-1',
  name: 'Spot 1',
  coordinates: [35.6762, 139.6503],
  thumbnailUrl: 'https://example.com/thumb.jpg',
  category: 'animation',
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

describe('SpotPin bug-condition coverage for hover stability', () => {
  test('hover z-index remains high enough to avoid nearby-pin overlap', () => {
    render(<SpotPin spot={spot} />)
    act(() => {
      handlers().mouseover()
      jest.advanceTimersByTime(100)
    })

    expect(markerSetZIndexOffset).toHaveBeenCalledWith(10000)
  })

  test('desktop hover opens preview without selecting the spot', () => {
    render(<SpotPin spot={spot} />)
    act(() => {
      handlers().mouseover()
      jest.advanceTimersByTime(100)
    })

    expect(mockOpenPreview).toHaveBeenCalledWith('spot-1', { x: 100, y: 100 })
    expect(mockSetSelectedSpot).not.toHaveBeenCalled()
  })

  test('mouseover debounce waits before opening preview', () => {
    render(<SpotPin spot={spot} />)
    act(() => {
      handlers().mouseover()
      jest.advanceTimersByTime(99)
    })
    expect(mockOpenPreview).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(mockOpenPreview).toHaveBeenCalledWith('spot-1', { x: 100, y: 100 })
  })

  test('mouseout debounce waits before closing preview', () => {
    render(<SpotPin spot={spot} />)
    act(() => {
      handlers().mouseout()
      jest.advanceTimersByTime(249)
    })
    expect(mockClosePreview).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(mockClosePreview).toHaveBeenCalled()
  })

  test('preview hover state prevents premature close on marker mouseout', () => {
    const { useUIStore } = jest.requireMock('@/stores/uiStore')
    useUIStore.getState().isPreviewHovered = true

    render(<SpotPin spot={spot} />)
    act(() => {
      handlers().mouseout()
      jest.advanceTimersByTime(250)
    })

    expect(mockClosePreview).not.toHaveBeenCalled()
  })
})
