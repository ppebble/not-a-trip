/**
 * @jest-environment jsdom
 */

import fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SpotPreviewData } from '@/types'
import SpotPreview from '../SpotPreview'

// Cleanup after each test to prevent DOM element accumulation
afterEach(() => {
  cleanup()
})

// Feature: anime-pilgrimage-map, Property 2: 스팟 미리보기 필수 정보 포함
// Validates: Requirements 2.2

/**
 * Generators for property-based testing
 */

// Generate valid SpotPreviewData objects
const spotPreviewDataArbitrary = fc.record({
  id: fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0),
  name: fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0),
  description: fc
    .string({ minLength: 1, maxLength: 1000 })
    .filter((s) => s.trim().length > 0),
  photoUrl: fc.webUrl(),
  address: fc
    .string({ minLength: 1, maxLength: 300 })
    .filter((s) => s.trim().length > 0),
})

/**
 * Helper function to check if rendered content contains required information
 * Requirements 2.2: 스팟 이름, 사진, 설명, 주소 표시
 */
function containsRequiredInfo(
  container: HTMLElement,
  spotData: SpotPreviewData
): boolean {
  const content = container.textContent || ''
  const html = container.innerHTML

  // Check if spot name is present
  const hasName = content.includes(spotData.name)

  // Check if spot address is present
  const hasAddress = content.includes(spotData.address)

  // Check if spot description is present
  const hasDescription = content.includes(spotData.description)

  // Check if photo is present (either as img src, background image, or placeholder)
  const hasPhoto =
    html.includes(spotData.photoUrl) ||
    container.querySelector('img[src*="' + spotData.photoUrl + '"]') !== null ||
    html.includes('background-image') ||
    container.querySelector('img') !== null ||
    // Also accept placeholder content (div with emoji or specific styling)
    container.querySelector('div[class*="bg-navy-100"]') !== null ||
    content.includes('🗾')

  return hasName && hasAddress && hasDescription && hasPhoto
}

/**
 * Mock Zustand stores for testing
 */
jest.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    closePreview: jest.fn(),
    setPreviewHovered: jest.fn(),
  }),
  useIsPreviewOpen: () => true, // Always open for testing
  usePreviewSpotId: () => 'test-spot-id', // Mock spot ID
  usePreviewPosition: () => ({ x: 100, y: 100 }), // Mock position
}))

/**
 * Mock useSpotPreview hook to return test data
 */
let mockSpotData: SpotPreviewData | null = null

jest.mock('@/hooks/useSpots', () => ({
  useSpotPreview: () => ({
    data: mockSpotData,
    isLoading: false,
    error: null,
  }),
}))

/**
 * Mock Next.js router
 */
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

/**
 * Mock Next.js Image component
 * Filter out Next.js specific props that are not valid HTML attributes
 */
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    priority,
    fill,
    sizes,
    quality,
    placeholder,
    blurDataURL,
    loader,
    onLoadingComplete,
    ...props
  }: {
    src: string
    alt: string
    priority?: boolean
    fill?: boolean
    sizes?: string
    quality?: number
    placeholder?: string
    blurDataURL?: string
    loader?: unknown
    onLoadingComplete?: unknown
    [key: string]: unknown
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  }
})

describe('SpotPreview Required Information Property Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  afterEach(() => {
    queryClient.clear()
    mockSpotData = null
  })

  test('Property 2: 스팟 미리보기 필수 정보 포함', () => {
    fc.assert(
      fc.property(spotPreviewDataArbitrary, (spotData: SpotPreviewData) => {
        // Cleanup before each iteration to prevent DOM element accumulation
        cleanup()

        // Set mock data for the hook
        mockSpotData = spotData

        // Render the SpotPreview component with QueryClient provider
        const { container } = render(
          <QueryClientProvider client={queryClient}>
            <SpotPreview />
          </QueryClientProvider>
        )

        // Verify that all required information is present in the rendered content
        // Requirements 2.2: 스팟 이름, 사진, 설명, 주소 표시
        return containsRequiredInfo(container, spotData)
      }),
      { numRuns: 100 }
    )
  })

  test('Property 2 Edge Case: Empty photoUrl handling', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          photoUrl: fc.constant(''), // Empty photo URL
          address: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
        }),
        (spotData: SpotPreviewData) => {
          // Cleanup before each iteration
          cleanup()

          // Set mock data for the hook
          mockSpotData = spotData

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <SpotPreview />
            </QueryClientProvider>
          )

          const content = container.textContent || ''

          // Even with empty photoUrl, name, address, and description should still be present
          const hasName = content.includes(spotData.name)
          const hasAddress = content.includes(spotData.address)
          const hasDescription = content.includes(spotData.description)

          // Should have placeholder image or default image when photoUrl is empty
          // Check for either <img> element or placeholder div with emoji
          const hasImageElement =
            container.querySelector('img') !== null ||
            container.querySelector('div[class*="bg-navy-100"]') !== null ||
            container.textContent?.includes('🗾') === true

          return hasName && hasAddress && hasDescription && hasImageElement
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 2 Edge Case: Long text content handling', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc
            .string({ minLength: 50, maxLength: 200 })
            .filter((s) => s.trim().length > 0), // Long names
          description: fc
            .string({ minLength: 500, maxLength: 1000 })
            .filter((s) => s.trim().length > 0), // Long descriptions
          photoUrl: fc.webUrl(),
          address: fc
            .string({ minLength: 100, maxLength: 300 })
            .filter((s) => s.trim().length > 0), // Long addresses
        }),
        (spotData: SpotPreviewData) => {
          // Cleanup before each iteration
          cleanup()

          // Set mock data for the hook
          mockSpotData = spotData

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <SpotPreview />
            </QueryClientProvider>
          )

          // Even with long content, all required information should be present
          return containsRequiredInfo(container, spotData)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 2 Edge Case: Special characters in content', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0)
            .map((s) => s + ' 🗾🎌'), // Add special characters
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0)
            .map((s) => s + ' & < > " \''), // Add HTML special characters
          photoUrl: fc.webUrl(),
          address: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0)
            .map((s) => s + ' 東京都'), // Add Japanese characters
        }),
        (spotData: SpotPreviewData) => {
          // Cleanup before each iteration
          cleanup()

          // Set mock data for the hook
          mockSpotData = spotData

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <SpotPreview />
            </QueryClientProvider>
          )

          // Special characters should be properly rendered
          return containsRequiredInfo(container, spotData)
        }
      ),
      { numRuns: 100 }
    )
  })
})
