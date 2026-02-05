/**
 * @jest-environment jsdom
 */

import fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  SpotDetailData,
  RelatedContent,
  NearbyFacility,
  ContentType,
} from '@/types'
import SpotDetailPage from '../page'

// Cleanup after each test to prevent DOM element accumulation
afterEach(() => {
  cleanup()
})

// Feature: anime-pilgrimage-map, Property 3: 스팟 상세 필수 정보 포함
// Validates: Requirements 3.2

/**
 * Generators for property-based testing
 */

// Generate valid RelatedContent objects
const relatedContentArbitrary = fc.record({
  name: fc
    .string({ minLength: 1, maxLength: 100 })
    .filter((s) => s.trim().length > 0),
  type: fc.constantFrom(
    'anime',
    'movie',
    'drama',
    'sports_team',
    'artist',
    'game',
    'other'
  ) as fc.Arbitrary<ContentType>,
  year: fc.option(fc.integer({ min: 1900, max: 2030 }), { nil: undefined }),
  additionalInfo: fc.option(fc.string({ minLength: 1, maxLength: 100 }), {
    nil: undefined,
  }),
})

// Generate valid SpotDetailData objects
const spotDetailDataArbitrary = fc.record({
  id: fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0),
  name: fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0),
  description: fc
    .string({ minLength: 1, maxLength: 1000 })
    .filter((s) => s.trim().length > 0),
  photos: fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }),
  address: fc
    .string({ minLength: 1, maxLength: 300 })
    .filter((s) => s.trim().length > 0),
  coordinates: fc.tuple(
    fc.double({ min: -90, max: 90, noNaN: true }),
    fc.double({ min: -180, max: 180, noNaN: true })
  ) as fc.Arbitrary<[number, number]>,
  relatedContent: fc.array(relatedContentArbitrary, {
    minLength: 1,
    maxLength: 5,
  }),
  nearbyFacilities: fc.constant([]) as fc.Arbitrary<NearbyFacility[]>, // Not tested in this property
})

/**
 * Helper function to check if rendered content contains required information
 * Requirements 3.2: 스팟 이름, 사진들, 전체 설명, 주소, 관련 콘텐츠 정보 표시
 */
function containsRequiredInfo(
  container: HTMLElement,
  spotData: SpotDetailData
): boolean {
  const content = container.textContent || ''
  const html = container.innerHTML

  // Check if spot name is present (should be in h1 tag)
  const hasName = content.includes(spotData.name)

  // Check if spot address is present
  const hasAddress = content.includes(spotData.address)

  // Check if spot description is present (full description)
  const hasDescription = content.includes(spotData.description)

  // Check if photos are present (should have img elements or photo section)
  const hasPhotos =
    spotData.photos.length === 0 ||
    spotData.photos.some((photo) => html.includes(photo)) ||
    container.querySelector('img') !== null ||
    content.includes('사진')

  // Check if related content information is present
  const hasRelatedContent =
    !spotData.relatedContent ||
    spotData.relatedContent.length === 0 ||
    spotData.relatedContent.some((c) => content.includes(c.name)) ||
    content.includes('관련 콘텐츠')

  return (
    hasName && hasAddress && hasDescription && hasPhotos && hasRelatedContent
  )
}

/**
 * Mock Next.js useParams hook
 */
let mockSpotId = 'test-spot-id'

jest.mock('next/navigation', () => ({
  useParams: () => ({
    id: mockSpotId,
  }),
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

/**
 * Mock useSpotDetail hook to return test data
 */
let mockSpotData: SpotDetailData | null = null

jest.mock('@/hooks/useSpotDetail', () => ({
  useSpotDetail: () => ({
    data: mockSpotData,
    isLoading: false,
    error: null,
  }),
  useNearbyFacilities: () => ({
    data: [],
    isLoading: false,
    error: null,
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

/**
 * Mock Next.js Link component
 */
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

/**
 * Mock SpotDetailMap component
 */
jest.mock('@/components/map/SpotDetailMap', () => {
  return function MockSpotDetailMap() {
    return <div data-testid="spot-detail-map">지도 컴포넌트</div>
  }
})

/**
 * Mock next-auth/react for useSession
 */
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

/**
 * Mock SceneGallery component to avoid next-auth dependency issues
 */
jest.mock('@/components/spot/SceneGallery', () => {
  return function MockSceneGallery() {
    return <div data-testid="scene-gallery">장면 갤러리</div>
  }
})

/**
 * Mock SpotCommunitySection component
 */
jest.mock('@/components/spot/SpotCommunitySection', () => {
  return function MockSpotCommunitySection() {
    return <div data-testid="spot-community-section">커뮤니티 섹션</div>
  }
})

describe('SpotDetail Required Information Property Tests', () => {
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

  test('Property 3: 스팟 상세 필수 정보 포함', () => {
    fc.assert(
      fc.property(spotDetailDataArbitrary, (spotData: SpotDetailData) => {
        // Cleanup before each iteration to prevent DOM element accumulation
        cleanup()

        // Set mock data for the hook
        mockSpotData = spotData
        mockSpotId = spotData.id

        // Render the SpotDetailPage component with QueryClient provider
        const { container } = render(
          <QueryClientProvider client={queryClient}>
            <SpotDetailPage />
          </QueryClientProvider>
        )

        // Verify that all required information is present in the rendered content
        // Requirements 3.2: 스팟 이름, 사진들, 전체 설명, 주소, 관련 미디어 정보 표시
        return containsRequiredInfo(container, spotData)
      }),
      { numRuns: 100 }
    )
  })

  test('Property 3 Edge Case: Empty photos array handling', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          photos: fc.constant([]) as fc.Arbitrary<string[]>, // Empty photos array
          address: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          coordinates: fc.tuple(
            fc.double({ min: -90, max: 90, noNaN: true }),
            fc.double({ min: -180, max: 180, noNaN: true })
          ) as fc.Arbitrary<[number, number]>,
          relatedContent: fc.array(relatedContentArbitrary, {
            minLength: 1,
            maxLength: 3,
          }),
          nearbyFacilities: fc.constant([]) as fc.Arbitrary<NearbyFacility[]>,
        }),
        (spotData: SpotDetailData) => {
          // Cleanup before each iteration
          cleanup()

          // Set mock data for the hook
          mockSpotData = spotData
          mockSpotId = spotData.id

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <SpotDetailPage />
            </QueryClientProvider>
          )

          const content = container.textContent || ''

          // Even with empty photos, name, address, description, and related content should still be present
          const hasName = content.includes(spotData.name)
          const hasAddress = content.includes(spotData.address)
          const hasDescription = content.includes(spotData.description)
          const hasRelatedContent =
            !spotData.relatedContent ||
            spotData.relatedContent.some((c) => content.includes(c.name))

          // Photos section should not be rendered when photos array is empty
          const photosSection = container.querySelector('h2')
          const hasPhotosSection =
            photosSection && photosSection.textContent?.includes('사진')

          return (
            hasName &&
            hasAddress &&
            hasDescription &&
            hasRelatedContent &&
            !hasPhotosSection
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3 Edge Case: Empty related content array handling', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          photos: fc.array(fc.webUrl(), { minLength: 1, maxLength: 3 }),
          address: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0),
          coordinates: fc.tuple(
            fc.double({ min: -90, max: 90, noNaN: true }),
            fc.double({ min: -180, max: 180, noNaN: true })
          ) as fc.Arbitrary<[number, number]>,
          relatedContent: fc.constant([]) as fc.Arbitrary<RelatedContent[]>, // Empty related content array
          nearbyFacilities: fc.constant([]) as fc.Arbitrary<NearbyFacility[]>,
        }),
        (spotData: SpotDetailData) => {
          // Cleanup before each iteration
          cleanup()

          // Set mock data for the hook
          mockSpotData = spotData
          mockSpotId = spotData.id

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <SpotDetailPage />
            </QueryClientProvider>
          )

          const pageContent = container.textContent || ''

          // Even with empty related content, name, address, description, and photos should still be present
          const hasName = pageContent.includes(spotData.name)
          const hasAddress = pageContent.includes(spotData.address)
          const hasDescription = pageContent.includes(spotData.description)

          // For photos, check if photos section exists when photos array is not empty
          const hasPhotos =
            spotData.photos.length === 0 || pageContent.includes('사진')

          // Related content section should not be rendered when relatedContent array is empty
          const hasRelatedContentSection = pageContent.includes('관련 콘텐츠')

          return (
            hasName &&
            hasAddress &&
            hasDescription &&
            hasPhotos &&
            !hasRelatedContentSection
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3 Edge Case: Long content handling', () => {
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
          photos: fc.array(fc.webUrl(), { minLength: 5, maxLength: 10 }), // Many photos
          address: fc
            .string({ minLength: 100, maxLength: 300 })
            .filter((s) => s.trim().length > 0), // Long addresses
          coordinates: fc.tuple(
            fc.double({ min: -90, max: 90, noNaN: true }),
            fc.double({ min: -180, max: 180, noNaN: true })
          ) as fc.Arbitrary<[number, number]>,
          relatedContent: fc.array(relatedContentArbitrary, {
            minLength: 3,
            maxLength: 5,
          }), // Many related content
          nearbyFacilities: fc.constant([]) as fc.Arbitrary<NearbyFacility[]>,
        }),
        (spotData: SpotDetailData) => {
          // Cleanup before each iteration
          cleanup()

          // Set mock data for the hook
          mockSpotData = spotData
          mockSpotId = spotData.id

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <SpotDetailPage />
            </QueryClientProvider>
          )

          // Even with long content, all required information should be present
          return containsRequiredInfo(container, spotData)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3 Edge Case: Special characters in content', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          name: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0)
            .map((s) => s + ' 🗾🎌 & < > " \''), // Add special characters
          description: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0)
            .map((s) => s + ' 東京都 & < > " \''), // Add Japanese and HTML special characters
          photos: fc.array(fc.webUrl(), { minLength: 1, maxLength: 3 }),
          address: fc
            .string({ minLength: 1 })
            .filter((s) => s.trim().length > 0)
            .map((s) => s + ' 日本 & < > " \''), // Add Japanese and special characters
          coordinates: fc.tuple(
            fc.double({ min: -90, max: 90, noNaN: true }),
            fc.double({ min: -180, max: 180, noNaN: true })
          ) as fc.Arbitrary<[number, number]>,
          relatedContent: fc.array(
            fc.record({
              name: fc
                .string({ minLength: 1 })
                .filter((s) => s.trim().length > 0)
                .map((s) => s + ' アニメ & < > " \''), // Add Japanese and special characters
              type: fc.constantFrom(
                'anime',
                'movie',
                'drama',
                'sports_team',
                'artist',
                'game',
                'other'
              ) as fc.Arbitrary<ContentType>,
              year: fc.option(fc.integer({ min: 1900, max: 2030 }), {
                nil: undefined,
              }),
              additionalInfo: fc.option(
                fc.string({ minLength: 1, maxLength: 50 }),
                { nil: undefined }
              ),
            }),
            { minLength: 1, maxLength: 3 }
          ),
          nearbyFacilities: fc.constant([]) as fc.Arbitrary<NearbyFacility[]>,
        }),
        (spotData: SpotDetailData) => {
          // Cleanup before each iteration
          cleanup()

          // Set mock data for the hook
          mockSpotData = spotData
          mockSpotId = spotData.id

          const { container } = render(
            <QueryClientProvider client={queryClient}>
              <SpotDetailPage />
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
