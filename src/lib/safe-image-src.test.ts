import { isRemoteImageSrc } from './safe-image-src'

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
