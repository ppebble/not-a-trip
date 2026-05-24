import { evaluateSlidingWindowLimit } from './rate-limit'

export class SpamGuardError extends Error {
  constructor(
    message: string,
    public readonly retryAfterSeconds: number
  ) {
    super(message)
    this.name = 'SpamGuardError'
  }
}

function assertGuard(
  key: string,
  limit: number,
  windowMs: number,
  message: string
): void {
  const result = evaluateSlidingWindowLimit({
    key,
    limit,
    windowMs,
  })

  if (!result.allowed) {
    throw new SpamGuardError(message, result.retryAfterSeconds)
  }
}

export function guardCheckinSpam(userId: string, spotId: string): void {
  assertGuard(
    `checkin:${userId}:${spotId}`,
    1,
    5 * 60 * 1000,
    '같은 스팟 체크인은 5분에 한 번만 등록할 수 있습니다.'
  )
}

export function guardCommentSpam(userIdOrIp: string): void {
  assertGuard(
    `comment:${userIdOrIp}`,
    1,
    30 * 1000,
    '댓글은 30초에 한 번만 작성할 수 있습니다.'
  )
}

export function guardReportSpam(userId: string): void {
  assertGuard(
    `report:${userId}`,
    3,
    10 * 60 * 1000,
    '신규 제보는 10분에 최대 3건까지 등록할 수 있습니다.'
  )
}

export function guardPostSpam(userIdOrIp: string): void {
  assertGuard(
    `post:${userIdOrIp}`,
    10,
    60 * 60 * 1000,
    '게시글은 1시간에 최대 10건까지 작성할 수 있습니다.'
  )
}
