import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { normalizeContentName } from '@/lib/content-utils'
import { ContentType } from '@/types'

/**
 * MongoDB ContentMaster 문서 인터페이스
 */
interface ContentMasterDocument {
  normalizedName: string
  displayName: string
  imageUrl?: string
  type?: ContentType
  year?: number
  spotCount: number
}

/**
 * GET /api/content-images - 콘텐츠 이미지 조회 (공개 API)
 * 스팟 등록 시 기존 콘텐츠 이미지 자동 적용에 사용
 *
 * Query params:
 *   - names: 콘텐츠 이름 목록 (쉼표로 구분)
 *
 * Response:
 *   - images: { [normalizedName]: imageUrl } 형태의 맵
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const namesParam = searchParams.get('names')

    if (!namesParam) {
      return NextResponse.json({ images: {} })
    }

    const names = namesParam
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)

    if (names.length === 0) {
      return NextResponse.json({ images: {} })
    }

    // 정규화된 이름 목록 생성
    const normalizedNames = names.map(normalizeContentName)

    const collection = await getCollection<ContentMasterDocument>(
      COLLECTIONS.CONTENT_MASTERS
    )

    // 이미지가 있는 콘텐츠만 조회
    const contentMasters = await collection
      .find({
        normalizedName: { $in: normalizedNames },
        imageUrl: { $exists: true, $ne: '' },
      })
      .toArray()

    // 정규화된 이름 -> 이미지 URL 맵 생성
    const images: Record<string, string> = {}
    for (const cm of contentMasters) {
      if (cm.imageUrl) {
        images[cm.normalizedName] = cm.imageUrl
      }
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error fetching content images:', error)
    return NextResponse.json(
      { error: '콘텐츠 이미지 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
