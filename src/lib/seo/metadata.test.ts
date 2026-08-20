import {
  PRODUCTION_BASE_URL,
  generateRouteMetadata,
  generateSpotMetadata,
  getBaseUrl,
  getCanonicalUrl,
} from './metadata'

describe('SEO metadata helpers', () => {
  const originalNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalNodeEnv,
      configurable: true,
      writable: true,
    })
  })

  it('keeps localhost only outside production', () => {
    expect(
      getBaseUrl({
        NODE_ENV: 'development',
        NEXT_PUBLIC_BASE_URL: 'http://localhost:3000/',
      } as NodeJS.ProcessEnv)
    ).toBe('http://localhost:3000')
  })

  it('blocks localhost canonical origins in production', () => {
    expect(
      getBaseUrl({
        NODE_ENV: 'production',
        NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
      } as NodeJS.ProcessEnv)
    ).toBe(PRODUCTION_BASE_URL)
  })

  it('keeps the custom domain even when Vercel exposes a default production hostname', () => {
    expect(
      getBaseUrl({
        NODE_ENV: 'production',
        NEXT_PUBLIC_BASE_URL: 'http://localhost:3000',
        VERCEL_PROJECT_PRODUCTION_URL: 'not-a-trip.vercel.app',
      } as NodeJS.ProcessEnv)
    ).toBe(PRODUCTION_BASE_URL)
  })

  it('builds stable canonical URLs from paths', () => {
    expect(
      getCanonicalUrl('/routes/ROUTE-109', {
        NODE_ENV: 'production',
        NEXT_PUBLIC_BASE_URL: PRODUCTION_BASE_URL,
      } as NodeJS.ProcessEnv)
    ).toBe(`${PRODUCTION_BASE_URL}/routes/ROUTE-109`)
  })

  it('lets Next title templates add the site name once for dynamic pages', () => {
    const spotMetadata = generateSpotMetadata({
      id: 'REAL-ANI-017',
      name: '가부키초',
      description: '은혼 배경지',
      address: '도쿄 신주쿠',
      photos: [],
      coordinates: { lat: 35.695, lng: 139.703 },
    })
    const routeMetadata = generateRouteMetadata({
      id: 'ROUTE-109',
      name: '우지 유포니엄 코스',
      description: '우지 핵심 순례 코스입니다.',
      spots: [{ spotName: '우지교' }],
    })

    expect(spotMetadata.title).toBe('가부키초')
    expect(routeMetadata.title).toBe('우지 유포니엄 코스')
  })
})
