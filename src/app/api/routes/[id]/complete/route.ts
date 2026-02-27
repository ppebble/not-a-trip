import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Route, RouteCompletion } from '@/types/route'

/**
 * POST /api/routes/[id]/complete - 코스 완주 기록
 * Requirements: 3.5
 * - 완주 시 인증한 스팟 ID 목록, 소요 시간 기록
 * - routes 컬렉션의 completionCount 증가
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

    const { id } = await params
    const body = await request.json()

    // 필수 필드 검증
    if (
      !Array.isArray(body.checkedSpotIds) ||
      body.checkedSpotIds.length === 0
    ) {
      return NextResponse.json(
        { error: '인증한 스팟 목록이 필요합니다' },
        { status: 400 }
      )
    }

    if (!body.duration || body.duration <= 0) {
      return NextResponse.json(
        { error: '소요 시간이 필요합니다' },
        { status: 400 }
      )
    }

    const routesCollection = await getCollection<Route>('routes')
    const route = await routesCollection.findOne({ id })

    if (!route) {
      return NextResponse.json(
        { error: '코스를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 완주 기록 생성
    const completionsCollection =
      await getCollection<RouteCompletion>('route_completions')

    const completion: RouteCompletion = {
      id: `RC-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      routeId: id,
      userId: session.user.id,
      checkedSpotIds: body.checkedSpotIds,
      duration: body.duration,
      completedAt: new Date(),
    }

    await completionsCollection.insertOne(completion)

    // completionCount 증가
    await routesCollection.updateOne(
      { id },
      { $inc: { completionCount: 1 }, $set: { updatedAt: new Date() } }
    )

    return NextResponse.json(
      {
        id: completion.id,
        message: '코스 완주가 기록되었습니다',
      },
      { status: 201 }
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error recording completion:', error)
    return NextResponse.json(
      { error: '완주 기록에 실패했습니다' },
      { status: 500 }
    )
  }
}
