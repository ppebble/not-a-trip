import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Scene } from '@/types'
import { ObjectId } from 'mongodb'

// MongoDB document interface
interface SceneDocument {
  _id?: ObjectId
  spotId: string
  imageUrl: string
  animeTitle: string
  episodeInfo?: string
  description?: string
  likeCount: number
  createdAt: Date
}

/**
 * MongoDB 문서를 Scene 타입으로 변환
 */
function documentToScene(doc: SceneDocument & { _id: ObjectId }): Scene {
  return {
    id: doc._id.toHexString(),
    spotId: doc.spotId,
    imageUrl: doc.imageUrl,
    animeTitle: doc.animeTitle,
    episodeInfo: doc.episodeInfo,
    description: doc.description,
    likeCount: doc.likeCount,
    createdAt: doc.createdAt,
  }
}

/**
 * GET /api/spots/[id]/scenes - 스팟의 작품 속 장면 목록 조회
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: spotId } = await params

    const collection = await getCollection<SceneDocument & { _id: ObjectId }>(
      COLLECTIONS.SCENES
    )

    // 좋아요 순으로 정렬하여 조회
    const scenes = await collection
      .find({ spotId })
      .sort({ likeCount: -1, createdAt: -1 })
      .toArray()

    const sceneList: Scene[] = scenes.map(documentToScene)

    return NextResponse.json({ scenes: sceneList, total: sceneList.length })
  } catch (error) {
    console.error('Error fetching scenes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scenes' },
      { status: 500 }
    )
  }
}
