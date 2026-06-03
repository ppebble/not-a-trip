import { runtimeLogger } from '@/lib/runtime-logger'
import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/db'
import {
  NearbyFacility,
  FacilityType,
  FacilityStatus,
  OtakuFacilityDetails,
} from '@/types'
import { VALID_FACILITY_TYPES } from '@/lib/facility-utils'

interface SpotDocument {
  id: string
  coordinates: {
    lat: number
    lng: number
  }
}

type FacilityCoordinates = { lat: number; lng: number } | [number, number]

interface FacilityDocument {
  _id: ObjectId
  name: string
  type: string
  address: string
  coordinates: FacilityCoordinates
  status?: FacilityStatus
  verificationScore?: number
  upvotes?: number
  downvotes?: number
  googlePlaceId?: string
  otakuDetails?: OtakuFacilityDetails
  reportedBy?: string
  createdAt?: Date
  updatedAt?: Date
}

type MappedFacility = NearbyFacility | null

const FILTERABLE_STATUSES: FacilityStatus[] = ['active', 'needs_verification']

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const r = 6371000
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return r * c
}

function normalizeCoordinates(
  coordinates: FacilityCoordinates
): { lat: number; lng: number } | null {
  if (Array.isArray(coordinates)) {
    if (coordinates.length !== 2) return null

    const [lat, lng] = coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return null
    }

    return { lat, lng }
  }

  if (
    coordinates &&
    typeof coordinates.lat === 'number' &&
    typeof coordinates.lng === 'number'
  ) {
    return coordinates
  }

  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const radiusKm = parseFloat(searchParams.get('radius') || '2')
    const maxResults = parseInt(searchParams.get('limit') || '50')
    const typeFilter = searchParams.get('type')
    const statusFilter = searchParams.get('status')

    const spotsCollection = await getCollection<SpotDocument>('spots')
    const spot = await spotsCollection.findOne(
      { id },
      { projection: { coordinates: 1 } }
    )

    if (!spot) {
      return NextResponse.json({ error: 'Spot not found' }, { status: 404 })
    }

    const query: Record<string, unknown> = {
      status: { $ne: 'hidden' },
    }

    if (
      typeFilter &&
      VALID_FACILITY_TYPES.includes(typeFilter as FacilityType)
    ) {
      query.type = typeFilter
    }

    if (
      statusFilter &&
      FILTERABLE_STATUSES.includes(statusFilter as FacilityStatus)
    ) {
      query.status = statusFilter
    }

    const facilitiesCollection =
      await getCollection<FacilityDocument>('facilities')
    const allFacilities = await facilitiesCollection.find(query).toArray()

    const nearbyFacilities = allFacilities
      .map((facility): MappedFacility => {
        const coordinates = normalizeCoordinates(facility.coordinates)
        if (!coordinates) {
          return null
        }

        const distance = calculateDistance(
          spot.coordinates.lat,
          spot.coordinates.lng,
          coordinates.lat,
          coordinates.lng
        )

        const mapped: NearbyFacility = {
          id: facility._id.toString(),
          name: facility.name,
          type: facility.type as FacilityType,
          distance: Math.round(distance),
          address: facility.address,
          coordinates: [coordinates.lat, coordinates.lng] as [number, number],
          status: facility.status,
          verificationScore: facility.verificationScore,
          upvotes: facility.upvotes,
          downvotes: facility.downvotes,
          googlePlaceId: facility.googlePlaceId,
          otakuDetails: facility.otakuDetails,
          reportedBy: facility.reportedBy,
          createdAt: facility.createdAt?.toISOString(),
          updatedAt: facility.updatedAt?.toISOString(),
        }

        return mapped
      })
      .filter((facility): facility is NearbyFacility => facility !== null)
      .filter((facility) => facility.distance <= radiusKm * 1000)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxResults)

    return NextResponse.json(nearbyFacilities)
  } catch (error) {
    runtimeLogger.error('Error fetching nearby facilities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch nearby facilities' },
      { status: 500 }
    )
  }
}
