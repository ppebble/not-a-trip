/**
 * Route spot availability resolver.
 *
 * A route spot is unavailable only when its backing spot document is gone or
 * the backing spot is explicitly marked as unavailable by one of the supported
 * status fields. Missing or unknown status aliases stay available so legacy
 * route data cannot collapse into an all-lost course page.
 */

export interface RouteSpotAvailabilitySource {
  id?: string
  status?: string | null
  spotStatus?: string | null
  lifecycleStatus?: string | null
}

const EXPLICIT_UNAVAILABLE_STATUSES = new Set([
  'lost',
  'removed',
  'deleted',
  'closed',
  'closure',
  'demolished',
  'unavailable',
  'inactive',
  'archived',
])

function hasExplicitUnavailableStatus(
  value: string | null | undefined
): boolean {
  if (!value) return false
  return EXPLICIT_UNAVAILABLE_STATUSES.has(value.trim().toLowerCase())
}

export function isRouteSpotAvailable(
  spot: RouteSpotAvailabilitySource | undefined
): boolean {
  if (!spot) return false

  return ![spot.status, spot.spotStatus, spot.lifecycleStatus].some(
    hasExplicitUnavailableStatus
  )
}
