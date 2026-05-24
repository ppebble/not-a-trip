import { getDb } from './db'

export interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  database: 'healthy' | 'unhealthy'
  responseTimeMs: number
  serverTime: string
  version: string
  error?: string
}

export async function checkDatabaseHealth(): Promise<void> {
  const db = await getDb()
  await db.command({ ping: 1 })
}

export async function createHealthStatus(): Promise<{
  body: HealthStatus
  statusCode: number
}> {
  const startedAt = Date.now()
  const serverTime = new Date().toISOString()
  const version = process.env.npm_package_version || '0.1.0'

  try {
    await checkDatabaseHealth()

    return {
      statusCode: 200,
      body: {
        status: 'healthy',
        database: 'healthy',
        responseTimeMs: Date.now() - startedAt,
        serverTime,
        version,
      },
    }
  } catch (error) {
    return {
      statusCode: 503,
      body: {
        status: 'unhealthy',
        database: 'unhealthy',
        responseTimeMs: Date.now() - startedAt,
        serverTime,
        version,
        error:
          error instanceof Error
            ? error.message
            : 'Database health check failed',
      },
    }
  }
}
