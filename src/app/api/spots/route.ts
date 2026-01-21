import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { auth } from '@/lib/auth'
import { SpotPin, SpotCategory, CreateSpotInput, RelatedContent } from '@/types'
import { randomUUID } from 'crypto'

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
  relatedContent?: RelatedContent[]
  authorId?: string
  authorName?: string
  isGuestSpot?: boolean
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

/**
 * POST /api/spots - 새 스팟 등록
 * Requirements: 4.2, 4.6, 4.8
 * - 4.2: 필수 필드 (이름, 설명, 주소, 카테고리)
 * - 4.6: 필수 필드 누락 시 유효성 검사 에러
 * - 4.8: 회원만 스팟 등록 가능
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 인증 확인 (Requirements 4.8)
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const body: CreateSpotInput = await request.json()

    // 필수 필드 유효성 검사 (Requirements 4.6)
    const errors: string[] = []

    if (!body.name?.trim()) {
      errors.push('스팟 이름은 필수입니다')
    } else if (body.name.trim().length < 2) {
      errors.push('스팟 이름은 2자 이상이어야 합니다')
    }

    if (!body.category) {
      errors.push('카테고리를 선택해주세요')
    }

    if (!body.description?.trim()) {
      errors.push('설명은 필수입니다')
    } else if (body.description.trim().length < 10) {
      errors.push('설명은 10자 이상이어야 합니다')
    }

    if (!body.address?.trim()) {
      errors.push('주소는 필수입니다')
    }

    if (!body.coordinates || !body.coordinates.lat || !body.coordinates.lng) {
      errors.push('위치 좌표는 필수입니다')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: '유효성 검사 실패', details: errors },
        { status: 400 }
      )
    }

    const collection = await getCollection<SpotDocument>('spots')

    // 새 스팟 문서 생성
    const now = new Date()
    const newSpot: SpotDocument = {
      id: randomUUID(),
      name: body.name.trim(),
      description: body.description.trim(),
      photos: body.photos || [],
      address: body.address.trim(),
      coordinates: {
        lat: body.coordinates.lat,
        lng: body.coordinates.lng,
      },
      category: body.category,
      relatedMedia: [], // 기존 호환성 유지
      relatedContent: body.relatedContent || [],
      authorId: session.user.id,
      authorName:
        session.user.name || session.user.email?.split('@')[0] || '익명',
      isGuestSpot: false,
      createdAt: now,
      updatedAt: now,
    }

    await collection.insertOne(newSpot)

    return NextResponse.json(
      {
        id: newSpot.id,
        name: newSpot.name,
        message: '스팟이 등록되었습니다',
      },
      { status: 201 }
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating spot:', error)
    return NextResponse.json(
      { error: '스팟 등록에 실패했습니다' },
      { status: 500 }
    )
  }
}
