import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { SpotPin } from '@/types'

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
 * GET /api/spots - 모든 스팟 목록 조회 (핀 표시용)
 * Requirements: 1.2, 6.2
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const collection = await getCollection<SpotDocument>('spots')

    // Get all spots from database
    const spots = await collection.find({}).toArray()

    // Transform to SpotPin format for map display
    const spotPins: SpotPin[] = spots.map((spot) => ({
      id: spot.id,
      name: spot.name,
      coordinates: [spot.coordinates.lat, spot.coordinates.lng],
      thumbnailUrl: spot.photos[0] || '',
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
