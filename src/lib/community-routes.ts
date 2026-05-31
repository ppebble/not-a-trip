const COMMUNITY_DETAIL_BASE_PATH = '/community'

/**
 * Builds the canonical community detail route used by profile activity links.
 *
 * Returns null for missing ids so callers can render a disabled/fallback state
 * instead of a broken href. The id is encoded as one path segment to prevent
 * accidental route shape changes such as `/community/posts/*`.
 */
export function buildCommunityDetailHref(
  postId: string | null | undefined
): string | null {
  const normalizedPostId = postId?.trim()

  if (!normalizedPostId) {
    return null
  }

  return `${COMMUNITY_DETAIL_BASE_PATH}/${encodeURIComponent(normalizedPostId)}`
}
