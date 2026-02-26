import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import type { CreateSupplementInput, SupplementType } from '@/types/report'

const VALID_SUPPLEMENT_TYPES: SupplementType[] = [
  'scene_info',
  'description',
  'photo',
  'other',
]

/**
 * 다음 보완 제보 ID 생성 (SUPPLEMENT-{숫자} 형식)
 */
async function generateSupplementId(): Promise<string> {
  const collection = await getCollection(COLLECTIONS.SPOT_SUPPLEMENTS)

  const supplements = await collection
    .find({ id: { $regex: /^SUPPLEMENT-\d+$/ } })
    .project({ id: 1 })
    .sort({ id: -1 })
    .limit(1)
    .toArray()

  if (supplements.length === 0) {
    return 'SUPPLEMENT-001'
  }

  const match = supplements[0].id.match(/^SUPPLEMENT-(\d+)$/)
  const nextNumber = match ? parseInt(match[1], 10) + 1 : 1
  return `SUPPLEMENT-${nextNumber.toString().padStart(3, '0')}`
}

/**
 * GET /api/spots/[id]/supplements - 스팟 보완 기여자 목록 조회
 * Requirements: 3.3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: spotId } = await params
    const collection = await getCollection(COLLECTIONS.SPOT_SUPPLEMENTS)

    // 해당 스팟의 보완 기여자 목록 (중복 제거)
    const supplements = await collection
      .find({ spotId })
      .sort({ createdAt: -1 })
      .toArray()

    // 기여자 목록 추출 (중복 제거)
    const contributorMap = new Map<
      string,
      { contributorId: string; contributorName: string; count: number }
    >()

    for (const supplement of supplements) {
      const existing = contributorMap.get(supplement.contributorId)
      if (existing) {
        existing.count++
      } else {
        contributorMap.set(supplement.contributorId, {
          contributorId: supplement.contributorId,
          contributorName: supplement.contributorName,
          count: 1,
        })
      }
    }

    return NextResponse.json({
      contributors: Array.from(contributorMap.values()),
      supplements,
      total: supplements.length,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching supplements:', error)
    return NextResponse.json(
      { error: '보완 기여자 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/spots/[id]/supplements - 기존 스팟 정보 보완 제보
 * Requirements: 3.1, 3.2
 */
export async function POST(
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

    const { id: spotId } = await params
    const body: CreateSupplementInput = await request.json()

    // 스팟 존재 여부 확인
    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
    const spot = await spotsCollection.findOne({ id: spotId })
    if (!spot) {
      return NextResponse.json(
        { error: '스팟을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 유효성 검사
    const errors: string[] = []

    if (!body.type || !VALID_SUPPLEMENT_TYPES.includes(body.type)) {
      errors.push('유효한 보완 유형을 선택해주세요')
    }

    if (!body.content?.trim()) {
      errors.push('보완 내용을 입력해주세요')
    }

    // scene_info 타입일 때 추가 검증
    if (body.type === 'scene_info') {
      if (!body.sceneInfo?.animeTitle?.trim()) {
        errors.push('작품명을 입력해주세요')
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: '유효성 검사 실패', details: errors },
        { status: 400 }
      )
    }

    const collection = await getCollection(COLLECTIONS.SPOT_SUPPLEMENTS)
    const now = new Date()
    const supplementId = await generateSupplementId()

    const newSupplement = {
      id: supplementId,
      spotId,
      contributorId: session.user.id!,
      contributorName:
        session.user.name || session.user.email?.split('@')[0] || '익명',
      type: body.type,
      content: body.content.trim(),
      sceneInfo: body.sceneInfo,
      photos: body.photos || [],
      approved: false,
      createdAt: now,
    }

    await collection.insertOne(newSupplement)

    return NextResponse.json(
      {
        id: newSupplement.id,
        message: '정보 보완 제보가 접수되었습니다',
      },
      { status: 201 }
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating supplement:', error)
    return NextResponse.json(
      { error: '정보 보완 제보에 실패했습니다' },
      { status: 500 }
    )
  }
}
