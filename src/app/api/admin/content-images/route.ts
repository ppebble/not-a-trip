import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { normalizeContentName } from '@/lib/content-utils'
import { ContentType } from '@/types'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

/**
 * MongoDB ContentMaster 문서 인터페이스
 */
interface ContentMasterDocument {
  _id?: string
  normalizedName: string
  displayName: string
  imageUrl?: string
  type?: ContentType
  year?: number
  spotCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/admin/content-images - 콘텐츠 마스터 목록 조회
 * 관리자 전용: 모든 콘텐츠 마스터 데이터 조회
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim() || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const collection = await getCollection<ContentMasterDocument>(
      COLLECTIONS.CONTENT_MASTERS
    )

    // 검색 필터 구성
    const filter: Record<string, unknown> = {}
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.displayName = { $regex: escapedSearch, $options: 'i' }
    }

    // 전체 개수 조회
    const total = await collection.countDocuments(filter)

    // 페이지네이션 적용하여 조회
    const items = await collection
      .find(filter)
      .sort({ spotCount: -1, displayName: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const formattedItems = items.map((item) => ({
      id: item._id?.toString() || item.normalizedName,
      normalizedName: item.normalizedName,
      displayName: item.displayName,
      imageUrl: item.imageUrl,
      type: item.type,
      year: item.year,
      spotCount: item.spotCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    return NextResponse.json({
      items: formattedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching content masters:', error)
    return NextResponse.json(
      { error: '콘텐츠 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/content-images - 콘텐츠 이미지 업로드/업데이트
 * 관리자 전용: 콘텐츠 대표 이미지 설정
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const contentName = formData.get('contentName') as string | null
    const contentType = formData.get('contentType') as ContentType | null
    const year = formData.get('year') as string | null

    if (!contentName) {
      return NextResponse.json(
        { error: '콘텐츠 이름이 필요합니다' },
        { status: 400 }
      )
    }

    const normalizedName = normalizeContentName(contentName)
    const collection = await getCollection<ContentMasterDocument>(
      COLLECTIONS.CONTENT_MASTERS
    )

    let imageUrl: string | undefined

    // 파일이 있으면 업로드
    if (file) {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error:
              '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WEBP만 가능)',
          },
          { status: 400 }
        )
      }

      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: '파일 크기는 5MB 이하여야 합니다' },
          { status: 400 }
        )
      }

      // 파일명 생성
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `content-${timestamp}-${randomStr}.${ext}`

      // 업로드 디렉토리 확인 및 생성
      const uploadDir = path.join(
        process.cwd(),
        'public',
        'uploads',
        'contents'
      )
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // 파일 저장
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)

      imageUrl = `/uploads/contents/${fileName}`
    }

    // 기존 콘텐츠 마스터 조회
    const existing = await collection.findOne({ normalizedName })

    const now = new Date()

    if (existing) {
      // 업데이트
      const updateData: Partial<ContentMasterDocument> = {
        displayName: contentName.trim(),
        updatedAt: now,
      }

      if (imageUrl) {
        updateData.imageUrl = imageUrl
      }
      if (contentType) {
        updateData.type = contentType
      }
      if (year) {
        updateData.year = parseInt(year, 10)
      }

      await collection.updateOne({ normalizedName }, { $set: updateData })

      return NextResponse.json({
        success: true,
        message: '콘텐츠 이미지가 업데이트되었습니다',
        contentMaster: {
          ...existing,
          ...updateData,
          id: existing._id?.toString(),
        },
      })
    } else {
      // 새로 생성
      const newContentMaster: ContentMasterDocument = {
        normalizedName,
        displayName: contentName.trim(),
        imageUrl,
        type: contentType || undefined,
        year: year ? parseInt(year, 10) : undefined,
        spotCount: 0,
        createdAt: now,
        updatedAt: now,
      }

      const result = await collection.insertOne(newContentMaster)

      return NextResponse.json({
        success: true,
        message: '콘텐츠 마스터가 생성되었습니다',
        contentMaster: {
          ...newContentMaster,
          id: result.insertedId.toString(),
        },
      })
    }
  } catch (error) {
    console.error('Error uploading content image:', error)
    return NextResponse.json(
      { error: '콘텐츠 이미지 업로드에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content-images - 콘텐츠 이미지 삭제
 * 관리자 전용: 콘텐츠 대표 이미지 제거
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const normalizedName = searchParams.get('normalizedName')

    if (!normalizedName) {
      return NextResponse.json(
        { error: '콘텐츠 이름이 필요합니다' },
        { status: 400 }
      )
    }

    const collection = await getCollection<ContentMasterDocument>(
      COLLECTIONS.CONTENT_MASTERS
    )

    // 이미지 URL만 제거 (콘텐츠 마스터 자체는 유지)
    const result = await collection.updateOne(
      { normalizedName },
      { $unset: { imageUrl: '' }, $set: { updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '콘텐츠 이미지가 삭제되었습니다',
    })
  } catch (error) {
    console.error('Error deleting content image:', error)
    return NextResponse.json(
      { error: '콘텐츠 이미지 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
