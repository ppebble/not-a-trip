const EXCLUDED_PAGE_PREFIXES = [
  '/admin',
  '/api',
  '/auth',
  '/monitoring',
  '/offline',
  '/_next',
]

export function normalizeTrackablePagePath(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return null
  }

  const pathname = value.split(/[?#]/, 1)[0]
  if (
    !pathname ||
    pathname.length > 300 ||
    /[\u0000-\u001f\u007f]/.test(pathname)
  ) {
    return null
  }

  const isExcluded = EXCLUDED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  return isExcluded ? null : pathname
}
