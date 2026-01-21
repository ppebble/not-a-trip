import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { SpotPin, SpotCategory } from '@/types'

// MongoDB document interface
interface SpotDocument {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  category?: SpotCategory
  relatedMedia: {
    title: string
    type: string
    year?: number
  }[]
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/spots - 모든 스팟 목록 조회 (핀 표시용)
 * Requirements: 1.2, 6.2, 2.2 (카테고리 필터링)
 * Query params:
 *   - category: 카테고리 필터 (쉼표로 구분, 예: animation,sports)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const collection = await getCollection<SpotDocument>('spots')

    // 카테고리 필터 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category')

    // MongoDB 쿼리 조건 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}

    if (categoryParam) {
      const categories = categoryParam.split(',').filter(Boolean)
      if (categories.length > 0) {
        query.category = { $in: categories }
      }
    }

    // Get spots from database with filter
    const spots = await collection.find(query).toArray()

    // Transform to SpotPin format for map display
    const spotPins: SpotPin[] = spots.map((spot) => ({
      id: spot.id,
      name: spot.name,
      coordinates: [spot.coordinates.lat, spot.coordinates.lng],
      thumbnailUrl: spot.photos[0] || '',
      category: spot.category,
    }))

    return NextResponse.json({ spots: spotPins, total: spotPins.length })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching spots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spots' },
      { status: 500 }
    )
  }
}
