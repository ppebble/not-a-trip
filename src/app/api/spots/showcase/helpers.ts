import { REAL_SPOT_PHOTO_FALLBACKS } from '@/components/landing/data/realSpotPhotoFallbacks'
import { isExternalHotlinkUrl } from '@/lib/real-image-data'

export function isPlaceholderPhoto(photo: string | undefined | null): boolean {
  if (!photo) return true

  return (
    photo.includes('picsum.photos/seed/') ||
    isExternalHotlinkUrl(photo) ||
    photo.startsWith('/icons/') ||
    photo.startsWith('data:image/svg+xml')
  )
}

export function resolveThumbnailUrl(
  spotId: string,
  photo: string | undefined | null
): string | null {
  if (!photo) {
    return REAL_SPOT_PHOTO_FALLBACKS[spotId]?.imageUrl ?? null
  }

  if (isPlaceholderPhoto(photo)) {
    return REAL_SPOT_PHOTO_FALLBACKS[spotId]?.imageUrl ?? null
  }

  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo
  }

  if (photo.startsWith('/api/images/') || photo.startsWith('/uploads/')) {
    return photo
  }

  return `/api/images/${spotId}/${encodeURIComponent(photo)}`
}
