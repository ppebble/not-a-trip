import { generateContentMetadata, getBaseUrl } from './metadata'

describe('SEO metadata helpers', () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const originalNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl
    ;(process.env as Record<string, string | undefined>).NODE_ENV =
      originalNodeEnv
  })

  it('normalizes the configured base URL and builds canonical content metadata', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://not-a-trip.example/'

    expect(getBaseUrl()).toBe('https://not-a-trip.example')
    expect(generateContentMetadata('작품명', '/contents/작품명')).toMatchObject(
      {
        alternates: { canonical: 'https://not-a-trip.example/contents/작품명' },
      }
    )
  })

  it('fails closed when the production base URL is missing', () => {
    delete process.env.NEXT_PUBLIC_BASE_URL
    ;(process.env as Record<string, string | undefined>).NODE_ENV = 'production'

    expect(() => getBaseUrl()).toThrow('NEXT_PUBLIC_BASE_URL is required')
  })
})
