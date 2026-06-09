import { REAL_SPOT_PHOTO_FALLBACKS } from '@/components/landing/data/realSpotPhotoFallbacks'
import { isExternalHotlinkUrl } from '@/lib/real-image-data'

const PUBLIC_IMAGE_PREFIXES = ['/uploads/', '/images/']
const IMAGE_FILE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|webp)$/i

export function isPlaceholderPhoto(photo: string | undefined | null): boolean {
  if (!photo) return true

  const normalized = photo.trim()
  if (!normalized) return true

  return (
    normalized.includes('picsum.photos/seed/') ||
    isExternalHotlinkUrl(normalized) ||
    normalized.startsWith('/icons/') ||
    normalized.includes('/uploads/contents/covers/') ||
    normalized.includes('placeholder') ||
    normalized.includes('dummy') ||
    normalized.startsWith('data:image/svg+xml')
  )
}

function getControlledFallback(spotId: string): string | null {
  return REAL_SPOT_PHOTO_FALLBACKS[spotId]?.imageUrl ?? null
}

function isRemotePhoto(photo: string): boolean {
  return photo.startsWith('http://') || photo.startsWith('https://')
}

function isPublicImagePath(photo: string): boolean {
  return PUBLIC_IMAGE_PREFIXES.some((prefix) => photo.startsWith(prefix))
}

function resolveBareUploadFileName(photo: string): string | null {
  if (photo.includes('/') || photo.includes('\\')) return null
  if (!IMAGE_FILE_EXTENSION_PATTERN.test(photo)) return null
  return `/uploads/${encodeURIComponent(photo)}`
}

export function resolveThumbnailUrl(
  spotId: string,
  photo: string | undefined | null
): string | null {
  if (!photo) {
    return getControlledFallback(spotId)
  }

  const normalized = photo.trim()
  if (isPlaceholderPhoto(normalized)) {
    return getControlledFallback(spotId)
  }

  if (isRemotePhoto(normalized) || isPublicImagePath(normalized)) {
    return normalized
  }

  return resolveBareUploadFileName(normalized) ?? getControlledFallback(spotId)
}
