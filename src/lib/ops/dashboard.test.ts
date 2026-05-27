const mockGetCollection = jest.fn()
const mockGetTrackedApiErrorRate24h = jest.fn()
const mockGetSlaStatistics = jest.fn()

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    SPOT_REPORTS: 'spot_reports',
    SPOT_SUPPLEMENTS: 'spot_supplements',
    SPOT_STATUS_REPORTS: 'spot_status_reports',
    SPOT_QUALITY_REPORTS: 'spot_quality_reports',
    CHECKINS: 'checkins',
    POSTS: 'posts',
    COMMENTS: 'comments',
    USERS: 'users',
    SPOTS: 'spots',
  },
  getCollection: (...args: unknown[]) => mockGetCollection(...args),
}))

jest.mock('./metrics', () => ({
  getTrackedApiErrorRate24h: (...args: unknown[]) =>
    mockGetTrackedApiErrorRate24h(...args),
}))

jest.mock('@/lib/spot-quality/report-processor', () => ({
  getSlaStatistics: (...args: unknown[]) => mockGetSlaStatistics(...args),
}))

import { buildDashboardSummary } from './dashboard'

function createCollectionStub({
  countDocuments = jest.fn().mockResolvedValue(0),
  distinct = jest.fn().mockResolvedValue([]),
} = {}) {
  return {
    countDocuments,
    distinct,
  }
}

describe('ops dashboard summary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetTrackedApiErrorRate24h.mockResolvedValue(12.5)
    mockGetSlaStatistics.mockResolvedValue({
      complianceRate: 95,
      averageProcessingTime: 18,
      exceededCount: 1,
    })

    const reportsCollection = createCollectionStub({
      countDocuments: jest
        .fn()
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0),
      distinct: jest
        .fn()
        .mockResolvedValueOnce(['u1'])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
    })
    const supplementsCollection = createCollectionStub({
      countDocuments: jest.fn().mockResolvedValue(4),
    })
    const statusReportsCollection = createCollectionStub({
      countDocuments: jest.fn().mockResolvedValue(5),
    })
    const qualityReportsCollection = createCollectionStub({
      countDocuments: jest.fn().mockResolvedValue(6),
    })
    const checkinsCollection = createCollectionStub({
      countDocuments: jest
        .fn()
        .mockResolvedValueOnce(7)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(6)
        .mockResolvedValueOnce(7),
      distinct: jest
        .fn()
        .mockResolvedValueOnce(['u1', 'u2'])
        .mockResolvedValueOnce(['u1'])
        .mockResolvedValueOnce(['u2'])
        .mockResolvedValueOnce(['u3'])
        .mockResolvedValueOnce(['u4'])
        .mockResolvedValueOnce(['u5'])
        .mockResolvedValueOnce(['u6'])
        .mockResolvedValueOnce(['u7']),
    })
    const postsCollection = createCollectionStub({
      distinct: jest
        .fn()
        .mockResolvedValueOnce(['u3'])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
    })
    const commentsCollection = createCollectionStub({
      distinct: jest
        .fn()
        .mockResolvedValueOnce(['u2'])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
    })
    const usersCollection = createCollectionStub({
      countDocuments: jest.fn().mockResolvedValue(8),
    })
    const spotsCollection = createCollectionStub({
      countDocuments: jest.fn().mockResolvedValue(9),
    })

    mockGetCollection.mockImplementation(async (name: string) => {
      switch (name) {
        case 'spot_reports':
          return reportsCollection
        case 'spot_supplements':
          return supplementsCollection
        case 'spot_status_reports':
          return statusReportsCollection
        case 'spot_quality_reports':
          return qualityReportsCollection
        case 'checkins':
          return checkinsCollection
        case 'posts':
          return postsCollection
        case 'comments':
          return commentsCollection
        case 'users':
          return usersCollection
        case 'spots':
          return spotsCollection
        default:
          throw new Error(`Unexpected collection: ${name}`)
      }
    })
  })

  test('builds summary metrics and seven-day trends', async () => {
    const result = await buildDashboardSummary()

    expect(result.pendingReports).toBe(3)
    expect(result.pendingSupplements).toBe(4)
    expect(result.pendingStatusReports).toBe(5)
    expect(result.pendingQualityReports).toBe(6)
    expect(result.dauToday).toBe(3)
    expect(result.totalCheckInsToday).toBe(7)
    expect(result.errorRate24h).toBe(12.5)
    expect(result.newUsersToday).toBe(8)
    expect(result.newSpotsToday).toBe(9)
    expect(result.qualitySla).toEqual({
      complianceRate: 95,
      averageProcessingTime: 18,
      exceededCount: 1,
    })
    expect(result.dauTrend).toHaveLength(7)
    expect(result.checkInTrend).toHaveLength(7)
    expect(result.generatedAt).toEqual(expect.any(String))
  })
})
