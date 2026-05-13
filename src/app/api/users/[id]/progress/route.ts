import { NextRequest, NextResponse } from 'next/server'
import {
  fetchTotalSpotsMap,
  fetchCheckedSpotsMap,
  mergeProgressMaps,
} from '@/lib/progress-utils'

/**
 * GET /api/users/[id]/progress - 콘텐츠별 진행률 조회
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const [totalSpotsMap, checkedSpotsMap] = await Promise.all([
      fetchTotalSpotsMap(),
      fetchCheckedSpotsMap(userId),
    ])

    const progress = mergeProgressMaps(totalSpotsMap, checkedSpotsMap).sort(
      (a, b) => b.progress - a.progress // 진행률 높은 순 (Requirement 3.3)
    )

    return NextResponse.json({ progress, total: progress.length })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: '진행률 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
