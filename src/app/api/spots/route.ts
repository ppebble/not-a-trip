import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { auth } from '@/lib/auth'
import {
  SpotPin,
  SpotCategory,
  CreateSpotInput,
  RelatedContent,
  ExternalLink,
} from '@/types'
import { validateExternalLinks } from '@/lib/external-link-validation'

/**
 * 정규식 특수문자 이스케이프 처리
 * MongoDB $regex에서 안전하게 사용하기 위함
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, (match) => '\\' + match)
}

/**
 * 다음 스팟 ID 생성 (SPOT-{숫자} 형식)
 * 기존 스팟 중 가장 큰 번호를 찾아서 +1
 */
async function generateSpotId(): Promise<string> {
  const collection = await getCollection<SpotDocument>('spots')

  // SPOT-{숫자} 형식의 ID만 조회
  const spots = await collection
    .find({ id: { $regex: /^SPOT-\d+$/ } })
    .project({ id: 1 })
    .toArray()

  if (spots.length === 0) {
    return 'SPOT-001'
  }

  // 가장 큰 번호 찾기
  const maxNumber = spots.reduce((max, spot) => {
    const match = spot.id.match(/^SPOT-(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      return num > max ? num : max
    }
    return max
  }, 0)

  // 다음 번호 생성 (3자리 패딩)
  const nextNumber = maxNumber + 1
  return `SPOT-${nextNumber.toString().padStart(3, '0')}`
}

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
  externalLinks?: ExternalLink[]
  authorId?: string
  authorName?: string
  isGuestSpot?: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/spots - 모든 스팟 목록 조회 (핀 표시용)
 * Requirements: 1.2, 6.2, 2.2 (카테고리 필터링)
 * Requirements: 6.1, 6.2, 6.3, 6.4 (검색 필터링)
 * Query params:
 *   - category: 카테고리 필터 (쉼표로 구분, 예: animation,sports)
 *   - search: 검색어 필터 (relatedContent.name 부분 일치, 대소문자 무시)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const collection = await getCollection<SpotDocument>('spots')

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')

    // MongoDB 쿼리 조건 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}

    // 카테고리 필터 (Requirements 2.2)
    if (categoryParam) {
      const categories = categoryParam.split(',').filter(Boolean)
      if (categories.length > 0) {
        query.category = { $in: categories }
      }
    }

    // 검색 필터 (Requirements 6.1, 6.2, 6.3, 6.4)
    // - 빈 문자열이 아닌 경우에만 필터 적용 (6.4)
    // - name 또는 relatedContent.name 부분 일치 검색 (6.2)
    // - 대소문자 무시 (6.2)
    // - category와 AND 조건 결합 (6.3)
    if (searchParam && searchParam.trim() !== '') {
      const escapedSearch = escapeRegex(searchParam.trim())
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { 'relatedContent.name': { $regex: escapedSearch, $options: 'i' } },
      ]
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

    // 외부 링크 유효성 검사 (Requirements 3.3, 3.4)
    if (body.externalLinks && body.externalLinks.length > 0) {
      const linkValidation = validateExternalLinks(body.externalLinks)
      if (!linkValidation.isValid) {
        errors.push(...linkValidation.errors)
      }
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
    const spotId = await generateSpotId()
    const newSpot: SpotDocument = {
      id: spotId,
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
      externalLinks: body.externalLinks || [],
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
