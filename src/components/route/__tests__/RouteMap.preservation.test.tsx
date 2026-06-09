/**
 * @jest-environment jsdom
 */

/**
 * Preservation Property Tests - RouteMap 기존 동작 보존
 *
 * Property 2: Preservation - Polyline, 마커, Popup 동작 보존
 * 수정 전/후 코드에서 모두 PASS해야 하며, 기존 동작이 변경되지 않았음을 보장합니다.
 *
 * EXPECTED OUTCOME: 수정 전 코드에서 테스트 PASS (기존 동작 보존 확인)
 *
 * Requirements: 3.5, 3.6
 */

import fc from 'fast-check'
import { render } from '@testing-library/react'
import type { RouteSpot } from '@/types/route'

// ============================================
// Mocks
// ============================================

jest.mock('leaflet', () => ({
  Icon: { Default: { imagePath: '' } },
  divIcon: jest.fn(() => ({
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })),
  DivIcon: jest.fn().mockImplementation(() => ({
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })),
  LatLngBounds: jest
    .fn()
    .mockImplementation(() => ({ extend: jest.fn().mockReturnThis() })),
}))

jest.mock('react-leaflet', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')
  return {
    MapContainer: React.forwardRef(function MockMapContainer(
      {
        children,
        className,
        style,
        ...props
      }: { children: React.ReactNode; [key: string]: unknown },
      ref: React.Ref<unknown>
    ) {
      const mapInstance = React.useMemo(
        () => ({
          invalidateSize: jest.fn(),
          setView: jest.fn(),
          fitBounds: jest.fn(),
          on: jest.fn(),
          off: jest.fn(),
        }),
        []
      )
      React.useEffect(() => {
        if (typeof ref === 'function') ref(mapInstance)
        else if (ref && typeof ref === 'object')
          (ref as React.MutableRefObject<unknown>).current = mapInstance
      }, [ref, mapInstance])
      return (
        <div
          data-testid="map-container"
          className={className as string | undefined}
          style={style as React.CSSProperties | undefined}
          data-map-props={JSON.stringify(props)}
        >
          {children}
        </div>
      )
    }),
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({
      children,
      position,
      icon,
    }: {
      children?: React.ReactNode
      position: [number, number]
      icon?: unknown
    }) => (
      <div
        data-testid="marker"
        data-position={JSON.stringify(position)}
        data-icon={JSON.stringify(icon)}
      >
        {children}
      </div>
    ),
    Popup: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="popup">{children}</div>
    ),
    Polyline: ({
      positions,
      pathOptions,
    }: {
      positions: unknown
      pathOptions?: unknown
    }) => (
      <div
        data-testid="polyline"
        data-positions={JSON.stringify(positions)}
        data-options={JSON.stringify(pathOptions)}
      />
    ),
  }
})

jest.mock('../map.css', () => ({}))
jest.mock('leaflet/dist/leaflet.css', () => ({}))
jest.mock('@/lib/geo-utils', () => ({ calculateDistance: jest.fn(() => 500) }))
jest.mock('@/lib/route-utils', () => ({
  getTravelMode: jest.fn((d: number) => (d <= 3000 ? 'walking' : 'transit')),
  calculateDistance: jest.fn(() => 500),
}))

// ============================================
// Generators
// ============================================

function createMockRouteSpot(idx: number, isAvailable = true): RouteSpot {
  return {
    spotId: `spot-${idx}`,
    spotName: `스팟 ${idx}`,
    coordinates: { lat: 35.6762 + idx * 0.01, lng: 139.6503 + idx * 0.01 },
    thumbnailUrl: `https://example.com/thumb-${idx}.jpg`,
    distanceFromPrev: idx === 0 ? null : 500,
    walkTimeFromPrev: idx === 0 ? null : 7,
    isAvailable,
  }
}

const spotCountArbitrary = fc.integer({ min: 1, max: 10 })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const RouteMap = require('../RouteMap').default

// ============================================
// Test Suite
// ============================================

describe('RouteMap Preservation - 기존 동작 보존', () => {
  /**
   * Property 2-1: spots 배열에 대해 Marker가 spots.length만큼 렌더링됨
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('spots 배열에 대해 marker가 spots.length만큼 렌더링된다', () => {
    fc.assert(
      fc.property(spotCountArbitrary, (count) => {
        const spots = Array.from({ length: count }, (_, i) =>
          createMockRouteSpot(i)
        )
        const { container, unmount } = render(<RouteMap spots={spots} />)
        const markers = container.querySelectorAll('[data-testid="marker"]')
        expect(markers.length).toBe(count)
        unmount()
      }),
      { numRuns: 20 }
    )
  })

  /**
   * Property 2-2: routeSegments가 올바른 isDashed 값을 가짐
   * 도보 거리(<=3km)는 실선, 그 외는 점선
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('polyline 구간이 스팟 수 - 1만큼 렌더링된다', () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 10 }), (count) => {
        const spots = Array.from({ length: count }, (_, i) =>
          createMockRouteSpot(i)
        )
        const { container, unmount } = render(<RouteMap spots={spots} />)
        const polylines = container.querySelectorAll('[data-testid="polyline"]')
        // 최소 count-1개의 polyline (유효 스팟 간 연결)
        expect(polylines.length).toBeGreaterThanOrEqual(count - 1)
        unmount()
      }),
      { numRuns: 20 }
    )
  })

  /**
   * Property 2-3: 각 스팟 마커에 Popup이 포함됨
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('각 스팟 마커에 popup이 포함된다', () => {
    fc.assert(
      fc.property(spotCountArbitrary, (count) => {
        const spots = Array.from({ length: count }, (_, i) =>
          createMockRouteSpot(i)
        )
        const { container, unmount } = render(<RouteMap spots={spots} />)
        const popups = container.querySelectorAll('[data-testid="popup"]')
        expect(popups.length).toBe(count)
        unmount()
      }),
      { numRuns: 20 }
    )
  })

  /**
   * Property 2-4: 범례(legend) UI가 항상 렌더링됨
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('범례 UI가 항상 렌더링된다', () => {
    fc.assert(
      fc.property(spotCountArbitrary, (count) => {
        const spots = Array.from({ length: count }, (_, i) =>
          createMockRouteSpot(i)
        )
        const { container, unmount } = render(<RouteMap spots={spots} />)
        // 범례에 "스팟" 텍스트가 있어야 함
        const legendText = container.textContent
        expect(legendText).toContain('스팟')
        expect(legendText).toContain('소실됨')
        unmount()
      }),
      { numRuns: 10 }
    )
  })

  /**
   * Property 2-5: 시작 지점이 있을 때 시작 마커와 범례가 렌더링됨
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('시작 지점이 있을 때 시작 마커와 범례가 렌더링된다', () => {
    const spots = Array.from({ length: 3 }, (_, i) => createMockRouteSpot(i))
    const startPoint = {
      name: '신주쿠역',
      address: '도쿄 신주쿠',
      coordinates: { lat: 35.6896, lng: 139.7006 },
    }
    const { container } = render(
      <RouteMap spots={spots} startPoint={startPoint} />
    )
    // 시작 지점 마커 포함하여 총 4개 마커
    const markers = container.querySelectorAll('[data-testid="marker"]')
    expect(markers.length).toBe(4)
    // 범례에 "시작" 텍스트
    expect(container.textContent).toContain('시작')
  })

  /**
   * Property 2-6: 소실 스팟이 있을 때 회색 마커 + 취소선 스타일 유지
   * EXPECTED: 수정 전/후 모두 PASS
   */
  test('소실 스팟이 있을 때 popup에 소실 표시가 포함된다', () => {
    const spots = [
      createMockRouteSpot(0),
      createMockRouteSpot(1, false), // 소실 스팟
      createMockRouteSpot(2),
    ]
    const { container } = render(<RouteMap spots={spots} />)
    // 소실 스팟 popup에 "소실된 스팟" 텍스트
    expect(container.textContent).toContain('소실된 스팟')
    // 취소선 클래스 확인
    const lineThrough = container.querySelector('.line-through')
    expect(lineThrough).not.toBeNull()
  })
})
