import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { auth } from '@/lib/auth'
import { COLLECTIONS, getCollection } from '@/lib/db'
import type { RelatedContent } from '@/types'

interface SpotMediaDocument {
  _id?: ObjectId
  id: string
  name: string
  photos: string[]
  relatedContent?: RelatedContent[]
  updatedAt?: Date
}

interface SceneMediaDocument {
  _id?: ObjectId
  spotId: string
  imageUrl: string
  animeTitle?: string
  episodeInfo?: string
  description?: string
  likeCount: number
  createdAt: Date
  updatedAt?: Date
}

interface SceneMediaInput {
  id?: string
  imageUrl: string
  animeTitle?: string
  episodeInfo?: string
  description?: string
}

async function assertAdmin() {
  const session = await auth()
  return Boolean(session?.user && session.user.role === 'admin')
}

function serializeScene(scene: SceneMediaDocument & { _id: ObjectId }) {
  return {
    id: scene._id.toHexString(),
    spotId: scene.spotId,
    imageUrl: scene.imageUrl,
    animeTitle: scene.animeTitle ?? '',
    episodeInfo: scene.episodeInfo ?? '',
    description: scene.description ?? '',
    likeCount: scene.likeCount ?? 0,
    createdAt: scene.createdAt,
    updatedAt: scene.updatedAt,
  }
}

function cleanUrlList(values: unknown): string[] | null {
  if (!Array.isArray(values)) return null
  return values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
): Promise<NextResponse> {
  if (!(await assertAdmin())) {
    return NextResponse.json(
      { error: 'Admin role is required.' },
      { status: 403 }
    )
  }

  const { spotId } = await params
  const spotsCollection = await getCollection<SpotMediaDocument>(
    COLLECTIONS.SPOTS
  )
  const scenesCollection = await getCollection<
    SceneMediaDocument & { _id: ObjectId }
  >(COLLECTIONS.SCENES)

  const spot = await spotsCollection.findOne({ id: spotId })
  if (!spot) {
    return NextResponse.json({ error: 'Spot not found.' }, { status: 404 })
  }

  const scenes = await scenesCollection
    .find({ spotId })
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json({
    spot: {
      id: spot.id,
      name: spot.name,
      photos: spot.photos ?? [],
      relatedContent: spot.relatedContent ?? [],
    },
    scenes: scenes.map(serializeScene),
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ spotId: string }> }
): Promise<NextResponse> {
  if (!(await assertAdmin())) {
    return NextResponse.json(
      { error: 'Admin role is required.' },
      { status: 403 }
    )
  }

  const { spotId } = await params
  const body = await request.json()
  const now = new Date()
  const spotsCollection = await getCollection<SpotMediaDocument>(
    COLLECTIONS.SPOTS
  )
  const scenesCollection = await getCollection<
    SceneMediaDocument & { _id: ObjectId }
  >(COLLECTIONS.SCENES)

  const spot = await spotsCollection.findOne({ id: spotId })
  if (!spot) {
    return NextResponse.json({ error: 'Spot not found.' }, { status: 404 })
  }

  const photos = cleanUrlList(body.photos)
  if (photos) {
    await spotsCollection.updateOne(
      { id: spotId },
      { $set: { photos, updatedAt: now } }
    )
  }

  if (Array.isArray(body.scenes)) {
    const submittedScenes = body.scenes as SceneMediaInput[]
    const keptIds: ObjectId[] = []

    for (const scene of submittedScenes) {
      const imageUrl = scene.imageUrl?.trim()
      if (!imageUrl) continue

      const update = {
        imageUrl,
        animeTitle: scene.animeTitle?.trim() ?? '',
        episodeInfo: scene.episodeInfo?.trim() || undefined,
        description: scene.description?.trim() || undefined,
        updatedAt: now,
      }

      if (scene.id && ObjectId.isValid(scene.id)) {
        const _id = new ObjectId(scene.id)
        keptIds.push(_id)
        await scenesCollection.updateOne({ _id, spotId }, { $set: update })
      } else {
        const result = await scenesCollection.insertOne({
          spotId,
          ...update,
          likeCount: 0,
          createdAt: now,
        } as SceneMediaDocument & { _id: ObjectId })
        keptIds.push(result.insertedId)
      }
    }

    await scenesCollection.deleteMany({
      spotId,
      ...(keptIds.length > 0 ? { _id: { $nin: keptIds } } : {}),
    })
  }

  return NextResponse.json({ success: true })
}
