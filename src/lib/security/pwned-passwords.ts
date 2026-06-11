import { createHash } from 'crypto'
import { runtimeLogger } from '@/lib/runtime-logger'

export const COMPROMISED_PASSWORD_ERROR =
  '이 비밀번호는 알려진 정보 유출 데이터에 포함되어 있어 사용할 수 없습니다. 다른 비밀번호를 사용해주세요.'

export const PASSWORD_BREACH_CHECK_UNAVAILABLE_ERROR =
  '비밀번호 유출 여부를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.'

const PWNED_PASSWORDS_RANGE_ENDPOINT = 'https://api.pwnedpasswords.com/range'
const DEFAULT_TIMEOUT_MS = 2500

const COMMON_COMPROMISED_PASSWORDS = new Set(
  [
    '000000',
    '111111',
    '123123',
    '123456',
    '1234567',
    '12345678',
    '123456789',
    '1234567890',
    'admin',
    'admin123',
    'iloveyou',
    'letmein',
    'password',
    'password1',
    'password123',
    'qwerty',
    'qwerty123',
    'test123',
    'welcome',
    'welcome1',
  ].map((value) => value.toLowerCase())
)

export interface PwnedPasswordCheckResult {
  compromised: boolean
  count: number
  source: 'local' | 'pwned-passwords' | 'disabled' | 'unavailable'
}

export interface PwnedPasswordCheckOptions {
  fetcher?: typeof fetch
  timeoutMs?: number
  env?: NodeJS.ProcessEnv
}

function sha1Upper(value: string): string {
  return createHash('sha1').update(value, 'utf8').digest('hex').toUpperCase()
}

export function getPwnedPasswordHashParts(password: string): {
  prefix: string
  suffix: string
} {
  const hash = sha1Upper(password)
  return {
    prefix: hash.slice(0, 5),
    suffix: hash.slice(5),
  }
}

function isLocalCommonCompromisedPassword(password: string): boolean {
  return COMMON_COMPROMISED_PASSWORDS.has(password.trim().toLowerCase())
}

function isCheckDisabled(env: NodeJS.ProcessEnv): boolean {
  return ['0', 'false', 'off', 'disabled'].includes(
    String(env.PWNED_PASSWORD_CHECK ?? '')
      .trim()
      .toLowerCase()
  )
}

function isStrictMode(env: NodeJS.ProcessEnv): boolean {
  return ['1', 'true', 'strict'].includes(
    String(env.PWNED_PASSWORD_CHECK_STRICT ?? '')
      .trim()
      .toLowerCase()
  )
}

async function fetchRangeWithTimeout(
  url: string,
  fetcher: typeof fetch,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetcher(url, {
      headers: {
        'Add-Padding': 'true',
        'User-Agent': 'not-a-trip-password-safety',
      },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function checkPwnedPassword(
  password: string,
  options: PwnedPasswordCheckOptions = {}
): Promise<PwnedPasswordCheckResult> {
  const env = options.env ?? process.env

  if (isLocalCommonCompromisedPassword(password)) {
    return {
      compromised: true,
      count: 1,
      source: 'local',
    }
  }

  if (isCheckDisabled(env)) {
    return {
      compromised: false,
      count: 0,
      source: 'disabled',
    }
  }

  const { prefix, suffix } = getPwnedPasswordHashParts(password)
  const fetcher = options.fetcher ?? fetch
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  try {
    const response = await fetchRangeWithTimeout(
      `${PWNED_PASSWORDS_RANGE_ENDPOINT}/${prefix}`,
      fetcher,
      timeoutMs
    )

    if (!response.ok) {
      throw new Error(`Pwned Passwords responded with ${response.status}`)
    }

    const rows = (await response.text()).split(/\r?\n/)
    const match = rows
      .map((row) => row.trim())
      .find((row) => row.toUpperCase().startsWith(`${suffix}:`))

    if (!match) {
      return {
        compromised: false,
        count: 0,
        source: 'pwned-passwords',
      }
    }

    const count = Number(match.split(':')[1] ?? 0)

    return {
      compromised: true,
      count: Number.isFinite(count) ? count : 1,
      source: 'pwned-passwords',
    }
  } catch (error) {
    runtimeLogger.warn('[Security] Pwned password check unavailable', error)

    return {
      compromised: false,
      count: 0,
      source: 'unavailable',
    }
  }
}

export async function validateNewPasswordSecurity(
  password: string,
  options: PwnedPasswordCheckOptions = {}
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const result = await checkPwnedPassword(password, options)

  if (result.compromised) {
    return {
      ok: false,
      error: COMPROMISED_PASSWORD_ERROR,
      status: 400,
    }
  }

  if (
    result.source === 'unavailable' &&
    isStrictMode(options.env ?? process.env)
  ) {
    return {
      ok: false,
      error: PASSWORD_BREACH_CHECK_UNAVAILABLE_ERROR,
      status: 503,
    }
  }

  return { ok: true }
}
