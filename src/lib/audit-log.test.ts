import { createAuditLogRecord, extractClientIp } from './audit-log'

describe('audit-log utilities', () => {
  test('createAuditLogRecord sets 90-day retention and default changes', () => {
    const now = new Date('2026-05-24T00:00:00.000Z')
    const record = createAuditLogRecord(
      {
        adminId: 'admin-1',
        actionType: 'review_spot_report',
        resourceType: 'spot_report',
        resourceId: 'REPORT-1',
      },
      now
    )

    expect(record.createdAt).toEqual(now)
    expect(record.expiresAt.toISOString()).toBe('2026-08-22T00:00:00.000Z')
    expect(record.changes).toEqual([])
  })

  test('extractClientIp prefers x-forwarded-for and falls back to x-real-ip', () => {
    const forwardedHeaders = new Headers({
      'x-forwarded-for': '203.0.113.1, 10.0.0.1',
      'x-real-ip': '198.51.100.7',
    })
    const realIpHeaders = new Headers({
      'x-real-ip': '198.51.100.7',
    })

    expect(extractClientIp(forwardedHeaders)).toBe('203.0.113.1')
    expect(extractClientIp(realIpHeaders)).toBe('198.51.100.7')
    expect(extractClientIp(new Headers())).toBeUndefined()
  })
})
