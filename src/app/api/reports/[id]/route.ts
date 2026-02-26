import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { validateSpotReportInput } from '@/lib/report-validation'
import type { ReportStatus } from '@/types/report'

/**
 * GET /api/reports/[id] - 제보 상세 조회
 * Requirements: 1.6
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { id } = await params
    const collection = await getCollection(COLLECTIONS.SPOT_REPORTS)
    const report = await collection.findOne({ id })

    if (!report) {
      return NextResponse.json(
        { error: '제보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 본인 제보 또는 관리자만 조회 가능
    if (
      report.reporterId !== session.user.id &&
      session.user.role !== 'admin'
    ) {
      return NextResponse.json(
        { error: '조회 권한이 없습니다' },
        { status: 403 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching report detail:', error)
    return NextResponse.json(
      { error: '제보 상세 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/reports/[id] - 제보 수정
 * Requirements: 1.6
 * - 수정요청(revision_requested) 상태의 제보만 수정 가능
 * - 수정 후 status를 'pending'으로 재설정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const collection = await getCollection(COLLECTIONS.SPOT_REPORTS)

    const report = await collection.findOne({ id })

    if (!report) {
      return NextResponse.json(
        { error: '제보를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 본인 제보만 수정 가능
    if (report.reporterId !== session.user.id) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 수정요청 상태의 제보만 수정 가능
    if (report.status !== 'revision_requested') {
      return NextResponse.json(
        { error: '수정요청 상태의 제보만 수정할 수 있습니다' },
        { status: 400 }
      )
    }

    // 유효성 검사
    const validation = validateSpotReportInput(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: '유효성 검사 실패', details: validation.errors },
        { status: 400 }
      )
    }

    const now = new Date()

    await collection.updateOne(
      { id },
      {
        $set: {
          name: body.name.trim(),
          description: body.description.trim(),
          address: body.address.trim(),
          coordinates: body.coordinates,
          category: body.category,
          relatedContent: body.relatedContent,
          evidencePairs: body.evidencePairs,
          episodeInfo: body.episodeInfo.trim(),
          additionalPhotos: body.additionalPhotos,
          status: 'pending' as ReportStatus, // 수정 후 pending으로 재설정
          updatedAt: now,
        },
      }
    )

    return NextResponse.json({
      id,
      message: '제보가 수정되었습니다',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating report:', error)
    return NextResponse.json(
      { error: '제보 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}
