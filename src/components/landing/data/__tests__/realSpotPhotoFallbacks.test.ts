import { isExternalHotlinkUrl } from '@/lib/real-image-data'
import { REAL_SPOT_PHOTO_FALLBACKS } from '../realSpotPhotoFallbacks'

describe('REAL_SPOT_PHOTO_FALLBACKS', () => {
  it('does not expose external hotlink URLs as production render fallbacks', () => {
    for (const fallback of Object.values(REAL_SPOT_PHOTO_FALLBACKS)) {
      expect(isExternalHotlinkUrl(fallback.imageUrl)).toBe(false)
      expect(fallback.imageUrl).toMatch(/^\/images\/showcase\//)
    }
  })

  it('preserves source attribution metadata separately from render URLs', () => {
    for (const fallback of Object.values(REAL_SPOT_PHOTO_FALLBACKS)) {
      expect(fallback.sourcePageUrl).toMatch(/^https:\/\//)
      expect(fallback.license.length).toBeGreaterThan(0)
    }
  })
})
