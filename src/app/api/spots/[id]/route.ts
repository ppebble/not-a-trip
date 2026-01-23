import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { auth } from '@/lib/auth'
import {
  SpotResponse,
  MediaInfo,
  SpotCategory,
  RelatedContent,
  UpdateSpotInput,
} from '@/types'

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
 * GET /api/spots/[id] - 스팟 상세 정보 조회
 * Requirements: 3.1, 3.2, 6.2
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const collection = await getCollection<SpotDocument>('spots')
    const spot = await collection.findOne({ id })

    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 })
    }

    const spotResponse: SpotResponse = {
      id: spot.id,
      name: spot.name,
      description: spot.description,
      photos: spot.photos,
      address: spot.address,
      coordinates: [spot.coordinates.lat, spot.coordinates.lng],
      category: spot.category,
      relatedMedia: spot.relatedMedia?.map((media) => ({
        title: media.title,
        type: media.type as MediaInfo['type'],
        year: media.year,
      })),
      relatedContent: spot.relatedContent,
      authorId: spot.authorId,
      authorName: spot.authorName,
      isGuestSpot: spot.isGuestSpot,
    }

    return NextResponse.json(spotResponse)
  } catch (error) {
    console.error('Error fetching spot detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spot detail' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/spots/[id] - 스팟 수정
 * Requirements: 6.2
 * - 인증된 사용자만 수정 가능
 * - 본인 스팟 여부 검증 (authorId === userId)
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
    const body: UpdateSpotInput = await request.json()
    const collection = await getCollection<SpotDocument>('spots')

    // 스팟 존재 여부 확인
    const spot = await collection.findOne({ id })
    if (!spot) {
      return NextResponse.json(
        { error: '스팟을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 본인 스팟 여부 검증 (Requirements 6.2)
    if (spot.authorId && spot.authorId !== session.user.id) {
      return NextResponse.json(
        { error: '수정 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 유효성 검사
    const errors: string[] = []
    if (body.name !== undefined && !body.name?.trim()) {
      errors.push('스팟 이름은 필수입니다')
    }
    if (body.description !== undefined && !body.description?.trim()) {
      errors.push('설명은 필수입니다')
    }
    if (body.address !== undefined && !body.address?.trim()) {
      errors.push('주소는 필수입니다')
    }
    if (
      body.coordinates !== undefined &&
      (!body.coordinates.lat || !body.coordinates.lng)
    ) {
      errors.push('위치 좌표는 필수입니다')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: '유효성 검사 실패', details: errors },
        { status: 400 }
      )
    }

    // 업데이트할 필드 구성
    const updateFields: Partial<SpotDocument> = {
      updatedAt: new Date(),
    }

    if (body.name) updateFields.name = body.name.trim()
    if (body.description) updateFields.description = body.description.trim()
    if (body.address) updateFields.address = body.address.trim()
    if (body.coordinates) {
      updateFields.coordinates = {
        lat: body.coordinates.lat,
        lng: body.coordinates.lng,
      }
    }
    if (body.category) updateFields.category = body.category
    if (body.photos) updateFields.photos = body.photos
    if (body.relatedContent) updateFields.relatedContent = body.relatedContent

    await collection.updateOne({ id }, { $set: updateFields })

    return NextResponse.json({
      id,
      message: '스팟이 수정되었습니다',
    })
  } catch (error) {
    console.error('Error updating spot:', error)
    return NextResponse.json(
      { error: '스팟 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/spots/[id] - 스팟 삭제
 * Requirements: 6.4
 * - 인증된 사용자만 삭제 가능
 * - 본인 스팟 여부 검증
 * - 연관 데이터 (scenes, posts) 처리
 */
export async function DELETE(
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
    const collection = await getCollection<SpotDocument>('spots')

    // 스팟 존재 여부 확인
    const spot = await collection.findOne({ id })
    if (!spot) {
      return NextResponse.json(
        { error: '스팟을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 본인 스팟 여부 검증
    if (spot.authorId && spot.authorId !== session.user.id) {
      return NextResponse.json(
        { error: '삭제 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 연관 데이터 삭제 (scenes)
    const scenesCollection = await getCollection('scenes')
    await scenesCollection.deleteMany({ spotId: id })

    // 연관 데이터 삭제 (posts - spotId 연결 해제)
    const postsCollection = await getCollection('posts')
    await postsCollection.updateMany({ spotId: id }, { $unset: { spotId: '' } })

    // 스팟 삭제
    await collection.deleteOne({ id })

    return NextResponse.json({
      message: '스팟이 삭제되었습니다',
    })
  } catch (error) {
    console.error('Error deleting spot:', error)
    return NextResponse.json(
      { error: '스팟 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
