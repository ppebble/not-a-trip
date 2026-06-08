/**
 * Route spot availability resolver.
 *
 * A route spot is unavailable only when its backing spot document is gone or
 * the backing spot is explicitly marked as unavailable by one of the supported
 * status fields.
 */

export interface RouteSpotAvailabilitySource {
  id?: string
  status?: string
  spotStatus?: string
  lifecycleStatus?: string
}

const LEGACY_UNAVAILABLE_STATUSES = new Set(['lost'])
const SPOT_STATUS_UNAVAILABLE_STATUSES = new Set(['demolished'])
const LIFECYCLE_UNAVAILABLE_STATUSES = new Set(['closed'])

export function isRouteSpotAvailable(
  spot: RouteSpotAvailabilitySource | undefined
): boolean {
  if (!spot) return false

  if (
    spot.status &&
    LEGACY_UNAVAILABLE_STATUSES.has(spot.status.toLowerCase())
  ) {
    return false
  }

  if (
    spot.spotStatus &&
    SPOT_STATUS_UNAVAILABLE_STATUSES.has(spot.spotStatus.toLowerCase())
  ) {
    return false
  }

  if (
    spot.lifecycleStatus &&
    LIFECYCLE_UNAVAILABLE_STATUSES.has(spot.lifecycleStatus.toLowerCase())
  ) {
    return false
  }

  return true
}
