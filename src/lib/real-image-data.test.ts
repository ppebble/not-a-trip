import {
  classifyImageValidationAction,
  generateDerivativeFileName,
  getControlledFallbackImageForSpot,
  isExternalHotlinkUrl,
  validateLicensedImageMetadata,
  validateRealSpotData,
  type LicensedImage,
  type RealSpotData,
} from './real-image-data'

const baseLicensedImage: LicensedImage = {
  originalUrl: 'https://example.com/source.jpg',
  sourcePageUrl: 'https://example.com/source-page',
  author: 'Example Author',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  collectedAt: '2026-05-29T00:00:00.000Z',
  reviewStatus: 'needs_review',
  lastHttpStatus: 200,
}

const baseSpot: RealSpotData = {
  id: 'REAL-ANI-001',
  name: '스가 신사 계단',
  category: 'animation',
  coordinates: { lat: 35.68512, lng: 139.73049 },
  country: 'JP',
  region: 'Tokyo',
  address: 'Tokyo',
  description: 'Approved real spot fixture.',
  relatedContent: [{ name: '너의 이름은' }],
  sourceUrls: [
    {
      url: 'https://example.com/evidence',
      evidenceType: 'official',
      collectedAt: '2026-05-29T00:00:00.000Z',
    },
  ],
  photos: [],
  reviewStatus: 'approved',
}

describe('real image data validation', () => {
  it('accepts a complete approved spot with source evidence', () => {
    expect(validateRealSpotData(baseSpot)).toEqual([])
  })

  it('rejects approved spots without source evidence', () => {
    const issues = validateRealSpotData({ ...baseSpot, sourceUrls: [] })

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'spot.source-evidence.missing' }),
      ])
    )
  })

  it('rejects incompatible image licenses', () => {
    const issues = validateLicensedImageMetadata({
      ...baseLicensedImage,
      license: 'CC BY-NC 4.0',
    })

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'image.license.incompatible' }),
      ])
    )
  })

  it('rejects broken or rate-limited source statuses', () => {
    for (const status of [404, 410, 429, 500]) {
      const issues = validateLicensedImageMetadata({
        ...baseLicensedImage,
        lastHttpStatus: status,
      })

      expect(issues.length).toBeGreaterThan(0)
    }
  })

  it('detects uncontrolled external hotlink domains', () => {
    expect(
      isExternalHotlinkUrl(
        'https://upload.wikimedia.org/wikipedia/commons/test.jpg'
      )
    ).toBe(true)
    expect(
      isExternalHotlinkUrl('https://commons.wikimedia.org/wiki/File:X')
    ).toBe(true)
    expect(isExternalHotlinkUrl('https://example.com/photo.webp')).toBe(false)
  })

  it('returns controlled local fallback images by spot prefix', () => {
    expect(getControlledFallbackImageForSpot('REAL-ANI-001')).toBe(
      '/images/spots/animation/real-ani-001-suga-shrine.webp'
    )
    expect(getControlledFallbackImageForSpot('REAL-SPO-002')).toBe(
      '/images/showcase/camp-nou.webp'
    )
    expect(getControlledFallbackImageForSpot('UNKNOWN')).toBe(
      '/images/showcase/petra.webp'
    )
  })

  it('generates derivative filenames with variant and content hash', () => {
    expect(
      generateDerivativeFileName('REAL ANI 001', 'card', 'ABCDEF123456789')
    ).toBe('real-ani-001-card-abcdef123456.webp')
  })

  it('classifies monitoring actions by HTTP status', () => {
    expect(classifyImageValidationAction(200)).toBe('none')
    expect(classifyImageValidationAction(404)).toBe('replace')
    expect(classifyImageValidationAction(410)).toBe('replace')
    expect(classifyImageValidationAction(429)).toBe('retry later')
    expect(classifyImageValidationAction(503)).toBe(
      'investigate storage credentials'
    )
  })
})
