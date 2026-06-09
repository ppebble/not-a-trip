import { validateEnv } from './env-check'

describe('validateEnv', () => {
  const validEnv = {
    MONGODB_URI: 'mongodb://localhost:27017/not-a-trip',
    AUTH_URL: 'https://notatrip.example.com',
    AUTH_SECRET: 'super-secret-value-123',
    NEXT_PUBLIC_BASE_URL: 'https://notatrip.example.com',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-1234567890',
  }

  test('passes with valid core production configuration', () => {
    const result = validateEnv(validEnv, { mode: 'production' })

    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('fails when AUTH_URL is not https in production', () => {
    const result = validateEnv(
      {
        ...validEnv,
        AUTH_URL: 'http://notatrip.example.com',
      },
      { mode: 'production' }
    )

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'AUTH_URL',
        }),
      ])
    )
  })

  test('fails when AUTH_SECRET is a placeholder or too short', () => {
    const result = validateEnv(
      {
        ...validEnv,
        AUTH_SECRET: 'your-secret-key-here',
      },
      { mode: 'production' }
    )

    expect(result.ok).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'AUTH_SECRET',
        }),
      ])
    )
  })

  test('warns when an OAuth provider is partially configured', () => {
    const result = validateEnv(
      {
        ...validEnv,
        GOOGLE_CLIENT_ID: 'google-id',
        GOOGLE_CLIENT_SECRET: undefined,
      },
      { mode: 'production' }
    )

    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET',
        }),
      ])
    )
  })

  test('warns when Sentry is partially configured', () => {
    const result = validateEnv(
      {
        ...validEnv,
        NEXT_PUBLIC_SENTRY_DSN: 'https://dsn.example.com/1',
        SENTRY_PROJECT: 'not-a-trip',
      },
      { mode: 'production' }
    )

    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'SENTRY_*',
        }),
      ])
    )
  })

  test('warns when suspicious NEXT_PUBLIC secrets are exposed', () => {
    const result = validateEnv(
      {
        ...validEnv,
        NEXT_PUBLIC_INTERNAL_SECRET: 'should-not-be-public',
      },
      { mode: 'production' }
    )

    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'NEXT_PUBLIC_INTERNAL_SECRET',
        }),
      ])
    )
  })
})
