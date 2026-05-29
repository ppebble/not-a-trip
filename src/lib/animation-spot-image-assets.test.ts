import fs from 'fs'
import path from 'path'

import { ANIMATION_SPOT_IMAGE_ASSETS } from './animation-spot-image-assets'
import {
  isExternalHotlinkUrl,
  validateLicensedImageMetadata,
} from './real-image-data'

describe('ANIMATION_SPOT_IMAGE_ASSETS', () => {
  it('curates locally owned real photos for animation pilgrimage spots', () => {
    expect(ANIMATION_SPOT_IMAGE_ASSETS.length).toBeGreaterThanOrEqual(10)

    for (const asset of ANIMATION_SPOT_IMAGE_ASSETS) {
      expect(asset.spotId).toMatch(/^REAL-ANI-\d{3}$/)
      expect(asset.ownedUrl).toMatch(/^\/images\/spots\/animation\/.+\.webp$/)
      expect(isExternalHotlinkUrl(asset.ownedUrl)).toBe(false)
      expect(asset.source.sourcePageUrl).toMatch(
        /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/
      )
      expect(validateLicensedImageMetadata(asset.source)).toEqual([])

      const publicPath = path.join(
        process.cwd(),
        'public',
        asset.ownedUrl.replace(/^\//, '')
      )
      expect(fs.existsSync(publicPath)).toBe(true)
    }
  })
})
