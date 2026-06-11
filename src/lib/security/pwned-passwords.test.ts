import {
  COMPROMISED_PASSWORD_ERROR,
  checkPwnedPassword,
  getPwnedPasswordHashParts,
  validateNewPasswordSecurity,
} from './pwned-passwords'

describe('pwned password checks', () => {
  test('blocks obvious locally compromised passwords without a network request', async () => {
    const fetcher = jest.fn()

    const result = await checkPwnedPassword('password123', {
      fetcher: fetcher as unknown as typeof fetch,
    })

    expect(result).toEqual({
      compromised: true,
      count: 1,
      source: 'local',
    })
    expect(fetcher).not.toHaveBeenCalled()
  })

  test('uses k-anonymity range lookup without sending the full hash suffix', async () => {
    const password = 'correct horse battery staple 2026!'
    const { prefix, suffix } = getPwnedPasswordHashParts(password)
    const fetcher = jest.fn(async (url: string) => {
      expect(url).toBe(`https://api.pwnedpasswords.com/range/${prefix}`)
      expect(url).not.toContain(suffix)

      return new Response(
        `${suffix}:42\r\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA:1`
      )
    })

    const result = await checkPwnedPassword(password, {
      fetcher: fetcher as unknown as typeof fetch,
    })

    expect(result).toEqual({
      compromised: true,
      count: 42,
      source: 'pwned-passwords',
    })
  })

  test('passes when the range response does not contain the hash suffix', async () => {
    const fetcher = jest.fn(async () => new Response('ABCDEF:1\r\n123456:2'))

    const result = await checkPwnedPassword('not in the sample response', {
      fetcher: fetcher as unknown as typeof fetch,
    })

    expect(result).toEqual({
      compromised: false,
      count: 0,
      source: 'pwned-passwords',
    })
  })

  test('returns a user-safe validation error for compromised passwords', async () => {
    const result = await validateNewPasswordSecurity('123456')

    expect(result).toEqual({
      ok: false,
      error: COMPROMISED_PASSWORD_ERROR,
      status: 400,
    })
  })

  test('can run in strict mode when the breach service is unavailable', async () => {
    const result = await validateNewPasswordSecurity('network outage sample', {
      env: {
        NODE_ENV: 'test',
        PWNED_PASSWORD_CHECK_STRICT: 'true',
      },
      fetcher: jest.fn(async () => {
        throw new Error('network unavailable')
      }) as unknown as typeof fetch,
    })

    expect(result).toEqual({
      ok: false,
      error:
        '비밀번호 유출 여부를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.',
      status: 503,
    })
  })
})
