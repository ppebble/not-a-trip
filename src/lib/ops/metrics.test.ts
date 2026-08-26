const mockInsertOne = jest.fn()
const mockAggregateToArray = jest.fn()
const mockAggregate = jest.fn((_pipeline: unknown) => ({
  toArray: mockAggregateToArray,
}))

jest.mock('@/lib/db', () => ({
  COLLECTIONS: { OPS_METRICS: 'ops_metrics' },
  getCollection: jest.fn().mockResolvedValue({
    insertOne: (...args: unknown[]) => mockInsertOne(...args),
    aggregate: (pipeline: unknown) => mockAggregate(pipeline),
  }),
}))

import { getTrackedPageViewTrend, recordPageViewMetric } from './metrics'

describe('page view metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockInsertOne.mockResolvedValue({ acknowledged: true })
  })

  test('records only the page path and creation time', async () => {
    await recordPageViewMetric('/contents/example')

    expect(mockInsertOne).toHaveBeenCalledWith({
      kind: 'page_view',
      path: '/contents/example',
      createdAt: expect.any(Date),
    })
  })

  test('builds a zero-filled KST daily trend from page view events', async () => {
    mockAggregateToArray.mockResolvedValue([
      { _id: '2026-08-25', count: 4 },
      { _id: '2026-08-26', count: 7 },
    ])

    const trend = await getTrackedPageViewTrend(
      3,
      new Date('2026-08-26T02:00:00.000Z')
    )

    expect(trend).toEqual([
      { date: '2026-08-24', count: 0 },
      { date: '2026-08-25', count: 4 },
      { date: '2026-08-26', count: 7 },
    ])
    expect(mockAggregate).toHaveBeenCalledTimes(1)
    expect(mockAggregate).toHaveBeenCalledWith([
      {
        $match: {
          kind: 'page_view',
          createdAt: { $gte: expect.any(Date), $lt: expect.any(Date) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Seoul',
            },
          },
          count: { $sum: 1 },
        },
      },
    ])
  })
})
