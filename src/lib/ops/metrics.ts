import { COLLECTIONS, getCollection } from '@/lib/db'

export interface OpsMetricRecord {
  kind: 'api_request' | 'api_error'
  path: string
  statusCode?: number
  createdAt: Date
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
