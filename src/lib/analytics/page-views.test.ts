import { normalizeTrackablePagePath } from './page-views'

describe('page view path normalization', () => {
  test.each(['/welcome', '/contents', '/contents/example', '/map', '/routes'])(
    'accepts public path %s',
    (path) => {
      expect(normalizeTrackablePagePath(path)).toBe(path)
    }
  )

  test.each([
    '/admin',
    '/admin/reports',
    '/api/spots',
    '/auth/signin',
    '/offline',
  ])('rejects non-public path %s', (path) => {
    expect(normalizeTrackablePagePath(path)).toBeNull()
  })

  test('removes query strings and fragments before storage', () => {
    expect(normalizeTrackablePagePath('/map?category=anime#results')).toBe(
      '/map'
    )
  })

  test('rejects malformed and oversized values', () => {
    expect(normalizeTrackablePagePath('map')).toBeNull()
    expect(normalizeTrackablePagePath(null)).toBeNull()
    expect(normalizeTrackablePagePath('/map\nforged')).toBeNull()
    expect(normalizeTrackablePagePath(`/${'a'.repeat(301)}`)).toBeNull()
  })
})
