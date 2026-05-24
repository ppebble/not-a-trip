export interface EnvIssue {
  key: string
  message: string
  severity: 'error' | 'warning'
}

export interface EnvCheckResult {
  ok: boolean
  errors: EnvIssue[]
  warnings: EnvIssue[]
}

export interface ValidateEnvOptions {
  mode?: 'development' | 'production' | 'test'
}

const PLACEHOLDER_VALUES = new Set([
  '',
  'your-secret-key-here',
  'your-google-client-id',
  'your-google-client-secret',
  'your-kakao-client-id',
  'your-kakao-client-secret',
  'your-naver-client-id',
  'your-naver-client-secret',
  'your-twitter-client-id',
  'your-twitter-client-secret',
  'your-google-maps-api-key',
])

const OAUTH_PROVIDER_GROUPS = [
  {
    name: 'Google OAuth',
    idKey: 'GOOGLE_CLIENT_ID',
    secretKey: 'GOOGLE_CLIENT_SECRET',
  },
  {
    name: 'Kakao OAuth',
    idKey: 'KAKAO_CLIENT_ID',
    secretKey: 'KAKAO_CLIENT_SECRET',
  },
  {
    name: 'Naver OAuth',
    idKey: 'NAVER_CLIENT_ID',
    secretKey: 'NAVER_CLIENT_SECRET',
  },
  {
    name: 'Twitter OAuth',
    idKey: 'TWITTER_CLIENT_ID',
    secretKey: 'TWITTER_CLIENT_SECRET',
  },
] as const

function hasMeaningfulValue(value: string | undefined): boolean {
  return Boolean(value && !PLACEHOLDER_VALUES.has(value.trim()))
}

function isValidMongoUri(value: string): boolean {
  return /^mongodb(\+srv)?:\/\//.test(value)
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isSuspiciousPublicKey(key: string): boolean {
  if (!key.startsWith('NEXT_PUBLIC_')) return false

  const upper = key.toUpperCase()
  if (upper.includes('GA_MEASUREMENT_ID')) return false
  if (upper.includes('GOOGLE_MAPS_API_KEY')) return false
  if (upper.endsWith('BASE_URL')) return false

  return (
    upper.includes('SECRET') ||
    upper.includes('TOKEN') ||
    upper.includes('PASSWORD') ||
    upper.includes('PRIVATE') ||
    upper.includes('ACCESS_KEY')
  )
}

export function validateEnv(
  env: Record<string, string | undefined>,
  options: ValidateEnvOptions = {}
): EnvCheckResult {
  const mode = options.mode || 'development'
  const errors: EnvIssue[] = []
  const warnings: EnvIssue[] = []

  const push = (
    severity: 'error' | 'warning',
    key: string,
    message: string
  ) => {
    const issue = { severity, key, message }
    if (severity === 'error') {
      errors.push(issue)
      return
    }
    warnings.push(issue)
  }

  const mongodbUri = env.MONGODB_URI?.trim()
  if (!mongodbUri) {
    push('error', 'MONGODB_URI', 'MONGODB_URI is required.')
  } else if (!isValidMongoUri(mongodbUri)) {
    push(
      'error',
      'MONGODB_URI',
      'MONGODB_URI must start with mongodb:// or mongodb+srv://.'
    )
  }

  const nextAuthUrl = env.NEXTAUTH_URL?.trim()
  if (!nextAuthUrl) {
    push('error', 'NEXTAUTH_URL', 'NEXTAUTH_URL is required.')
  } else if (!isValidHttpUrl(nextAuthUrl)) {
    push(
      'error',
      'NEXTAUTH_URL',
      'NEXTAUTH_URL must be a valid http:// or https:// URL.'
    )
  } else if (mode === 'production' && !nextAuthUrl.startsWith('https://')) {
    push(
      'error',
      'NEXTAUTH_URL',
      'NEXTAUTH_URL must use https:// in production.'
    )
  }

  const nextAuthSecret = env.NEXTAUTH_SECRET?.trim()
  if (!nextAuthSecret) {
    push('error', 'NEXTAUTH_SECRET', 'NEXTAUTH_SECRET is required.')
  } else if (
    PLACEHOLDER_VALUES.has(nextAuthSecret) ||
    nextAuthSecret.length < 16
  ) {
    push(
      'error',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_SECRET must not be a placeholder and must be at least 16 characters long.'
    )
  }

  const baseUrl = env.NEXT_PUBLIC_BASE_URL?.trim()
  if (!baseUrl) {
    push(
      'warning',
      'NEXT_PUBLIC_BASE_URL',
      'NEXT_PUBLIC_BASE_URL is missing; SEO/share URLs may be incorrect.'
    )
  } else if (!isValidHttpUrl(baseUrl)) {
    push(
      'warning',
      'NEXT_PUBLIC_BASE_URL',
      'NEXT_PUBLIC_BASE_URL should be a valid http:// or https:// URL.'
    )
  } else if (mode === 'production' && !baseUrl.startsWith('https://')) {
    push(
      'warning',
      'NEXT_PUBLIC_BASE_URL',
      'NEXT_PUBLIC_BASE_URL should use https:// in production.'
    )
  }

  for (const provider of OAUTH_PROVIDER_GROUPS) {
    const hasId = hasMeaningfulValue(env[provider.idKey])
    const hasSecret = hasMeaningfulValue(env[provider.secretKey])

    if (hasId !== hasSecret) {
      push(
        'warning',
        `${provider.idKey}/${provider.secretKey}`,
        `${provider.name} is partially configured and should be completed or disabled.`
      )
    } else if (!hasId && !hasSecret) {
      push(
        'warning',
        `${provider.idKey}/${provider.secretKey}`,
        `${provider.name} is not configured; that provider login will stay disabled.`
      )
    }
  }

  const sentryKeys = [
    'NEXT_PUBLIC_SENTRY_DSN',
    'SENTRY_AUTH_TOKEN',
    'SENTRY_ORG',
    'SENTRY_PROJECT',
  ] as const
  const hasAnySentry = sentryKeys.some((key) => hasMeaningfulValue(env[key]))
  const hasAllSentry = sentryKeys.every((key) => hasMeaningfulValue(env[key]))

  if (hasAnySentry && !hasAllSentry) {
    push(
      'warning',
      'SENTRY_*',
      'Sentry is partially configured; DSN/auth/org/project should be set together for release monitoring.'
    )
  }

  for (const key of Object.keys(env)) {
    if (isSuspiciousPublicKey(key)) {
      push(
        'warning',
        key,
        `${key} is public at build/runtime. Verify that it does not expose a secret value.`
      )
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  }
}
