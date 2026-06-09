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

  it('keeps spots available when optional status aliases are missing', () => {
    expect(isRouteSpotAvailable({ id: 'REAL-ANI-002' })).toBe(true)
  })

  it('keeps null and unknown statuses available by default', () => {
    expect(
      isRouteSpotAvailable({
        id: 'REAL-ANI-003',
        status: null,
        spotStatus: 'normal',
        lifecycleStatus: 'mystery-but-not-explicitly-closed',
      })
    ).toBe(true)
  })

  it('marks deleted route references unavailable when the backing spot is missing', () => {
    expect(isRouteSpotAvailable(undefined)).toBe(false)
  })

  const unavailableStatusCases = [
    { label: 'legacy lost status', spot: { id: 'SPOT-001', status: 'lost' } },
    { label: 'removed status', spot: { id: 'SPOT-002', status: 'removed' } },
    {
      label: 'demolished status report',
      spot: { id: 'SPOT-003', spotStatus: 'demolished' },
    },
    {
      label: 'closed lifecycle',
      spot: { id: 'SPOT-004', lifecycleStatus: 'closed' },
    },
    {
      label: 'unavailable alias',
      spot: { id: 'SPOT-005', spotStatus: 'unavailable' },
    },
  ]

  it.each(unavailableStatusCases)('marks $label unavailable', ({ spot }) => {
    expect(isRouteSpotAvailable(spot)).toBe(false)
  })
})
