import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { SpotResponse, MediaInfo } from '@/types'

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

    const collection = await getCollection<SpotDocument>('spots')

    // Find spot by custom id field
    const spot = await collection.findOne({ id })

    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 })
    }

    // Transform to SpotResponse format
    const spotResponse: SpotResponse = {
      id: spot.id,
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
    // eslint-disable-next-line no-console
    console.error('Error fetching spot detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spot detail' },
      { status: 500 }
    )
  }
}
