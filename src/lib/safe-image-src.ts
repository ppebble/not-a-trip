export const FALLBACK_IMAGE_SRC = '/icons/categories/other.webp'

const DISALLOWED_PLACEHOLDER_PATTERNS = [
  'picsum.photos/seed/',
  'via.placeholder.com',
]

export function isDisallowedPlaceholderImageSrc(
  src: string | null | undefined
): boolean {
  if (!src) return true

  const normalized = src.trim()
  if (!normalized) return true

  return (
    normalized.startsWith('data:image/svg+xml') ||
    DISALLOWED_PLACEHOLDER_PATTERNS.some((pattern) =>
      normalized.includes(pattern)
    )
  )
}

export function getSafeImageSrc(
  src: string | null | undefined,
  fallbackSrc = FALLBACK_IMAGE_SRC
): string {
  return isDisallowedPlaceholderImageSrc(src) ? fallbackSrc : src!.trim()
}

export function isRemoteImageSrc(src: string | null | undefined): boolean {
  if (!src) return false

  const normalized = src.trim().toLowerCase()
  return normalized.startsWith('http://') || normalized.startsWith('https://')
}
