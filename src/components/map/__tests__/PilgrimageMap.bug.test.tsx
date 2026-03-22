/**
 * @jest-environment jsdom
 */

/**
 * Bug Condition Exploration Test - MapContainer 재사용 에러
 *
 * Property 1: Bug Condition - MapContainer 안정성
 * spots 배열이 변경될 때(카테고리 필터 전환) MapContainer가 에러 없이
 * 동일 인스턴스를 유지하는지 검증합니다.
 *
 * Bug Condition:
 *   input.component == "PilgrimageMap"
 *   AND input.spotsArray HAS CHANGED
 *   AND MapContainer ATTEMPTS RE-RENDER
 *
 * EXPECTED OUTCOME: 수정 전 코드에서 테스트 FAIL (버그 존재 확인)
 *
 * Requirements: 2.1, 2.2
 */

import fc from 'fast-check'
import { render, cleanup, act } from '@testing-library/react'
import { SpotPin as SpotPinType, SpotCategory } from '@/types'

// ============================================
// Mocks
// ============================================

// MapContainer 마운트/언마운트 추적
let mapContainerMountCount = 0
let mapContainerUnmountCount = 0

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

// SpotPreview, BottomSheet, LocationButton, GpsErrorFallback mock
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

jest.mock('@/components/mobile/LocationButton', () => {
  return function MockLocationButton() {
    return <div data-testid="location-button" />
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

// react-leaflet mock - MapContainer 마운트/언마운트 추적
jest.mock('react-leaflet', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react')

  const MapContainer = React.forwardRef(function MockMapContainer(
    {
      children,
      whenReady,
      ...props
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
      if (typeof ref === 'function') {
        ref(mapInstance)
      } else if (ref && typeof ref === 'object') {
        ;(ref as React.MutableRefObject<unknown>).current = mapInstance
      }
      if (whenReady) whenReady()

      return () => {
        mapContainerUnmountCount++
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <div data-testid="map-container" {...props}>
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

/** 유니크 ID를 가진 스팟 배열 생성 헬퍼 */
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
      items.map((item, idx) => ({
        ...item,
        id: `${prefix}-${idx}`,
      }))
    )
}

/** 전체 스팟 배열 생성 (10~50개, 유니크 ID 보장) */
const allSpotsArbitrary = fc
  .integer({ min: 10, max: 50 })
  .chain((count) => generateSpotArray(count, 'spot'))

/** 필터링된 스팟 배열 생성 (전체 배열의 부분집합, 3~15개) */
const filteredSpotsArbitrary = (allSpots: SpotPinType[]) => {
  const maxFiltered = Math.min(15, allSpots.length)
  const minFiltered = Math.min(3, allSpots.length)
  return fc.shuffledSubarray(allSpots, {
    minLength: minFiltered,
    maxLength: maxFiltered,
  })
}

// ============================================
// Test Suite
// ============================================

// PilgrimageMap을 테스트 내에서 import (mock 적용 후)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PilgrimageMap = require('../PilgrimageMap').default

beforeEach(() => {
  mapContainerMountCount = 0
  mapContainerUnmountCount = 0
})

afterEach(() => {
  cleanup()
})

describe('PilgrimageMap Bug Condition Exploration - MapContainer 안정성', () => {
  /**
   * Property 1-1: spots 배열 변경 시 MapContainer가 언마운트되지 않아야 한다
   *
   * 카테고리 필터 전환으로 spots 배열이 [전체] → [필터링] → [전체]로 변경될 때
   * MapContainer는 리마운트되지 않고 동일 인스턴스를 유지해야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (MapContainer 리마운트 또는 에러 발생)
   */
  test('spots 배열 변경 시 MapContainer가 언마운트되지 않아야 한다', () => {
    fc.assert(
      fc.property(
        allSpotsArbitrary.chain((allSpots) =>
          filteredSpotsArbitrary(allSpots).map((filtered) => ({
            allSpots,
            filteredSpots: filtered,
          }))
        ),
        ({ allSpots, filteredSpots }) => {
          cleanup()
          mapContainerMountCount = 0
          mapContainerUnmountCount = 0

          // 1단계: 전체 스팟으로 초기 렌더링
          const { rerender, getAllByTestId } = render(
            <PilgrimageMap
              initialCenter={[35.6762, 139.6503]}
              initialZoom={6}
              spots={allSpots}
            />
          )

          const initialMountCount = mapContainerMountCount
          const initialMarkerCount = getAllByTestId('marker').length

          // 초기 마커 수가 전체 스팟 수와 일치해야 함
          expect(initialMarkerCount).toBe(allSpots.length)

          // 2단계: 필터링된 스팟으로 리렌더링 (카테고리 필터 전환 시뮬레이션)
          act(() => {
            rerender(
              <PilgrimageMap
                initialCenter={[35.6762, 139.6503]}
                initialZoom={6}
                spots={filteredSpots}
              />
            )
          })

          // MapContainer가 언마운트되지 않았어야 함
          expect(mapContainerUnmountCount).toBe(0)
          // MapContainer가 추가로 마운트되지 않았어야 함
          expect(mapContainerMountCount).toBe(initialMountCount)

          // 마커 수가 필터링된 스팟 수로 업데이트되어야 함
          const filteredMarkerCount = getAllByTestId('marker').length
          expect(filteredMarkerCount).toBe(filteredSpots.length)

          // 3단계: 다시 전체 스팟으로 리렌더링
          act(() => {
            rerender(
              <PilgrimageMap
                initialCenter={[35.6762, 139.6503]}
                initialZoom={6}
                spots={allSpots}
              />
            )
          })

          // 여전히 MapContainer가 언마운트되지 않았어야 함
          expect(mapContainerUnmountCount).toBe(0)
          expect(mapContainerMountCount).toBe(initialMountCount)

          // 마커 수가 다시 전체 스팟 수로 복원되어야 함
          const restoredMarkerCount = getAllByTestId('marker').length
          expect(restoredMarkerCount).toBe(allSpots.length)
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * Property 1-2: setTimeout 기반 invalidateSize 패턴이 존재하지 않아야 한다
   *
   * PilgrimageMap 소스코드에서 setTimeout(() => { map.invalidateSize() }, ...)
   * 패턴이 사용되고 있는지 확인한다. 이 패턴은 ResizeObserver 기반으로 교체되어야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (setTimeout 기반 invalidateSize 패턴 존재)
   */
  test('setTimeout 기반 invalidateSize 호출 패턴이 존재하지 않아야 한다', () => {
    // PilgrimageMap 소스코드를 문자열로 읽어서 패턴 검사
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../PilgrimageMap.tsx'),
      'utf-8'
    )

    // setTimeout + invalidateSize 패턴 감지
    const setTimeoutInvalidateSizePattern =
      /setTimeout\s*\(\s*\(\)\s*=>\s*\{[^}]*invalidateSize/g
    const matches = sourceCode.match(setTimeoutInvalidateSizePattern)

    // 수정 후에는 이 패턴이 없어야 함
    // 수정 전에는 이 패턴이 존재하므로 테스트 FAIL
    expect(matches).toBeNull()
  })

  /**
   * Property 1-3: 빠른 카테고리 필터 전환 시 에러가 발생하지 않아야 한다
   *
   * 카테고리 필터를 빠르게 반복 전환해도 에러 없이 매번 정상적으로
   * 필터링된 스팟 핀이 표시되어야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (빠른 전환 시 에러 또는 불일치)
   * Requirements: 2.2
   */
  test('빠른 카테고리 필터 반복 전환 시 에러 없이 마커가 업데이트되어야 한다', () => {
    fc.assert(
      fc.property(
        allSpotsArbitrary.chain((allSpots) =>
          fc
            .array(fc.constantFrom(...categories), {
              minLength: 5,
              maxLength: 10,
            })
            .map((filterSequence) => ({ allSpots, filterSequence }))
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

          // 빠르게 카테고리 필터를 전환
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

            // 매 전환마다 마커 수가 필터링 결과와 일치해야 함
            const markers = queryAllByTestId('marker')
            expect(markers.length).toBe(filtered.length)
          }

          // 모든 전환 후에도 MapContainer는 리마운트되지 않아야 함
          expect(mapContainerUnmountCount).toBe(0)
          expect(mapContainerMountCount).toBe(initialMountCount)
        }
      ),
      { numRuns: 10 }
    )
  })

  /**
   * Property 1-4: ResizeObserver 기반 invalidateSize가 사용되어야 한다
   *
   * setTimeout 대신 ResizeObserver를 사용하여 컨테이너 크기 변경을 감지하고
   * invalidateSize()를 호출해야 한다.
   *
   * EXPECTED: 수정 전 코드에서 FAIL (ResizeObserver 미사용)
   */
  test('ResizeObserver 기반 invalidateSize가 사용되어야 한다', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path')
    const sourceCode = fs.readFileSync(
      path.resolve(__dirname, '../PilgrimageMap.tsx'),
      'utf-8'
    )

    // 직접 사용 또는 useResizeObserver 훅을 통한 간접 사용 모두 허용
    const hasResizeObserver =
      /ResizeObserver/.test(sourceCode) || /useResizeObserver/.test(sourceCode)

    // 수정 후에는 ResizeObserver가 사용되어야 함
    // 수정 전에는 ResizeObserver가 없으므로 테스트 FAIL
    expect(hasResizeObserver).toBe(true)
  })
})
