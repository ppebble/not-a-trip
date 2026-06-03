import {
  FALLBACK_IMAGE_SRC,
  getSafeImageSrc,
  isDisallowedPlaceholderImageSrc,
  isRemoteImageSrc,
} from './safe-image-src'

describe('isRemoteImageSrc', () => {
  it('detects absolute HTTP image URLs that should bypass Next optimization when needed', () => {
    expect(isRemoteImageSrc('https://cdn.example.com/photo.webp')).toBe(true)
    expect(isRemoteImageSrc(' http://cdn.example.com/photo.webp ')).toBe(true)
  })

  it('does not mark local assets as remote', () => {
    expect(isRemoteImageSrc('/uploads/spots/photo.jpg')).toBe(false)
    expect(isRemoteImageSrc('/icons/categories/other.webp')).toBe(false)
  })
})

describe('getSafeImageSrc', () => {
  it('replaces placeholders and category icons with a real photo fallback', () => {
    expect(getSafeImageSrc('/icons/categories/other.webp')).toBe(
      FALLBACK_IMAGE_SRC
    )
    expect(getSafeImageSrc('/images/showcase/camp-nou.webp')).toBe(
      FALLBACK_IMAGE_SRC
    )
    expect(getSafeImageSrc('/uploads/contents/covers/dummy-cover.jpg')).toBe(
      FALLBACK_IMAGE_SRC
    )
    expect(isDisallowedPlaceholderImageSrc(FALLBACK_IMAGE_SRC)).toBe(false)
  })

  it('keeps real local and remote photos', () => {
    expect(
      getSafeImageSrc('/uploads/contents/covers/anime-dbe476812aa582.webp')
    ).toBe('/uploads/contents/covers/anime-dbe476812aa582.webp')
    expect(getSafeImageSrc('/uploads/spots/replacements/campnou.jpg')).toBe(
      '/uploads/spots/replacements/campnou.jpg'
    )
    expect(getSafeImageSrc('https://cdn.example.com/photo.webp')).toBe(
      'https://cdn.example.com/photo.webp'
    )
  })
})
