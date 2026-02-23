import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { ContentProgress } from '@/types'

interface CheckInDocument {
  spotId: string
  userId: string
}

interface SpotDocument {
  id: string
  relatedContent?: {
    name: string
    type: string
  }[]
}

/**
 * GET /api/users/[id]/progress - 콘텐츠별 진행률 조회
 * Requirements: 3.2
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const checkinsCollection = await getCollection<CheckInDocument>(
      COLLECTIONS.CHECKINS
    )
    const spotsCollection = await getCollection<SpotDocument>(COLLECTIONS.SPOTS)

    // 유저가 인증한 스팟 ID 목록
    const checkedSpotIds = await checkinsCollection.distinct('spotId', {
      userId,
    })

    // 모든 스팟의 콘텐츠 정보 조회
    const allSpots = await spotsCollection
      .find({ relatedContent: { $exists: true, $ne: [] } })
      .project({ id: 1, relatedContent: 1 })
      .toArray()

    // 콘텐츠별 스팟 수 집계
    const contentSpotMap = new Map<
      string,
      { total: Set<string>; checked: Set<string> }
    >()

    for (const spot of allSpots) {
      if (!spot.relatedContent) continue

      for (const content of spot.relatedContent) {
        if (!contentSpotMap.has(content.name)) {
          contentSpotMap.set(content.name, {
            total: new Set(),
            checked: new Set(),
          })
        }

        const entry = contentSpotMap.get(content.name)!
        entry.total.add(spot.id)

        if (checkedSpotIds.includes(spot.id)) {
          entry.checked.add(spot.id)
        }
      }
    }

    // ContentProgress 배열로 변환
    const progress: ContentProgress[] = Array.from(contentSpotMap.entries())
      .map(([contentName, data]) => ({
        contentName,
        totalSpots: data.total.size,
        checkedSpots: data.checked.size,
        progress:
          data.total.size > 0
            ? Math.round((data.checked.size / data.total.size) * 100)
            : 0,
      }))
      .filter((p) => p.checkedSpots > 0) // 인증한 콘텐츠만 표시
      .sort((a, b) => b.progress - a.progress) // 진행률 높은 순

    return NextResponse.json({ progress, total: progress.length })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: '진행률 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
