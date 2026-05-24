import { writeSecurityLog } from './security-log'

const TAG_REGEX = /<[^>]+>/g
const SCRIPT_REGEX = /<script[\s\S]*?>[\s\S]*?<\/script>/gi
const JAVASCRIPT_PROTOCOL_REGEX = /^\s*javascript:/i

function stripHtml(input: string): string {
  return input.replace(SCRIPT_REGEX, '').replace(TAG_REGEX, '')
}

function sanitizeMongoOperators(input: string): string {
  return input.replace(/\$(?=[A-Za-z_])/g, '＄').replace(/\.\$/g, '.＄')
}

export function sanitizePlainText(input: string | undefined | null): string {
  if (!input) return ''

  return sanitizeMongoOperators(stripHtml(input)).trim()
}

export function sanitizeOptionalPlainText(
  input: string | undefined | null
): string | undefined {
  const sanitized = sanitizePlainText(input)
  return sanitized.length > 0 ? sanitized : undefined
}

export function sanitizeUrl(input: string | undefined | null): string {
  if (!input) return ''

  const trimmed = input.trim()
  if (JAVASCRIPT_PROTOCOL_REGEX.test(trimmed)) {
    return ''
  }

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return ''
    }
    return trimmed
  } catch {
    return ''
  }
}

export async function logIfSanitized(params: {
  label: string
  before: string | undefined | null
  after: string | undefined | null
  userId?: string
  ip?: string
}): Promise<void> {
  const before = params.before ?? ''
  const after = params.after ?? ''

  if (before === after) {
    return
  }

  await writeSecurityLog({
    type: 'input_sanitized',
    severity: 'warning',
    userId: params.userId,
    ip: params.ip,
    details: {
      label: params.label,
      before,
      after,
    },
  })
}
