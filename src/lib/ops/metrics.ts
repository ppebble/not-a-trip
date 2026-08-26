import { COLLECTIONS, getCollection } from '@/lib/db'

export interface OpsMetricRecord {
  kind: 'api_request' | 'api_error' | 'page_view'
  path: string
  statusCode?: number
  createdAt: Date
}

const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000

function startOfKoreanDay(date: Date): Date {
  const koreaDate = new Date(date.getTime() + KOREA_TIME_OFFSET_MS)
  return new Date(
    Date.UTC(
      koreaDate.getUTCFullYear(),
      koreaDate.getUTCMonth(),
      koreaDate.getUTCDate()
    ) - KOREA_TIME_OFFSET_MS
  )
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function formatKoreanDayKey(date: Date): string {
  return new Date(date.getTime() + KOREA_TIME_OFFSET_MS)
    .toISOString()
    .slice(0, 10)
}

export async function recordApiRequestMetric(path: string): Promise<void> {
  const collection = await getCollection<OpsMetricRecord>(
    COLLECTIONS.OPS_METRICS
  )
  await collection.insertOne({
    kind: 'api_request',
    path,
    createdAt: new Date(),
  })
}

export async function recordApiErrorMetric(params: {
  path: string
  statusCode?: number
}): Promise<void> {
  const collection = await getCollection<OpsMetricRecord>(
    COLLECTIONS.OPS_METRICS
  )
  await collection.insertOne({
    kind: 'api_error',
    path: params.path,
    statusCode: params.statusCode ?? 500,
    createdAt: new Date(),
  })
}

export async function recordPageViewMetric(path: string): Promise<void> {
  const collection = await getCollection<OpsMetricRecord>(
    COLLECTIONS.OPS_METRICS
  )
  await collection.insertOne({
    kind: 'page_view',
    path,
    createdAt: new Date(),
  })
}

export async function getTrackedPageViewTrend(
  days = 7,
  now = new Date()
): Promise<Array<{ date: string; count: number }>> {
  const collection = await getCollection<OpsMetricRecord>(
    COLLECTIONS.OPS_METRICS
  )
  const dayStarts = Array.from({ length: days }, (_, index) =>
    startOfKoreanDay(addDays(now, index - (days - 1)))
  )

  if (dayStarts.length === 0) {
    return []
  }

  const counts = await collection
    .aggregate<{ _id: string; count: number }>([
      {
        $match: {
          kind: 'page_view',
          createdAt: {
            $gte: dayStarts[0],
            $lt: addDays(dayStarts.at(-1)!, 1),
          },
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
    .toArray()
  const countByDate = new Map(counts.map((point) => [point._id, point.count]))

  return dayStarts.map((dayStart) => {
    const date = formatKoreanDayKey(dayStart)
    return { date, count: countByDate.get(date) ?? 0 }
  })
}

export async function getTrackedApiErrorRate24h(): Promise<number> {
  const collection = await getCollection<OpsMetricRecord>(
    COLLECTIONS.OPS_METRICS
  )
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [requestCount, errorCount] = await Promise.all([
    collection.countDocuments({
      kind: 'api_request',
      createdAt: { $gte: threshold },
    }),
    collection.countDocuments({
      kind: 'api_error',
      createdAt: { $gte: threshold },
    }),
  ])

  if (requestCount === 0) {
    return 0
  }

  return Number(((errorCount / requestCount) * 100).toFixed(2))
}
