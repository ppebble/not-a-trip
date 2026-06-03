import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Scene, CreateSceneInput } from '@/types'
import { ObjectId } from 'mongodb'
import { runtimeLogger } from '@/lib/runtime-logger'

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
    runtimeLogger.error('Error fetching scenes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scenes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/spots/[id]/scenes - 새 장면 추가
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: spotId } = await params
    const body = await request.json()

    const input: CreateSceneInput = {
      spotId,
      imageUrl: body.imageUrl,
      animeTitle: body.animeTitle,
      episodeInfo: body.episodeInfo,
      description: body.description,
    }

    // 유효성 검사 - 이미지 URL만 필수 (작품명은 스팟에서 자동 관리)
    if (!input.imageUrl || input.imageUrl.trim().length === 0) {
      return NextResponse.json(
        { error: '이미지 URL은 필수입니다' },
        { status: 400 }
      )
    }

    const collection = await getCollection<SceneDocument & { _id: ObjectId }>(
      COLLECTIONS.SCENES
    )

    const now = new Date()
    const newScene: SceneDocument = {
      spotId: input.spotId,
      imageUrl: input.imageUrl.trim(),
      animeTitle: input.animeTitle?.trim() || '',
      episodeInfo: input.episodeInfo?.trim(),
      description: input.description?.trim(),
      likeCount: 0,
      createdAt: now,
    }

    const result = await collection.insertOne(
      newScene as SceneDocument & { _id: ObjectId }
    )

    const createdScene: Scene = {
      id: result.insertedId.toHexString(),
      ...newScene,
    }

    return NextResponse.json(createdScene, { status: 201 })
  } catch (error) {
    runtimeLogger.error('Error creating scene:', error)
    return NextResponse.json(
      { error: 'Failed to create scene' },
      { status: 500 }
    )
  }
}
