import { buildFacilityGoogleMapsSearchUrl } from '@/lib/facility-map-url'

describe('buildFacilityGoogleMapsSearchUrl', () => {
  it('includes facility name, full address, and coordinates to disambiguate chain stores', () => {
    const url = buildFacilityGoogleMapsSearchUrl({
      name: 'ドトールコーヒー',
      address: '日本、東京都新宿区四谷三丁目7番地',
      coordinates: [35.6878, 139.7171],
    })

    const decoded = decodeURIComponent(url)

    expect(decoded).toContain('ドトールコーヒー')
    expect(decoded).toContain('日本、東京都新宿区四谷三丁目7番地')
    expect(decoded).toContain('35.6878,139.7171')
  })

  it('does not include placeholder unavailable address text', () => {
    const url = buildFacilityGoogleMapsSearchUrl({
      name: 'FamilyMart',
      address: 'OpenStreetMap address unavailable',
      coordinates: [35.331423, 136.948819],
    })

    const decoded = decodeURIComponent(url)

    expect(decoded).toContain('FamilyMart')
    expect(decoded).toContain('35.331423,136.948819')
    expect(decoded).not.toContain('OpenStreetMap address unavailable')
  })
})
