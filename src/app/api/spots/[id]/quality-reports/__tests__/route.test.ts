jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  COLLECTIONS: {
    SPOTS: 'spots',
  },
  getCollection: jest.fn(),
}))

jest.mock('@/lib/spot-quality/report-processor', () => ({
  createQualityReport: jest.fn(),
  getQualityReportSummary: jest.fn(),
}))

import { auth } from '@/lib/auth'
import { getCollection } from '@/lib/db'
import {
  createQualityReport,
  getQualityReportSummary,
} from '@/lib/spot-quality/report-processor'
import { GET, POST } from '../route'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockGetCollection = getCollection as jest.MockedFunction<
  typeof getCollection
>
const mockCreateQualityReport = createQualityReport as jest.MockedFunction<
  typeof createQualityReport
>
const mockGetQualityReportSummary =
  getQualityReportSummary as jest.MockedFunction<typeof getQualityReportSummary>

describe('spot quality reports route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCollection.mockResolvedValue({
      findOne: jest.fn().mockResolvedValue({ id: 'SPOT-001' }),
    } as never)
  })

  test('returns summary for existing spot', async () => {
    mockGetQualityReportSummary.mockResolvedValue({
      countsByType: { duplicate: 2 },
      recentReports: [],
      urgentReviewRequired: false,
      closureSuspected: false,
    })

    const response = await GET({} as never, {
      params: Promise.resolve({ id: 'SPOT-001' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.countsByType.duplicate).toBe(2)
  })

  test('creates quality report for authenticated user', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-1', name: 'Tester', role: 'user' },
    } as never)
    mockCreateQualityReport.mockResolvedValue({
      id: 'QUALITY-001',
      spotId: 'SPOT-001',
      reportType: 'duplicate',
      description: 'Looks duplicated',
      evidencePhotos: [],
      reporterId: 'user-1',
      reporterName: 'Tester',
      status: 'pending',
      deadline: new Date('2026-05-28T00:00:00.000Z'),
      isUrgent: false,
      createdAt: new Date('2026-05-27T00:00:00.000Z'),
      updatedAt: new Date('2026-05-27T00:00:00.000Z'),
    })

    const response = await POST(
      {
        json: jest.fn().mockResolvedValue({
          reportType: 'duplicate',
          description: 'Looks duplicated',
        }),
      } as never,
      { params: Promise.resolve({ id: 'SPOT-001' }) }
    )
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.id).toBe('QUALITY-001')
    expect(mockCreateQualityReport).toHaveBeenCalledWith(
      expect.objectContaining({
        spotId: 'SPOT-001',
        reportType: 'duplicate',
        reporterId: 'user-1',
      })
    )
  })
})
