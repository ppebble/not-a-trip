import { isExternalHotlinkUrl } from '@/lib/real-image-data'
import { REAL_SPOT_PHOTO_FALLBACKS } from '../realSpotPhotoFallbacks'

describe('REAL_SPOT_PHOTO_FALLBACKS', () => {
  it('does not expose external hotlink URLs as production render fallbacks', () => {
    for (const fallback of Object.values(REAL_SPOT_PHOTO_FALLBACKS)) {
      expect(isExternalHotlinkUrl(fallback.imageUrl)).toBe(false)
      expect(fallback.imageUrl).toMatch(
        /^\/images\/(?:showcase|spots\/animation)\//
      )
    }
  })

  it('uses locally owned real animation spot photos when curated assets exist', () => {
    expect(REAL_SPOT_PHOTO_FALLBACKS['REAL-ANI-001']?.imageUrl).toBe(
      '/images/spots/animation/real-ani-001-suga-shrine.webp'
    )
    expect(REAL_SPOT_PHOTO_FALLBACKS['REAL-ANI-009']?.imageUrl).toBe(
      '/images/spots/animation/real-ani-009-enoshima.webp'
    )
  })

  it('preserves source attribution metadata separately from render URLs', () => {
    for (const fallback of Object.values(REAL_SPOT_PHOTO_FALLBACKS)) {
      expect(fallback.sourcePageUrl).toMatch(/^https:\/\//)
      expect(fallback.license.length).toBeGreaterThan(0)
    }
  })
})
