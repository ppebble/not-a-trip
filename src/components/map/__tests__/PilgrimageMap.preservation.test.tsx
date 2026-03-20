/**
 * @jest-environment jsdom
 */

/**
 * Preservation Property Tests - MapContainer 기존 동작 보존
 *
 * Property 2: Preservation - 전체 스팟 표시 및 기본 인터랙션 보존
 *
 * 버그 수정 전 코드에서 기존 동작이 정상인지 확인하고,
 * 수정 후에도 이 동작이 보존되는지 검증합니다.
 *
 * Observation-first methodology:
 * 1. 카테고리 필터 없이 전체 스팟 표시 시 모든 핀이 정상 렌더링됨
 * 2. 지도 줌인/줌아웃, 드래그 등 기본 인터랙션 정상 동작
 * 3. 현재 위치 버튼 클릭 시 GPS 위치 이동 정상 동작
 *
 * EXPECTED OUTCOME: 수정 전/후 모두 테스트 PASS
 *
 * Requirements: 3.1, 3.2, 3.9
 */

import fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { SpotPin as SpotPinType, SpotCategory } from '@/types'

// ============================================
// Mocks
// ============================================

// MapContainer에 전달된 props 캡처
let capturedMapContainerProps: Record<string, unknown> = {}

// LocationButton에 전달된 props 캡처
let capturedLocationButtonProps: Record<string, unknown> = {}

// mock map 인스턴스
const mockMapInstance = {
  invalidateSize: jest.fn(),
  getCenter: jest.fn(() => ({ lat: 35.6762, lng: 139.6503 })),
  getZoom: jest.fn(() => 10),
  on: jest.fn(),
  off: jest.fn(),
  flyTo: jest.fn(),
  zoomIn: jest.fn(),
  zoomOut: jest.fn(),
}

// Zustand stores mock
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
  useIsPreviewOpen: () => false,
  usePreviewSpotId: () => null,
  usePreviewPosition: () => null,
  useIsPreviewHovered: () => false,
}))

jest.mock('@/stores/bottomSheetStore', () => ({
  useBottomSheetStore: () => ({
    isOpen: false,
    spotId: null,
    open: jest.fn(),
    close: jest.fn(),
  }),
}))

// SpotPreview, BottomSheet mock
jest.mock('../SpotPreview', () => {
  return function MockSpotPreview() {
    return <div data-testid="spot-preview" />
  }
})

jest.mock('@/components/mobile/BottomSheet', () => {
  return function MockBottomSheet() {
    return <div data-testid="bottom-sheet" />
  }
})

// LocationButton mock - props 캡처
jest.mock('@/components/mobile/LocationButton', () => {
  return function MockLocationButton(props: Record<string, unknown>) {
    capturedLocationButtonProps = props
    return (
      <button
        data-testid="location-button"
        onClick={() => {
          // GPS 위치 찾기 시뮬레이션
          if (typeof props.onLocationFound === 'function') {
            ;(props.onLocationFound as (lat: number, lng: number) => void)(
              35.6895,
              139.6917
            )
          }
        }}
      />
    )
  }
})

jest.mock('@/components/mobile/GpsErrorFallback', () => {
  return function MockGpsErrorFallback() {
    return <div data-testid="gps-error" />
  }
})

// map.css mock
jest.mock('../map.css', () => ({}))

// leaflet mock
jest.mock('leaflet', () => ({
  Icon: { Default: { imagePath: '' } },
  divIcon: jest.fn(() => ({ iconSize: [32, 32] })),
}))

// react-leaflet mock - MapContainer props 캡처
jest.mock('react-leaflet', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
      ...rest
    }: {
      children: React.ReactNode
      whenReady?: () => void
      [key: string]: unknown
    },
    ref: React.Ref<unknown>
  ) {
    // props 캡처 (react-leaflet 전용 props 포함)
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
      if (typeof ref === 'function') {
        ref(mockMapInstance)
      } else if (ref && typeof ref === 'object') {
        ;(ref as React.MutableRefObject<unknown>).current = mockMapInstance
      }
      if (whenReady) whenReady()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <div
        data-testid="map-container"
        className={className as string}
        {...rest}
      >
        {children}
      </div>
    )
  })

  return {
    MapContainer,
    TileLayer: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="tile-layer">{children}</div>
    ),
    Marker: ({
      position,
      children,
    }: {
      position: [number, number]
      children?: React.ReactNode
    }) => (
      <div data-testid="marker" data-position={JSON.stringify(position)}>
        {children}
      </div>
    ),
    Popup: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="popup">{children}</div>
    ),
    useMap: () => ({
      latLngToContainerPoint: jest.fn(() => ({ x: 100, y: 100 })),
    }),
  }
})

// leaflet/dist/leaflet.css mock
jest.mock('leaflet/dist/leaflet.css', () => ({}))

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

/** 유니크 ID를 가진 스팟 배열 생성 */
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
    .map((items) =>
      items.map((item, idx) => ({
        ...item,
        id: `spot-${idx}`,
      }))
    )
}

/** 랜덤 크기의 스팟 배열 (0~100개) */
const spotsArbitrary = fc
  .integer({ min: 0, max: 100 })
  .chain((count) => generateSpots(count))

// ============================================
// Test Suite
// ============================================

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PilgrimageMap = require('../PilgrimageMap').default

beforeEach(() => {
  capturedMapContainerProps = {}
  capturedLocationButtonProps = {}
  mockMapInstance.flyTo.mockClear()
  mockMapInstance.invalidateSize.mockClear()
  mockMapInstance.on.mockClear()
  mockMapInstance.off.mockClear()
})

afterEach(() => {
  cleanup()
})

describe('PilgrimageMap Preservation - 전체 스팟 표시 및 기본 인터랙션 보존', () => {
  /**
   * Property 2-1: 전체 스팟 표시 시 모든 SpotPin이 spots.length만큼 렌더링됨
   *
   * 카테고리 필터 없이 전체 스팟을 표시할 때,
   * 모든 스팟에 대해 마커가 정확히 렌더링되어야 한다.
   *
   * Requirements: 3.1
   */
  test('spots 배열 크기만큼 정확히 마커가 렌더링되어야 한다', () => {
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

        const markers = queryAllByTestId('marker')
        expect(markers.length).toBe(spots.length)
      }),
      { numRuns: 30 }
    )
  })

  /**
   * Property 2-2: MapContainer의 줌/드래그 인터랙션 props가 유지됨
   *
   * MapContainer에 전달되는 인터랙션 관련 props가
   * 항상 올바른 값으로 설정되어야 한다.
   *
   * Requirements: 3.2
   */
  test('MapContainer 인터랙션 props가 올바르게 설정되어야 한다', () => {
    fc.assert(
      fc.property(spotsArbitrary, (spots) => {
        cleanup()
        capturedMapContainerProps = {}

        render(
          <PilgrimageMap
            initialCenter={[35.6762, 139.6503]}
            initialZoom={6}
            spots={spots}
          />
        )

        // 줌/드래그 관련 props 검증
        expect(capturedMapContainerProps.scrollWheelZoom).toBe(true)
        expect(capturedMapContainerProps.doubleClickZoom).toBe(true)
        expect(capturedMapContainerProps.dragging).toBe(true)
        expect(capturedMapContainerProps.touchZoom).toBe(true)
        expect(capturedMapContainerProps.boxZoom).toBe(true)
        expect(capturedMapContainerProps.keyboard).toBe(true)

        // 줌 컨트롤은 비활성화 (커스텀 컨트롤 사용)
        expect(capturedMapContainerProps.zoomControl).toBe(false)

        // 줌 한계 바운스 방지
        expect(capturedMapContainerProps.bounceAtZoomLimits).toBe(false)

        // 최소 줌 레벨 제한
        expect(capturedMapContainerProps.minZoom).toBe(2)
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property 2-3: LocationButton이 항상 렌더링되어야 한다
   *
   * 현재 위치 버튼은 spots 배열 크기와 무관하게 항상 표시되어야 한다.
   *
   * Requirements: 3.9
   */
  test('LocationButton이 항상 렌더링되어야 한다', () => {
    fc.assert(
      fc.property(spotsArbitrary, (spots) => {
        cleanup()

        const { getByTestId } = render(
          <PilgrimageMap
            initialCenter={[35.6762, 139.6503]}
            initialZoom={6}
            spots={spots}
          />
        )

        expect(getByTestId('location-button')).toBeTruthy()
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property 2-4: GPS 위치 이동 시 flyTo가 호출되어야 한다
   *
   * LocationButton의 onLocationFound 콜백이 호출되면
   * 지도가 해당 위치로 이동(flyTo)해야 한다.
   *
   * Requirements: 3.9
   */
  test('GPS 위치 찾기 시 지도가 해당 위치로 이동해야 한다', () => {
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

          render(
            <PilgrimageMap
              initialCenter={[35.6762, 139.6503]}
              initialZoom={6}
              spots={[]}
            />
          )

          // LocationButton의 onLocationFound 콜백 직접 호출
          const onLocationFound =
            capturedLocationButtonProps.onLocationFound as
              | ((lat: number, lng: number) => void)
              | undefined
          expect(onLocationFound).toBeDefined()

          if (onLocationFound) {
            onLocationFound(lat, lng)
          }

          expect(mockMapInstance.flyTo).toHaveBeenCalledWith([lat, lng], 15, {
            duration: 1,
          })
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * Property 2-5: 커스텀 줌 컨트롤 버튼이 항상 렌더링되어야 한다
   *
   * 줌인/줌아웃 버튼이 spots 배열과 무관하게 항상 표시되어야 한다.
   *
   * Requirements: 3.2
   */
  test('줌인/줌아웃 커스텀 버튼이 항상 렌더링되어야 한다', () => {
    fc.assert(
      fc.property(spotsArbitrary, (spots) => {
        cleanup()

        const { getByLabelText } = render(
          <PilgrimageMap
            initialCenter={[35.6762, 139.6503]}
            initialZoom={6}
            spots={spots}
          />
        )

        expect(getByLabelText('Zoom in')).toBeTruthy()
        expect(getByLabelText('Zoom out')).toBeTruthy()
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property 2-6: SpotPreview와 BottomSheet가 항상 렌더링되어야 한다
   *
   * 미리보기 및 모바일 Bottom Sheet 컴포넌트가 항상 DOM에 존재해야 한다.
   *
   * Requirements: 3.1
   */
  test('SpotPreview와 BottomSheet가 항상 렌더링되어야 한다', () => {
    fc.assert(
      fc.property(spotsArbitrary, (spots) => {
        cleanup()

        const { getByTestId } = render(
          <PilgrimageMap
            initialCenter={[35.6762, 139.6503]}
            initialZoom={6}
            spots={spots}
          />
        )

        expect(getByTestId('spot-preview')).toBeTruthy()
        expect(getByTestId('bottom-sheet')).toBeTruthy()
      }),
      { numRuns: 10 }
    )
  })
})
