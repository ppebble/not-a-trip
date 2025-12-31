import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/db'
import { SpotResponse, MediaInfo } from '@/types'

// MongoDB document interface (with _id)
interface SpotDocument {
  _id: ObjectId
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  relatedMedia: {
    title: string
    type: string
    year?: number
  }[]
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

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid spot ID format' },
        { status: 400 }
      )
    }

    const collection = await getCollection<SpotDocument>('spots')

    // Find spot by ID
    const spot = await collection.findOne({ _id: new ObjectId(id) })

    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 })
    }

    // Transform to SpotResponse format
    const spotResponse: SpotResponse = {
      id: spot._id.toString(),
      name: spot.name,
      description: spot.description,
      photos: spot.photos,
      address: spot.address,
      coordinates: [spot.coordinates.lat, spot.coordinates.lng],
      relatedMedia: spot.relatedMedia.map((media) => ({
        title: media.title,
        type: media.type as MediaInfo['type'],
        year: media.year,
      })),
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
