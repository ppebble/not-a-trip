/**
 * @jest-environment jsdom
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import BottomSheet from '../BottomSheet'

const mockPush = jest.fn()
const mockCloseBottomSheet = jest.fn()
const mockClosePreview = jest.fn()
const mockSetSelectedSpot = jest.fn()

let mockHeightState: 'collapsed' | 'half' | 'full' = 'collapsed'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/components/common/OptimizedImage', () => ({
  OptimizedImage: ({ alt }: { alt: string }) => (
    <div data-testid="optimized-image">{alt}</div>
  ),
}))

jest.mock('@/stores/bottomSheetStore', () => ({
  useBottomSheetStore: () => ({ close: mockCloseBottomSheet }),
  useIsBottomSheetOpen: () => true,
  useBottomSheetSpotId: () => 'spot-57',
  useBottomSheetHeight: () => mockHeightState,
}))

jest.mock('@/hooks/useBottomSheet', () => ({
  useBottomSheet: () => ({
    sheetRef: { current: null },
    translateY: 0,
    isDragging: false,
    currentSnapHeight: 160,
  }),
}))

jest.mock('@/hooks/useSpots', () => ({
  useSpotPreview: () => ({
    data: {
      id: 'spot-57',
      name: 'Spec 57 Spot',
      description: 'A release-gate test spot.',
      photoUrl: '/images/spot.jpg',
      address: 'Tokyo',
    },
    isLoading: false,
    error: null,
  }),
}))

jest.mock('@/stores/mapStore', () => ({
  useMapStore: {
    getState: () => ({ setSelectedSpot: mockSetSelectedSpot }),
  },
}))

jest.mock('@/stores/uiStore', () => ({
  useUIStore: {
    getState: () => ({ closePreview: mockClosePreview }),
  },
}))

beforeEach(() => {
  mockHeightState = 'collapsed'
  mockPush.mockClear()
  mockCloseBottomSheet.mockClear()
  mockClosePreview.mockClear()
  mockSetSelectedSpot.mockClear()
})

afterEach(() => cleanup())

describe('BottomSheet detail navigation', () => {
  test('collapsed sheets still expose a detail navigation CTA', () => {
    render(<BottomSheet />)

    const detailButton = screen.getByRole('button', {
      name: 'Open details for Spec 57 Spot',
    })

    fireEvent.click(detailButton)

    expect(mockCloseBottomSheet).toHaveBeenCalledTimes(1)
    expect(mockClosePreview).toHaveBeenCalledTimes(1)
    expect(mockSetSelectedSpot).toHaveBeenCalledWith(null)
    expect(mockPush).toHaveBeenCalledWith('/spots/spot-57')
  })

  test('expanded sheets keep detail navigation available', () => {
    mockHeightState = 'half'

    render(<BottomSheet />)

    expect(
      screen.getAllByRole('button', { name: 'Open details for Spec 57 Spot' })
        .length
    ).toBeGreaterThan(0)
  })
})
