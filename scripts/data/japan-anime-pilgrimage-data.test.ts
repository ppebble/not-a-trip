import catalog from './japan-anime-pilgrimage-2026.json'
import { JAPAN_ANIME_SPOT_ADDITIONS } from './japan-anime-spot-additions'
import { JAPAN_ANIME_SPOT_EXPANSION } from './japan-anime-spot-expansion'
import { JAPAN_ANIME_FACILITY_EXPANSION } from './japan-anime-facility-expansion'
import { ANIMATION_SPOTS, APPROVED_ANIMATION_SPOTS } from '../seed-real-spots'
import { ANIMATION_SPOT_IMAGE_ASSET_BY_ID } from '../../src/lib/animation-spot-image-assets'

describe('2026 Japan anime pilgrimage catalog', () => {
  it('preserves the complete official work and facility selection', () => {
    expect(catalog.edition).toBe(2026)
    expect(catalog.counts).toEqual({
      works: 146,
      facilities: 29,
      total: 175,
      newSelections: 34,
    })
    expect(catalog.selections).toHaveLength(175)
    expect(catalog.selections.map((selection) => selection.index)).toEqual(
      Array.from({ length: 175 }, (_, index) => index + 1)
    )
    expect(
      catalog.selections.filter(({ kind }) => kind === 'work')
    ).toHaveLength(146)
    expect(
      catalog.selections.filter(({ kind }) => kind === 'facility')
    ).toHaveLength(29)
  })

  it('keeps every catalog row attributable to the official publisher', () => {
    expect(catalog.source.publisher).toBe('Anime Tourism Association')
    expect(catalog.source.url).toMatch(/^https:\/\/animetourism88\.com\//)
    expect(catalog.selections.every(({ name, region }) => name && region)).toBe(
      true
    )
  })
})

describe('Japan anime pilgrimage spot additions', () => {
  it('fills the contiguous REAL-ANI-030 through REAL-ANI-063 range', () => {
    expect(JAPAN_ANIME_SPOT_ADDITIONS.map(({ id }) => id)).toEqual(
      Array.from(
        { length: 34 },
        (_, index) => `REAL-ANI-${String(index + 30).padStart(3, '0')}`
      )
    )
  })

  it('keeps exact-place records sourced and geographically inside Japan', () => {
    for (const spot of [
      ...JAPAN_ANIME_SPOT_ADDITIONS,
      ...JAPAN_ANIME_SPOT_EXPANSION,
      ...JAPAN_ANIME_FACILITY_EXPANSION,
    ]) {
      expect(spot.category).toBe('animation')
      expect(spot.address).toMatch(/^일본 /)
      expect(spot.coordinates.lat).toBeGreaterThanOrEqual(24)
      expect(spot.coordinates.lat).toBeLessThanOrEqual(46)
      expect(spot.coordinates.lng).toBeGreaterThanOrEqual(122)
      expect(spot.coordinates.lng).toBeLessThanOrEqual(146)
      expect(spot.relatedContent.length).toBeGreaterThan(0)
      expect(spot.sourceUrls?.length).toBeGreaterThan(0)
      expect(
        spot.sourceUrls?.every(({ url }) => url.startsWith('https://'))
      ).toBe(true)
    }
  })

  it('keeps inference-only locations out of automatic approval', () => {
    const allAddedSpots = [
      ...JAPAN_ANIME_SPOT_ADDITIONS,
      ...JAPAN_ANIME_SPOT_EXPANSION,
      ...JAPAN_ANIME_FACILITY_EXPANSION,
    ]
    const reviewRequiredIds = [
      'REAL-ANI-033',
      'REAL-ANI-039',
      ...Array.from(
        { length: 10 },
        (_, index) => `REAL-ANI-${String(index + 54).padStart(3, '0')}`
      ),
      'REAL-ANI-077',
      'REAL-ANI-079',
      'REAL-ANI-085',
      'REAL-ANI-090',
      'REAL-ANI-091',
      'REAL-ANI-093',
    ]

    for (const id of reviewRequiredIds) {
      expect(allAddedSpots.find((spot) => spot.id === id)?.reviewStatus).toBe(
        'needs_review'
      )
      expect(
        APPROVED_ANIMATION_SPOTS.find((spot) => spot.id === id)?.reviewStatus
      ).toBe('needs_review')
    }
  })

  it('connects every owned REAL-ANI-030 through 093 asset to its seed spot', () => {
    for (let number = 30; number <= 93; number += 1) {
      const id = `REAL-ANI-${String(number).padStart(3, '0')}`
      const asset = ANIMATION_SPOT_IMAGE_ASSET_BY_ID[id]
      const spot = APPROVED_ANIMATION_SPOTS.find(
        (candidate) => candidate.id === id
      )

      expect(asset).toBeDefined()
      expect(spot).toBeDefined()
      expect(spot?.photos).toEqual([asset?.ownedUrl])
      expect(spot?.sourceUrls).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ url: asset?.source.sourcePageUrl }),
        ])
      )
    }
  })

  it('adds a contiguous 24-place facility and work-location expansion', () => {
    expect(JAPAN_ANIME_SPOT_EXPANSION.map(({ id }) => id)).toEqual(
      Array.from(
        { length: 24 },
        (_, index) => `REAL-ANI-${String(index + 64).padStart(3, '0')}`
      )
    )

    expect(
      JAPAN_ANIME_SPOT_EXPANSION.filter(
        ({ reviewStatus }) => reviewStatus === 'needs_review'
      ).map(({ id }) => id)
    ).toEqual(['REAL-ANI-077', 'REAL-ANI-079', 'REAL-ANI-085'])
  })

  it('adds six additional official facility and event anchors', () => {
    expect(JAPAN_ANIME_FACILITY_EXPANSION.map(({ id }) => id)).toEqual(
      Array.from(
        { length: 6 },
        (_, index) => `REAL-ANI-${String(index + 88).padStart(3, '0')}`
      )
    )
  })

  it('keeps all animation seed IDs unique', () => {
    const ids = ANIMATION_SPOTS.map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
