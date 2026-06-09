/**
 * @jest-environment jsdom
 */
/* eslint-disable no-console */

import { isPlaceholderPhoto } from '@/app/api/spots/showcase/helpers'
import type { ShowcaseSpotItem } from '@/app/api/spots/showcase/route'
import type { SpotCategory } from '@/types/spot'

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    SPOT_CONTENT_RELATIONS: 'spot_content_relations',
    CHECKINS: 'checkins',
  },
  getCollection: jest.fn(),
}))

jest.mock('@/lib/runtime-logger', () => ({
  runtimeLogger: {
    warn: (...args: unknown[]) => console.warn(...args),
    error: (...args: unknown[]) => console.error(...args),
  },
}))
const CATEGORIES: SpotCategory[] = [
  'animation',
  'sports',
  'movie_drama',
  'music',
  'game',
  'other',
]

function expectRealPhotoRecord(result: Record<SpotCategory, string[]>) {
  for (const category of CATEGORIES) {
    expect(Array.isArray(result[category])).toBe(true)
  }
  const urls = Object.values(result).flat()
  expect(urls.length).toBeGreaterThan(0)
  expect(urls.every((url) => !isPlaceholderPhoto(url))).toBe(true)
}

describe('fetchProofImages', () => {
  const originalFetch = global.fetch
  const originalConsoleWarn = console.warn

  beforeEach(() => {
    jest.resetModules()
    console.warn = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    console.warn = originalConsoleWarn
    delete process.env.AUTH_URL
    delete process.env.NEXTAUTH_URL
  })

  test('transforms API photos and fills missing categories with real static fallbacks', async () => {
    const mockSpots: ShowcaseSpotItem[] = [
      {
        id: 'spot-1',
        name: 'Spot 1',
        category: 'animation',
        thumbnailUrl: 'https://example.com/photo1.jpg',
      },
      {
        id: 'spot-2',
        name: 'Spot 2',
        category: 'sports',
        thumbnailUrl: 'https://example.com/photo2.jpg',
      },
      {
        id: 'spot-3',
        name: 'Spot 3',
        category: 'animation',
        thumbnailUrl: 'https://example.com/photo3.jpg',
      },
    ]

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockSpots,
    } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    const result = await fetchProofImages()

    expect(result.animation).toEqual([
      'https://example.com/photo1.jpg',
      'https://example.com/photo3.jpg',
    ])
    expect(result.sports).toEqual(['https://example.com/photo2.jpg'])
    expectRealPhotoRecord(result)
  })

  test('returns real static fallbacks and warns when API returns non-2xx', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: false, status: 500 } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    const result = await fetchProofImages()

    expectRealPhotoRecord(result)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[fetchProofImages]'),
      expect.any(Error)
    )
  })

  test('returns real static fallbacks and warns on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    const result = await fetchProofImages()

    expectRealPhotoRecord(result)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[fetchProofImages]'),
      expect.any(Error)
    )
  })

  test('uses AUTH_URL when available', async () => {
    process.env.AUTH_URL = 'https://not-a-trip.vercel.app'
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    await fetchProofImages()

    expect(global.fetch).toHaveBeenCalledWith(
      'https://not-a-trip.vercel.app/api/spots/showcase',
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
  })

  test('falls back to legacy NEXTAUTH_URL when AUTH_URL is absent', async () => {
    delete process.env.AUTH_URL
    process.env.NEXTAUTH_URL = 'https://legacy.not-a-trip.vercel.app'
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    await fetchProofImages()

    expect(global.fetch).toHaveBeenCalledWith(
      'https://legacy.not-a-trip.vercel.app/api/spots/showcase',
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
  })

  test('uses localhost base URL when AUTH_URL is absent', async () => {
    delete process.env.AUTH_URL
    delete process.env.NEXTAUTH_URL
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => [] } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    await fetchProofImages()

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/spots/showcase',
      expect.objectContaining({ next: { revalidate: 3600 } })
    )
  })

  test('filters placeholders from API response before applying fallback', async () => {
    const mockSpots: ShowcaseSpotItem[] = [
      {
        id: 'spot-1',
        name: 'Spot 1',
        category: 'animation',
        thumbnailUrl: 'https://picsum.photos/seed/test/400/300',
      },
      {
        id: 'spot-2',
        name: 'Spot 2',
        category: 'animation',
        thumbnailUrl: 'https://example.com/real-photo.jpg',
      },
      {
        id: 'spot-3',
        name: 'Spot 3',
        category: 'sports',
        thumbnailUrl: '/icons/categories/sports.webp',
      },
    ]

    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => mockSpots } as Response)

    const { fetchProofImages } = await import('../fetchShowcaseSpots')
    const result = await fetchProofImages()

    expect(result.animation).toEqual(['https://example.com/real-photo.jpg'])
    expect(result.sports.length).toBeGreaterThan(0)
    expect(result.sports.every((url) => !isPlaceholderPhoto(url))).toBe(true)
  })
})
