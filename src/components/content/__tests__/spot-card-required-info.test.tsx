/**
 * @jest-environment jsdom
 */

/**
 * Property 5: 스팟 카드 필수 정보 포함
 * Feature: ux-quality-improvements, Property 5: spot card required info
 *
 * 임의의 SpotPin 데이터에 대해 스팟 카드 렌더링 결과에
 * 스팟 이름(name)과 카테고리 정보가 포함되는지 검증
 *
 * Validates: Requirements 4.3
 */

import fc from 'fast-check'
import { render, cleanup } from '@testing-library/react'
import { SpotPin, SpotCategory, CATEGORY_CONFIG } from '@/types'
import { SpotCard } from '../ContentSpotsClient'

afterEach(() => {
  cleanup()
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
 * Mock Next.js Image component
 */
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    priority: _priority,
    unoptimized: _unoptimized,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    priority?: boolean
    unoptimized?: boolean
    [key: string]: unknown
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  }
})

/**
 * Mock CategoryIcon component
 */
jest.mock('@/components/common', () => ({
  CategoryIcon: ({ category }: { category: SpotCategory }) => (
    <span data-testid={`category-icon-${category}`}>{category}</span>
  ),
}))

/**
 * Mock MapPinIcon
 */
jest.mock('@/components/icons', () => ({
  MapPinIcon: ({ size: _size }: { size?: number }) => (
    <span data-testid="map-pin-icon">📍</span>
  ),
}))

// All valid SpotCategory values
const SPOT_CATEGORIES: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

/**
 * Generator: SpotCategory arbitrary
 */
const spotCategoryArb = fc.constantFrom(...SPOT_CATEGORIES)

/**
 * Generator: SpotPin with category
 */
const spotPinWithCategoryArb: fc.Arbitrary<SpotPin> = fc.record({
  id: fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0),
  name: fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0),
  coordinates: fc.tuple(
    fc.double({ min: -90, max: 90, noNaN: true }),
    fc.double({ min: -180, max: 180, noNaN: true })
  ) as fc.Arbitrary<[number, number]>,
  thumbnailUrl: fc.webUrl(),
  category: spotCategoryArb as fc.Arbitrary<SpotCategory | undefined>,
  checkInCount: fc.option(fc.nat({ max: 10000 }), { nil: undefined }),
})

/**
 * Generator: SpotPin without category (category undefined)
 */
const spotPinWithoutCategoryArb: fc.Arbitrary<SpotPin> = fc.record({
  id: fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0),
  name: fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0),
  coordinates: fc.tuple(
    fc.double({ min: -90, max: 90, noNaN: true }),
    fc.double({ min: -180, max: 180, noNaN: true })
  ) as fc.Arbitrary<[number, number]>,
  thumbnailUrl: fc.webUrl(),
  category: fc.constant(undefined) as fc.Arbitrary<SpotCategory | undefined>,
  checkInCount: fc.option(fc.nat({ max: 10000 }), { nil: undefined }),
})

// Feature: ux-quality-improvements, Property 5: spot card required info
describe('SpotCard Required Information Property Tests', () => {
  test('Property 5: 카테고리가 있는 스팟 카드에 이름과 카테고리 라벨이 포함된다', () => {
    fc.assert(
      fc.property(spotPinWithCategoryArb, (spot: SpotPin) => {
        cleanup()

        const { container } = render(<SpotCard spot={spot} />)
        const content = container.textContent || ''

        // 스팟 이름이 렌더링 결과에 포함되어야 한다
        const hasName = content.includes(spot.name)

        // 카테고리 라벨이 렌더링 결과에 포함되어야 한다
        const categoryConfig = spot.category
          ? CATEGORY_CONFIG[spot.category]
          : null
        const hasCategoryLabel = categoryConfig
          ? content.includes(categoryConfig.label)
          : true // 카테고리가 없으면 통과

        return hasName && hasCategoryLabel
      }),
      { numRuns: 100 }
    )
  })

  test('Property 5: 카테고리가 없는 스팟 카드에도 이름이 포함된다', () => {
    fc.assert(
      fc.property(spotPinWithoutCategoryArb, (spot: SpotPin) => {
        cleanup()

        const { container } = render(<SpotCard spot={spot} />)
        const content = container.textContent || ''

        // 카테고리가 없어도 스팟 이름은 반드시 포함되어야 한다
        return content.includes(spot.name)
      }),
      { numRuns: 100 }
    )
  })
})
