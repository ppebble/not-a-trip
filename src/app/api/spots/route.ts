import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/db'
import { Spot, SpotPin } from '@/types'

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
 * GET /api/spots - 모든 스팟 목록 조회 (핀 표시용)
 * Requirements: 1.2, 6.2
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const collection = await getCollection<SpotDocument>('spots')

    // Get all spots from database
    const spots = await collection.find({}).toArray()

    // Transform to SpotPin format for map display
    const spotPins: SpotPin[] = spots.map((spot) => ({
      id: spot._id.toString(),
      name: spot.name,
      coordinates: [spot.coordinates.lat, spot.coordinates.lng],
      thumbnailUrl: spot.photos[0] || '', // Use first photo as thumbnail
    }))

    return NextResponse.json(spotPins)
  } catch (error) {
    console.error('Error fetching spots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spots' },
      { status: 500 }
    )
  }
}
