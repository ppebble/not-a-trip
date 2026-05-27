jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    SPOT_QUALITY_REPORTS: 'spot_quality_reports',
  },
  getCollection: jest.fn(),
}))

jest.mock('./duplicate-detector', () => ({
  checkDuplicates: jest.fn(),
}))

import { getCollection } from '@/lib/db'
import { checkDuplicates } from './duplicate-detector'
import {
  detectDuplicateSuspicionForSpotReport,
  getSlaStatistics,
  getSlaStatus,
  isNearSlaThreshold,
} from './report-processor'

const mockGetCollection = getCollection as jest.MockedFunction<
  typeof getCollection
>
const mockCheckDuplicates = checkDuplicates as jest.MockedFunction<
  typeof checkDuplicates
>

describe('spot quality report processor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('marks report as sla_exceeded after deadline', () => {
    expect(
      getSlaStatus({
        status: 'pending',
        reportType: 'other',
        createdAt: new Date('2026-05-20T00:00:00.000Z'),
        deadline: new Date('2026-05-21T00:00:00.000Z'),
      })
    ).toBe('sla_exceeded')
  })

  test('detects nearing deadline after 80 percent elapsed', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-20T08:30:00.000Z'))

    expect(
      isNearSlaThreshold({
        createdAt: new Date('2026-05-20T00:00:00.000Z'),
        deadline: new Date('2026-05-20T10:00:00.000Z'),
      })
    ).toBe(true)

    jest.useRealTimers()
  })

  test('computes SLA statistics from resolved and overdue reports', async () => {
    mockGetCollection.mockResolvedValue({
      find: jest.fn(() => ({
        toArray: jest.fn().mockResolvedValue([
          {
            id: 'QUALITY-001',
            createdAt: new Date('2026-05-20T00:00:00.000Z'),
            deadline: new Date('2026-05-21T00:00:00.000Z'),
            resolution: {
              resolvedAt: new Date('2026-05-20T12:00:00.000Z'),
            },
          },
          {
            id: 'QUALITY-002',
            createdAt: new Date('2026-05-20T00:00:00.000Z'),
            deadline: new Date('2026-05-20T06:00:00.000Z'),
          },
        ]),
      })),
    } as never)

    const stats = await getSlaStatistics()

    expect(stats.complianceRate).toBe(100)
    expect(stats.averageProcessingTime).toBe(720)
    expect(stats.exceededCount).toBe(1)
  })

  test('flags duplicate suspicion when duplicate detector finds nearby matches', async () => {
    mockCheckDuplicates.mockResolvedValue({
      nearbyItems: [],
      highDuplicates: [
        {
          id: 'spot-1',
          name: 'Akiba',
          coordinates: { lat: 1, lng: 2 },
          distance: 10,
          similarityScore: 0.9,
          type: 'spot',
        },
      ],
      proximityWarnings: [],
    })

    await expect(
      detectDuplicateSuspicionForSpotReport({
        name: 'Akiba',
        coordinates: { lat: 1, lng: 2 },
      })
    ).resolves.toBe(true)
  })
})
