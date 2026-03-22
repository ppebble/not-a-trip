/**
 * @jest-environment jsdom
 */

/**
 * Bug Condition Exploration Test - RouteMap 타일 정렬
 *
 * Property 1: Bug Condition - RouteMap 타일 깨짐
 * RouteMap 마운트 시 invalidateSize가 ResizeObserver 기반이 아닌
 * setTimeout(300) 기반으로 호출되는지 검증합니다.
 *
 * Bug Condition:
 *   input.component == "RouteMap"
 *   AND input.containerSizeNotSettled == true
 *   AND invalidateSize() CALLED AT FIXED_TIMEOUT
 *
 * EXPECTED OUTCOME: 수정 전 코드에서 테스트 FAIL (버그 존재 확인)
 *
 * Requirements: 2.5, 2.6
 */

import fc from 'fast-check'

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
        <div data-testid="map-container" {...props}>
          {children}
        </div>
      )
    }),
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({
      children,
      position,
    }: {
      children?: React.ReactNode
      position: [number, number]
    }) => (
      <div data-testid="marker" data-position={JSON.stringify(position)}>
        {children}
      </div>
    ),
    Popup: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="popup">{children}</div>
    ),
    Polyline: ({ positions }: { positions: [number, number][] }) => (
      <div data-testid="polyline" data-positions={JSON.stringify(positions)} />
    ),
  }
})

jest.mock('../map.css', () => ({}))
jest.mock('leaflet/dist/leaflet.css', () => ({}))
jest.mock('@/lib/geo-utils', () => ({
  calculateDistance: jest.fn(() => 500),
}))
jest.mock('@/lib/route-utils', () => ({
  getTravelMode: jest.fn(() => 'walking'),
  calculateDistance: jest.fn(() => 500),
}))

// ============================================
// Generators
// ============================================

const spotCountArbitrary = fc.integer({ min: 2, max: 10 })

// ============================================
// Test Suite
// ============================================

describe('RouteMap Bug Condition Exploration - 타일 정렬', () => {
  /**
   * Property 1-1: 소스코드에 setTimeout 기반 invalidateSize 패턴이 존재하지 않아야 한다
   *
   * RouteMap 소스코드에서 setTimeout(...invalidateSize..., 300) 패턴이
   * 존재하면 버그 조건이 충족됨을 의미한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (setTimeout 패턴 존재)
   */
  test('소스코드에 setTimeout 기반 invalidateSize 패턴이 없어야 한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../RouteMap.tsx'),
      'utf-8'
    )

    // setTimeout과 invalidateSize가 함께 사용되는 패턴 감지
    const hasSetTimeoutInvalidateSize =
      /setTimeout\s*\(\s*\(\)\s*=>\s*\{[^}]*invalidateSize/.test(sourceCode)

    // 수정 후에는 setTimeout + invalidateSize 패턴이 없어야 함
    expect(hasSetTimeoutInvalidateSize).toBe(false)
  })

  /**
   * Property 1-2: 소스코드에 ResizeObserver가 사용되어야 한다
   *
   * RouteMap에서 컨테이너 크기 변경을 감지하기 위해
   * ResizeObserver를 사용해야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (ResizeObserver 미사용)
   */
  test('소스코드에 ResizeObserver가 사용되어야 한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../RouteMap.tsx'),
      'utf-8'
    )

    // 직접 사용 또는 useResizeObserver 훅을 통한 간접 사용 모두 허용
    const hasResizeObserver =
      /ResizeObserver/.test(sourceCode) || /useResizeObserver/.test(sourceCode)
    expect(hasResizeObserver).toBe(true)
  })

  /**
   * Property 1-3: useEffect 클린업에서 ResizeObserver disconnect가 호출되어야 한다
   *
   * 메모리 누수 방지를 위해 useEffect 클린업에서
   * ResizeObserver.disconnect()가 호출되어야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (disconnect 미호출)
   */
  test('useEffect 클린업에서 ResizeObserver disconnect가 호출되어야 한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')

    // 컴포넌트 소스 또는 useResizeObserver 훅에서 disconnect 확인
    const componentCode = fs.readFileSync(
      path.resolve(__dirname, '../RouteMap.tsx'),
      'utf-8'
    )
    const hookPath = path.resolve(
      __dirname,
      '../../../hooks/useResizeObserver.ts'
    )
    let hookCode = ''
    try {
      hookCode = fs.readFileSync(hookPath, 'utf-8')
    } catch {
      /* hook 미존재 시 무시 */
    }

    const hasDisconnect =
      /disconnect\s*\(\s*\)/.test(componentCode) ||
      /disconnect\s*\(\s*\)/.test(hookCode)
    expect(hasDisconnect).toBe(true)
  })

  /**
   * Property 1-4: 다양한 스팟 수에서 setTimeout(300) 패턴이 없어야 한다
   *
   * PBT로 다양한 스팟 배열에 대해 소스코드 레벨에서
   * 고정 타이밍 패턴이 없음을 검증한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL
   */
  test('다양한 스팟 수에서 고정 타이밍(300ms) invalidateSize 패턴이 없어야 한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../RouteMap.tsx'),
      'utf-8'
    )

    fc.assert(
      fc.property(spotCountArbitrary, () => {
        // 300ms 고정 타이밍 패턴이 없어야 함
        const hasFixedTimeout = /setTimeout\s*\([^)]*,\s*300\s*\)/.test(
          sourceCode
        )
        expect(hasFixedTimeout).toBe(false)
      }),
      { numRuns: 10 }
    )
  })
})
