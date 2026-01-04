/**
 * @jest-environment jsdom
 */

import fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { SpotPin as SpotPinType } from '@/types'
import SpotPin from '../SpotPin'
import { MapContainer } from 'react-leaflet'

// Cleanup after each test to prevent DOM element accumulation
afterEach(() => {
  cleanup()
})

// Feature: anime-pilgrimage-map, Property 1: 스팟 핀 좌표 일치
// Validates: Requirements 1.2

/**
 * Generators for property-based testing
 */

// Generate valid coordinates (latitude: -90 to 90, longitude: -180 to 180)
const coordinatesArbitrary = fc.tuple(
  fc.double({ min: -90, max: 90, noNaN: true }),
  fc.double({ min: -180, max: 180, noNaN: true })
) as fc.Arbitrary<[number, number]>

// Generate valid SpotPin objects
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

/**
 * Helper function to extract coordinates from rendered SpotPin component
 * This function simulates how the Leaflet Marker component receives coordinates
 */
function extractCoordinatesFromSpotPin(spotPin: SpotPinType): [number, number] {
  // In the actual SpotPin component, coordinates are passed directly to the Marker
  // The Marker component uses the position prop which should match spot.coordinates
  return spotPin.coordinates
}

/**
 * Helper function to check if two coordinate pairs are equivalent
 * Handles floating point precision issues
 */
function coordinatesAreEquivalent(
  coords1: [number, number],
  coords2: [number, number],
  tolerance: number = 1e-10
): boolean {
  const [lat1, lng1] = coords1
  const [lat2, lng2] = coords2

  return Math.abs(lat1 - lat2) < tolerance && Math.abs(lng1 - lng2) < tolerance
}

/**
 * Mock Zustand stores for testing
 */
jest.mock('@/stores/mapStore', () => ({
  useMapStore: () => ({
    selectedSpotId: null,
    setSelectedSpot: jest.fn(),
  }),
}))

jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    openPreview: jest.fn(),
  }),
}))

/**
 * Mock Leaflet and react-leaflet components for testing
 */
jest.mock('react-leaflet', () => ({
  Marker: ({
    position,
    children,
  }: {
    position: [number, number]
    children: React.ReactNode
  }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
}))

jest.mock('leaflet', () => ({
  divIcon: jest.fn(() => ({ iconSize: [32, 32] })),
}))

describe('SpotPin Coordinates Property Tests', () => {
  test('Property 1: 스팟 핀 좌표 일치', () => {
    fc.assert(
      fc.property(spotPinArbitrary, (spotData: SpotPinType) => {
        // Cleanup before each iteration to prevent DOM element accumulation
        cleanup()

        // Render the SpotPin component within a MapContainer
        const { getByTestId } = render(
          <MapContainer center={[0, 0]} zoom={10}>
            <SpotPin spot={spotData} />
          </MapContainer>
        )

        // Extract the coordinates from the rendered Marker component
        const markerElement = getByTestId('marker')
        const renderedPosition = JSON.parse(
          markerElement.getAttribute('data-position') || '[]'
        ) as [number, number]

        // Extract coordinates using our helper function
        const expectedCoordinates = extractCoordinatesFromSpotPin(spotData)

        // Verify that the rendered coordinates match the original spot coordinates
        return coordinatesAreEquivalent(renderedPosition, expectedCoordinates)
      }),
      { numRuns: 100 }
    )
  })

  test('Property 1 Edge Case: Extreme coordinate values', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          coordinates: fc.constantFrom(
            [-90, -180] as [number, number], // South-West extreme
            [90, 180] as [number, number], // North-East extreme
            [0, 0] as [number, number], // Equator/Prime Meridian
            [-90, 180] as [number, number], // South-East extreme
            [90, -180] as [number, number] // North-West extreme
          ),
          thumbnailUrl: fc.webUrl(),
        }),
        (spotData: SpotPinType) => {
          // Cleanup before each iteration to prevent DOM element accumulation
          cleanup()

          const { getByTestId } = render(
            <MapContainer center={[0, 0]} zoom={10}>
              <SpotPin spot={spotData} />
            </MapContainer>
          )

          const markerElement = getByTestId('marker')
          const renderedPosition = JSON.parse(
            markerElement.getAttribute('data-position') || '[]'
          ) as [number, number]

          const expectedCoordinates = extractCoordinatesFromSpotPin(spotData)

          return coordinatesAreEquivalent(renderedPosition, expectedCoordinates)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 1 Edge Case: Precision boundary values', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          coordinates: fc.tuple(
            // Generate coordinates with high precision
            fc.double({ min: -90, max: 90, noNaN: true }).map(
              (n) => Math.round(n * 1000000) / 1000000 // 6 decimal places precision
            ),
            fc.double({ min: -180, max: 180, noNaN: true }).map(
              (n) => Math.round(n * 1000000) / 1000000 // 6 decimal places precision
            )
          ) as fc.Arbitrary<[number, number]>,
          thumbnailUrl: fc.webUrl(),
        }),
        (spotData: SpotPinType) => {
          // Cleanup before each iteration to prevent DOM element accumulation
          cleanup()

          const { getByTestId } = render(
            <MapContainer center={[0, 0]} zoom={10}>
              <SpotPin spot={spotData} />
            </MapContainer>
          )

          const markerElement = getByTestId('marker')
          const renderedPosition = JSON.parse(
            markerElement.getAttribute('data-position') || '[]'
          ) as [number, number]

          const expectedCoordinates = extractCoordinatesFromSpotPin(spotData)

          // Use a slightly more lenient tolerance for high-precision coordinates
          return coordinatesAreEquivalent(
            renderedPosition,
            expectedCoordinates,
            1e-6
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
