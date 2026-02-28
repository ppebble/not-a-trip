import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { FacilityVoteDocument } from '@/types/facility'

/**
 * POST /api/facilities/[id]/vote — 마이크로 투표 API
 * Requirements: 7.6, 7.7, 7.8, 5.11
 *
 * value: true = 정확해요(👍), false = 아니에요(👎)
 * 동일 유저가 동일 시설에 투표 시 기존 값 업데이트 (중복 누적 방지)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // 1. 인증 확인
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 400 }
      )
    }

    const { id: facilityId } = await params
    const userId = session.user.id

    // 2. value 필드 검증
    const body = await request.json()
    if (typeof body.value !== 'boolean') {
      return NextResponse.json(
        { error: '투표 값(value)은 boolean이어야 합니다' },
        { status: 400 }
      )
    }

    const { value } = body
    const now = new Date()

    const votesCollection = await getCollection<FacilityVoteDocument>(
      COLLECTIONS.FACILITY_VOTES
    )

    // 3. { facilityId, userId } 복합 유니크 인덱스 보장
    await votesCollection.createIndex(
      { facilityId: 1, userId: 1 },
      { unique: true }
    )

    // 4. 기존 투표 조회
    const existingVote = await votesCollection.findOne({ facilityId, userId })

    if (existingVote) {
      // 기존 투표 업데이트
      await votesCollection.updateOne(
        { facilityId, userId },
        { $set: { value, updatedAt: now } }
      )
    } else {
      // 신규 투표 삽입
      await votesCollection.insertOne({
        facilityId,
        userId,
        value,
        createdAt: now,
        updatedAt: now,
      } as FacilityVoteDocument)
    }

    // 5. upvotes/downvotes 재계산
    const upvotes = await votesCollection.countDocuments({
      facilityId,
      value: true,
    })
    const downvotes = await votesCollection.countDocuments({
      facilityId,
      value: false,
    })

    // 6. verificationScore 산출
    const totalVotes = upvotes + downvotes
    const verificationScore =
      totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 50

    // 7. 상태 전이 결정
    const facilitiesCollection = await getCollection(COLLECTIONS.FACILITIES)
    const facility = await facilitiesCollection.findOne({
      _id: new ObjectId(facilityId),
    })

    let status = facility?.status || 'active'

    if (downvotes - upvotes >= 5) {
      status = 'needs_verification'
    }
    if (verificationScore < 20) {
      status = 'hidden'
    }

    // 8. facility 문서 업데이트
    await facilitiesCollection.updateOne(
      { _id: new ObjectId(facilityId) },
      {
        $set: {
          upvotes,
          downvotes,
          verificationScore,
          status,
          updatedAt: now,
        },
      }
    )

    // 9. 응답
    return NextResponse.json({ verificationScore, upvotes, downvotes })
  } catch (error) {
    console.error('Error voting on facility:', error)
    return NextResponse.json(
      { error: '투표 처리에 실패했습니다' },
      { status: 500 }
    )
  }
}
