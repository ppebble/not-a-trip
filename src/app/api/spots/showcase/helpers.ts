export function isPlaceholderPhoto(photo: string | undefined | null): boolean {
  if (!photo) return true

  return (
    photo.includes('picsum.photos/seed/') ||
    photo.startsWith('/icons/') ||
    photo.startsWith('data:image/svg+xml')
  )
}

export function resolveThumbnailUrl(
  spotId: string,
  photo: string | undefined | null
): string | null {
  if (!photo) return null

  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    return photo
  }

  if (photo.startsWith('/api/images/') || photo.startsWith('/uploads/')) {
    return photo
  }

  if (isPlaceholderPhoto(photo)) {
    return null
  }

  return `/api/images/${spotId}/${encodeURIComponent(photo)}`
}
