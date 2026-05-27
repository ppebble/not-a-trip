import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { COLLECTIONS, getCollection } from '@/lib/db'
import {
  createQualityReport,
  getQualityReportSummary,
} from '@/lib/spot-quality/report-processor'
import type {
  CreateQualityReportInput,
  QualityReportType,
} from '@/types/spot-quality'

const VALID_TYPES: QualityReportType[] = [
  'inaccurate_info',
  'closed_permanently',
  'duplicate',
  'inappropriate',
  'other',
]

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: spotId } = await params
    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
    const spot = await spotsCollection.findOne({ id: spotId })

    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 })
    }

    return NextResponse.json(await getQualityReportSummary(spotId))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching quality report summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quality report summary' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Login is required.' }, { status: 401 })
    }

    const { id: spotId } = await params
    const body = (await request.json()) as Partial<CreateQualityReportInput>

    if (
      typeof body.reportType !== 'string' ||
      !VALID_TYPES.includes(body.reportType as QualityReportType)
    ) {
      return NextResponse.json(
        { error: 'Invalid report type.' },
        { status: 400 }
      )
    }

    if (!body.description?.trim()) {
      return NextResponse.json(
        { error: 'Description is required.' },
        { status: 400 }
      )
    }

    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
    const spot = await spotsCollection.findOne({ id: spotId })
    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 })
    }

    const report = await createQualityReport({
      spotId,
      reportType: body.reportType,
      description: body.description,
      evidencePhotos: body.evidencePhotos ?? [],
      reporterId: session.user.id!,
      reporterName:
        session.user.name ?? session.user.email?.split('@')[0] ?? 'anonymous',
    })

    return NextResponse.json(
      { id: report.id, message: 'Quality report submitted.', report },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // eslint-disable-next-line no-console
    console.error('Error creating quality report:', error)
    return NextResponse.json(
      { error: 'Failed to create quality report.' },
      { status: 500 }
    )
  }
}
