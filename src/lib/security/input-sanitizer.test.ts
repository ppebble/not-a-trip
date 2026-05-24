import {
  sanitizeOptionalPlainText,
  sanitizePlainText,
  sanitizeUrl,
} from './input-sanitizer'

describe('input sanitizer', () => {
  test('strips html tags and scripts', () => {
    expect(sanitizePlainText('<script>alert(1)</script><b>Hello</b>')).toBe(
      'Hello'
    )
  })

  test('neutralizes mongo operators', () => {
    expect(sanitizePlainText('$where.test')).toContain('＄where')
  })

  test('rejects javascript protocol urls', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
  })

  test('keeps http and https urls', () => {
    expect(sanitizeUrl('https://example.com/image.jpg')).toBe(
      'https://example.com/image.jpg'
    )
  })

  test('returns undefined for empty optional text', () => {
    expect(sanitizeOptionalPlainText('<b> </b>')).toBeUndefined()
  })
})
