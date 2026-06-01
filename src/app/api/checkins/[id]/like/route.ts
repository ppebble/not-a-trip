import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { getClientIp } from '@/lib/security'

const CHECKIN_ID_PATTERN = /^CHECKIN-\d+$/

interface CheckInDocument {
  id: string
  likeCount?: number
}

interface CheckInLikeDocument {
  checkInId: string
  identityKey: string
  identityType: 'user' | 'guest'
  userId?: string
  deviceId?: string
  createdAt: Date
}

function getGuestIdentity(request: NextRequest): string {
  const deviceId = request.headers.get('x-device-id')?.trim()
  const ip = getClientIp(request)

  return `guest:${deviceId || 'no-device'}:${ip}`
}

async function resolveIdentity(request: NextRequest): Promise<{
  identityKey: string
  identityType: 'user' | 'guest'
  userId?: string
  deviceId?: string
}> {
  const session = await auth()
  const userId = session?.user?.id
  const deviceId = request.headers.get('x-device-id')?.trim() || undefined

  if (userId) {
    return {
      identityKey: `user:${userId}`,
      identityType: 'user',
      userId,
      deviceId,
    }
  }

  return {
    identityKey: getGuestIdentity(request),
    identityType: 'guest',
    deviceId,
  }
}

async function findCheckIn(id: string): Promise<CheckInDocument | null> {
  const checkinsCollection = await getCollection<CheckInDocument>(
    COLLECTIONS.CHECKINS
  )
  return checkinsCollection.findOne({ id })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    if (!CHECKIN_ID_PATTERN.test(id)) {
      return NextResponse.json(
        { error: 'Invalid check-in ID' },
        { status: 400 }
      )
    }

    const checkIn = await findCheckIn(id)
    if (!checkIn) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 })
    }

    const identity = await resolveIdentity(request)
    const likesCollection = await getCollection<CheckInLikeDocument>(
      COLLECTIONS.CHECKIN_LIKES
    )
    const existingLike = await likesCollection.findOne({
      checkInId: id,
      identityKey: identity.identityKey,
    })

    return NextResponse.json({
      liked: !!existingLike,
      likeCount: checkIn.likeCount ?? 0,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting check-in like status:', error)
    return NextResponse.json(
      { error: 'Failed to get check-in like status' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    if (!CHECKIN_ID_PATTERN.test(id)) {
      return NextResponse.json(
        { error: 'Invalid check-in ID' },
        { status: 400 }
      )
    }

    const checkinsCollection = await getCollection<CheckInDocument>(
      COLLECTIONS.CHECKINS
    )
    const checkIn = await checkinsCollection.findOne({ id })
    if (!checkIn) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 })
    }

    const identity = await resolveIdentity(request)
    const likesCollection = await getCollection<CheckInLikeDocument>(
      COLLECTIONS.CHECKIN_LIKES
    )
    const existingLike = await likesCollection.findOne({
      checkInId: id,
      identityKey: identity.identityKey,
    })

    if (existingLike) {
      await likesCollection.deleteOne({
        checkInId: id,
        identityKey: identity.identityKey,
      })
      const updated = await checkinsCollection.findOneAndUpdate(
        { id, likeCount: { $gt: 0 } },
        { $inc: { likeCount: -1 }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after' }
      )

      return NextResponse.json({
        success: true,
        liked: false,
        likeCount: updated?.likeCount ?? 0,
      })
    }

    await likesCollection.insertOne({
      checkInId: id,
      identityKey: identity.identityKey,
      identityType: identity.identityType,
      userId: identity.userId,
      deviceId: identity.deviceId,
      createdAt: new Date(),
    })

    const updated = await checkinsCollection.findOneAndUpdate(
      { id },
      { $inc: { likeCount: 1 }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount: updated?.likeCount ?? (checkIn.likeCount ?? 0) + 1,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error toggling check-in like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle check-in like' },
      { status: 500 }
    )
  }
}
