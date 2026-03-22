/**
 * @jest-environment jsdom
 */

/**
 * Preservation Property Tests - 핀 기존 동작 보존
 *
 * Property 2: Preservation - 개별 핀 이벤트 및 모바일 터치 보존
 * 수정 전/후 코드에서 모두 PASS해야 하며, 기존 동작이 변경되지 않았음을 보장합니다.
 *
 * EXPECTED OUTCOME: 수정 전 코드에서 테스트 PASS (기존 동작 보존 확인)
 *
 * Requirements: 3.7, 3.8
 */

import fc from 'fast-check'
import { render, fireEvent } from '@testing-library/react'
import { SpotPin as SpotPinType, SpotCategory } from '@/types'

// ============================================
// Mocks
// ============================================

const mockSetSelectedSpot = jest.fn()
const mockOpenPreview = jest.fn()
const mockClosePreview = jest.fn()
const mockOpenBottomSheet = jest.fn()

jest.mock('@/stores/mapStore', () => ({
  useMapStore: () => ({
    selectedSpotId: null,
    setSelectedSpot: mockSetSelectedSpot,
  }),
}))

jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    openPreview: mockOpenPreview,
    closePreview: mockClosePreview,
    setPreviewHovered: jest.fn(),
  }),
  useIsPreviewHovered: () => false,
}))

jest.mock('@/stores/bottomSheetStore', () => ({
  useBottomSheetStore: () => ({ open: mockOpenBottomSheet }),
}))

jest.mock('../map.css', () => ({}))
jest.mock('leaflet/dist/leaflet.css', () => ({}))

const mockLatLngToContainerPoint = jest.fn(() => ({ x: 100, y: 100 }))

jest.mock('leaflet', () => ({
  Icon: { Default: { imagePath: '' } },
  divIcon: jest.fn(() => ({
    iconSize: [48, 60],
    iconAnchor: [24, 60],
    popupAnchor: [0, -60],
  })),
}))

let _capturedEventHandlers: Record<string, (...args: unknown[]) => void> = {}

jest.mock('react-leaflet', () => ({
  Marker: ({
    position,
    eventHandlers,
    zIndexOffset,
    children,
  }: {
    position: [number, number]
    eventHandlers?: Record<string, () => void>
    zIndexOffset?: number
    children?: React.ReactNode
  }) => {
    _capturedEventHandlers = eventHandlers || {}
    return (
      <div
        data-testid="spot-marker"
        data-position={JSON.stringify(position)}
        data-zindex={zIndexOffset}
        onClick={eventHandlers?.click}
        onMouseOver={eventHandlers?.mouseover}
        onMouseOut={eventHandlers?.mouseout}
      >
        {children}
      </div>
    )
  },
  useMap: () => ({ latLngToContainerPoint: mockLatLngToContainerPoint }),
}))

// ============================================
// Generators
// ============================================

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
    name: `스팟 ${id}`,
    coordinates: [35.6762 + id * 0.01, 139.6503 + id * 0.01],
    thumbnailUrl: `https://example.com/thumb-${id}.jpg`,
    category: category || categories[id % categories.length],
    checkInCount: id * 3,
  }
}

const categoryArbitrary = fc.constantFrom(...categories)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SpotPin = require('../SpotPin').default

// ============================================
// Test Suite
// ============================================

afterEach(() => {
  jest.clearAllMocks()
  _capturedEventHandlers = {}
})

describe('SpotPin Preservation - 핀 기존 동작 보존', () => {
  /**
   * Property 2-1: 개별 핀 클릭 시 setSelectedSpot이 올바른 spotId로 호출됨
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('핀 클릭 시 setSelectedSpot이 올바른 spotId로 호출된다', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 20 }),
        categoryArbitrary,
        (id, category) => {
          const spot = createMockSpotPin(id, category)
          const mockOnSelect = jest.fn()
          const { container, unmount } = render(
            <SpotPin spot={spot} onSelect={mockOnSelect} />
          )

          const marker = container.querySelector('[data-testid="spot-marker"]')
          expect(marker).not.toBeNull()
          fireEvent.click(marker!)

          expect(mockSetSelectedSpot).toHaveBeenCalledWith(`spot-${id}`)
          unmount()
          jest.clearAllMocks()
        }
      ),
      { numRuns: 15 }
    )
  })

  /**
   * Property 2-2: 핀 아이콘 크기가 상태별로 올바름 (base=48, hovered=54)
   *
   * 소스코드에서 PIN_SIZES 상수가 올바른 값을 가지는지 검증한다.
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('핀 아이콘 크기 상수가 올바르다 (base=48, hovered=54)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../SpotPin.tsx'),
      'utf-8'
    )

    // PIN_SIZES 상수 확인 (호버 단일 상태로 변경됨)
    const baseMatch = sourceCode.match(/base\s*:\s*48/)
    const hoveredMatch = sourceCode.match(/hovered\s*:\s*54/)

    expect(baseMatch).not.toBeNull()
    expect(hoveredMatch).not.toBeNull()
  })

  /**
   * Property 2-3: 마커가 올바른 좌표에 렌더링됨
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('마커가 올바른 좌표에 렌더링된다', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 20 }), (id) => {
        const spot = createMockSpotPin(id)
        const { container, unmount } = render(<SpotPin spot={spot} />)

        const marker = container.querySelector('[data-testid="spot-marker"]')
        expect(marker).not.toBeNull()
        const position = JSON.parse(
          marker!.getAttribute('data-position') || '[]'
        )
        expect(position).toEqual(spot.coordinates)

        unmount()
      }),
      { numRuns: 15 }
    )
  })

  /**
   * Property 2-4: 터치 디바이스에서 mouseover/mouseout 이벤트가 무시됨
   *
   * 소스코드에서 isTouchDevice 체크가 mouseover/mouseout 핸들러에 있는지 확인
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('터치 디바이스 감지 로직이 mouseover/mouseout 핸들러에 존재한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../SpotPin.tsx'),
      'utf-8'
    )

    // handleMouseOver에서 isTouchDevice 체크
    const mouseOverSection = sourceCode
      .split('handleMouseOver')[1]
      ?.split('handleMouseOut')[0]
    expect(mouseOverSection).toContain('isTouchDevice')

    // handleMouseOut에서 isTouchDevice 체크
    const mouseOutSection = sourceCode
      .split('handleMouseOut')[1]
      ?.split('return')[0]
    expect(mouseOutSection).toContain('isTouchDevice')
  })

  /**
   * Property 2-5: 기본 z-index offset이 0이다 (비선택, 비호버 상태)
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('기본 상태에서 z-index offset이 0이다', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10 }), (id) => {
        const spot = createMockSpotPin(id)
        const { container, unmount } = render(<SpotPin spot={spot} />)

        const marker = container.querySelector('[data-testid="spot-marker"]')
        expect(marker).not.toBeNull()
        const zIndex = marker!.getAttribute('data-zindex')
        expect(zIndex).toBe('0')

        unmount()
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property 2-6: onSelect 콜백이 소스코드에서 click 핸들러 내에 존재함
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('onSelect 콜백이 click 핸들러에서 호출되는 코드가 존재한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../SpotPin.tsx'),
      'utf-8'
    )

    // handleClick 함수 내에서 onSelect 호출이 존재하는지 확인
    const handleClickSection = sourceCode
      .split('handleClick')[1]
      ?.split('handleMouseOver')[0]
    expect(handleClickSection).toBeDefined()
    expect(handleClickSection).toMatch(/onSelect\?\.\(spot\.id\)/)
  })
})
