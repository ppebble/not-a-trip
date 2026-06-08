import { isRouteSpotAvailable } from './route-spot-availability'

describe('isRouteSpotAvailable', () => {
  it('keeps existing approved spots available when no unavailable status is set', () => {
    expect(
      isRouteSpotAvailable({
        id: 'REAL-ANI-001',
        lifecycleStatus: 'approved',
      })
    ).toBe(true)
  })

  it('marks deleted route references unavailable when the backing spot is missing', () => {
    expect(isRouteSpotAvailable(undefined)).toBe(false)
  })

  const unavailableStatusCases = [
    {
      label: 'legacy lost status',
      spot: { id: 'SPOT-001', status: 'lost' },
    },
    {
      label: 'demolished status report',
      spot: { id: 'SPOT-002', spotStatus: 'demolished' },
    },
    {
      label: 'closed lifecycle',
      spot: { id: 'SPOT-003', lifecycleStatus: 'closed' },
    },
  ]

  it.each(unavailableStatusCases)('marks $label unavailable', ({ spot }) => {
    expect(isRouteSpotAvailable(spot)).toBe(false)
  })
})
