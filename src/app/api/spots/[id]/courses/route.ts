import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'

interface RouteDocument {
  id: string
  name: string
  isPublic: boolean
  spots: Array<{ spotId: string }>
}

/**
 * GET /api/spots/[id]/courses
 * 특정 스팟이 포함된 공개 코스 목록 반환
 * @requirements 4.3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: spotId } = await params

    if (!spotId || typeof spotId !== 'string') {
      return NextResponse.json({ error: 'Invalid spotId' }, { status: 400 })
    }

    const collection = await getCollection<RouteDocument>('routes')
    const routes = await collection
      .find(
        { 'spots.spotId': spotId, isPublic: true },
        { projection: { id: 1, name: 1, _id: 0 } }
      )
      .toArray()

    const courses = routes.map((r) => ({
      id: r.id,
      name: r.name,
    }))

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses for spot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}
