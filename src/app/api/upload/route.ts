import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import {
  analyzeNsfwImage,
  assertHourlyUploadLimit,
  createUploadFingerprint,
  findRecentDuplicateUpload,
  getClientIp,
  recordUploadFingerprint,
  UploadAbuseError,
} from '@/lib/security'
import {
  assertUploadQuota,
  prepareUploadArtifacts,
  recordUploadQuotaUsage,
  uploadImageVariantsToStorage,
  validateUploadFile,
} from '@/lib/upload'
import { UploadQuotaError } from '@/lib/upload/quota'
import { UploadValidationError } from '@/lib/upload/validation'
import { StorageConfigError } from '@/lib/storage/r2'
import { recordApiErrorMetric } from '@/lib/ops/metrics'
import type { UploadApiSuccess } from '@/types/upload'

/**
 * POST /api/upload
 * Authenticated image upload to Cloudflare R2 with WebP conversion and thumbnails.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(request)
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '이미지 업로드는 로그인 후 사용할 수 있습니다.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: '업로드할 파일이 없습니다.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const format = validateUploadFile(file, buffer)
    const fingerprint = createUploadFingerprint(buffer)

    await assertHourlyUploadLimit(session.user.id)
    const duplicate = await findRecentDuplicateUpload(
      session.user.id,
      fingerprint
    )

    if (duplicate) {
      const responseBody: UploadApiSuccess = {
        success: true,
        imageUrl: duplicate.original,
        original: duplicate.original,
        pin: duplicate.pin ?? duplicate.original,
        card: duplicate.card ?? duplicate.original,
        fileName: file.name,
        storage: 'r2',
      }

      return NextResponse.json(responseBody)
    }

    await assertUploadQuota(session.user.id, file.size)
    const moderation = await analyzeNsfwImage(buffer, {
      userId: session.user.id,
      ip,
    })
    if (!moderation.allowed) {
      return NextResponse.json(
        { error: moderation.reason ?? '업로드할 수 없는 이미지입니다.' },
        { status: 400 }
      )
    }

    const artifacts = await prepareUploadArtifacts(buffer, format)
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).slice(2, 8)
    const uploaded = await uploadImageVariantsToStorage(
      artifacts,
      timestamp,
      randomId
    )

    await recordUploadQuotaUsage(session.user.id, file.size)
    await recordUploadFingerprint({
      userId: session.user.id,
      fingerprint,
      originalUrl: uploaded.original,
      pinUrl: uploaded.pin,
      cardUrl: uploaded.card,
    })

    const responseBody: UploadApiSuccess = {
      success: true,
      imageUrl: uploaded.original,
      original: uploaded.original,
      pin: uploaded.pin,
      card: uploaded.card,
      fileName: `${timestamp}-${randomId}.${artifacts.original.extension}`,
      storage: 'r2',
    }

    return NextResponse.json(responseBody)
  } catch (error) {
    if (
      error instanceof UploadValidationError ||
      error instanceof UploadQuotaError ||
      error instanceof UploadAbuseError
    ) {
      return NextResponse.json(
        { error: error.message },
        {
          status:
            error instanceof UploadQuotaError ||
            error instanceof UploadAbuseError
              ? 429
              : 400,
        }
      )
    }

    if (error instanceof StorageConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // eslint-disable-next-line no-console
    console.error('Error uploading file:', error)
    await recordApiErrorMetric({ path: '/api/upload', statusCode: 500 })
    return NextResponse.json(
      { error: '파일 업로드에 실패했습니다.' },
      { status: 500 }
    )
  }
}
