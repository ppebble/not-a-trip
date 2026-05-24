import { writeSecurityLog } from './security-log'

export interface NsfwModerationResult {
  score: number | null
  category: string
  allowed: boolean
  pendingReview: boolean
  reason?: string
}

export async function analyzeNsfwImage(
  buffer: Buffer,
  context: { userId?: string; ip?: string }
): Promise<NsfwModerationResult> {
  const serviceUrl = process.env.NSFW_MODERATION_URL?.trim()

  if (!serviceUrl) {
    await writeSecurityLog({
      type: 'nsfw_analysis_unavailable',
      severity: 'warning',
      userId: context.userId,
      ip: context.ip,
      details: {
        reason: 'NSFW moderation service not configured',
      },
    })

    return {
      score: null,
      category: 'unavailable',
      allowed: true,
      pendingReview: true,
    }
  }

  try {
    const response = await fetch(serviceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: new Uint8Array(buffer),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      throw new Error(`Moderation service returned ${response.status}`)
    }

    const data = (await response.json()) as {
      score?: number
      category?: string
    }
    const score = data.score ?? 0
    const category = data.category ?? 'unknown'
    const allowed = score < 0.7

    await writeSecurityLog({
      type: 'nsfw_analysis_result',
      severity: allowed ? 'info' : 'warning',
      userId: context.userId,
      ip: context.ip,
      details: {
        score,
        category,
        allowed,
      },
    })

    return {
      score,
      category,
      allowed,
      pendingReview: false,
      reason: allowed
        ? undefined
        : 'NSFW 가능성이 높은 이미지가 감지되었습니다.',
    }
  } catch (error) {
    await writeSecurityLog({
      type: 'nsfw_analysis_failed',
      severity: 'warning',
      userId: context.userId,
      ip: context.ip,
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    })

    return {
      score: null,
      category: 'failed',
      allowed: true,
      pendingReview: true,
    }
  }
}
