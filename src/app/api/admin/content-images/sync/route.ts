import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { SpotCategory, ContentType } from '@/types'
import { runtimeLogger } from '@/lib/runtime-logger'

/**
 * MongoDB Spot 문서 인터페이스 (필요한 필드만)
 */
interface SpotDocument {
  _id?: string
  category?: SpotCategory
  relatedContent?: {
    name: string
    type: ContentType
    year?: number
    additionalInfo?: string
    imageUrl?: string
  }[]
}

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
  createdAt: Date
  updatedAt: Date
}

interface ContentAggregate {
  _id: { normalizedName: string }
  displayName?: string
  type?: ContentType
  year?: number
  spotCount?: number
}

/**
 * POST /api/admin/content-images/sync - 콘텐츠 마스터 데이터 동기화
 * 관리자 전용: 모든 스팟의 relatedContent에서 콘텐츠 마스터 데이터 생성/업데이트
 */
export async function POST(): Promise<NextResponse> {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      )
    }

    const spotsCollection = await getCollection<SpotDocument>(COLLECTIONS.SPOTS)
    const contentMastersCollection = await getCollection<ContentMasterDocument>(
      COLLECTIONS.CONTENT_MASTERS
    )

    // 모든 스팟에서 relatedContent 집계
    const pipeline = [
      { $match: { relatedContent: { $exists: true, $ne: [] } } },
      { $unwind: '$relatedContent' },
      {
        $group: {
          _id: {
            normalizedName: {
              $toLower: { $trim: { input: '$relatedContent.name' } },
            },
          },
          displayName: { $first: '$relatedContent.name' },
          type: { $first: '$relatedContent.type' },
          year: { $first: '$relatedContent.year' },
          spotCount: { $sum: 1 },
        },
      },
    ]

    const spotAggregates = await spotsCollection
      .aggregate<ContentAggregate>(pipeline)
      .toArray()

    const relationsCollection = await getCollection(
      COLLECTIONS.SPOT_CONTENT_RELATIONS
    )
    const relationAggregates = await relationsCollection
      .aggregate<ContentAggregate>([
        {
          $match: { status: 'active', contentName: { $exists: true, $ne: '' } },
        },
        {
          $group: {
            _id: {
              normalizedName: {
                $toLower: { $trim: { input: '$contentName' } },
              },
            },
            displayName: { $first: '$contentName' },
            type: { $first: '$contentType' },
            spotIds: { $addToSet: '$spotId' },
          },
        },
        {
          $project: {
            _id: 1,
            displayName: 1,
            type: 1,
            spotCount: { $size: '$spotIds' },
          },
        },
      ])
      .toArray()

    const aggregateMap = new Map<string, ContentAggregate>()
    for (const content of [...spotAggregates, ...relationAggregates]) {
      const normalizedName = content._id.normalizedName as string
      const existing = aggregateMap.get(normalizedName)
      if (!existing) {
        aggregateMap.set(normalizedName, content)
        continue
      }
      existing.spotCount = Math.max(
        Number(existing.spotCount ?? 0),
        Number(content.spotCount ?? 0)
      )
      existing.displayName ||= content.displayName
      existing.type ||= content.type
      existing.year ||= content.year
    }

    const aggregatedContents = Array.from(aggregateMap.values())

    const now = new Date()
    let created = 0
    let updated = 0

    for (const content of aggregatedContents) {
      const normalizedName = content._id.normalizedName as string

      const existing = await contentMastersCollection.findOne({
        normalizedName,
      })

      if (existing) {
        // spotCount만 업데이트 (이미지는 유지)
        await contentMastersCollection.updateOne(
          { normalizedName },
          {
            $set: {
              spotCount: content.spotCount ?? 0,
              updatedAt: now,
            },
          }
        )
        updated++
      } else {
        // 새로 생성
        await contentMastersCollection.insertOne({
          normalizedName,
          displayName: (content.displayName ?? normalizedName).trim(),
          type: content.type,
          year: content.year,
          spotCount: content.spotCount as number,
          createdAt: now,
          updatedAt: now,
        })
        created++
      }
    }

    return NextResponse.json({
      success: true,
      message: `동기화 완료: ${created}개 생성, ${updated}개 업데이트`,
      created,
      updated,
      total: aggregatedContents.length,
    })
  } catch (error) {
    runtimeLogger.error('Error syncing content masters:', error)
    return NextResponse.json(
      { error: '콘텐츠 마스터 동기화에 실패했습니다' },
      { status: 500 }
    )
  }
}
