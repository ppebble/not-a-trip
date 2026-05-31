import { buildCommunityDetailHref } from '../community-routes'

describe('buildCommunityDetailHref', () => {
  it('builds canonical community detail hrefs for profile posts', () => {
    expect(buildCommunityDetailHref('post-123')).toBe('/community/post-123')
  })

  it('builds canonical community detail hrefs for profile comments parent posts', () => {
    expect(buildCommunityDetailHref('parent-post-456')).toBe(
      '/community/parent-post-456'
    )
  })

  it('encodes ids as a single community detail path segment', () => {
    expect(buildCommunityDetailHref('post/with/slash')).toBe(
      '/community/post%2Fwith%2Fslash'
    )
  })

  it('returns null for missing or blank ids instead of a broken href', () => {
    expect(buildCommunityDetailHref(undefined)).toBeNull()
    expect(buildCommunityDetailHref(null)).toBeNull()
    expect(buildCommunityDetailHref('')).toBeNull()
    expect(buildCommunityDetailHref('   ')).toBeNull()
  })

  it('never generates the removed legacy posts route', () => {
    expect(buildCommunityDetailHref('post-123')).not.toContain(
      '/community/posts/'
    )
  })
})
