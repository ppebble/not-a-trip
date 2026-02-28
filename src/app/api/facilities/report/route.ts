import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { FacilityType, OtakuFacilityType } from '@/types'
import { OtakuFacilityDetails } from '@/types/facility'
import { VALID_FACILITY_TYPES } from '@/lib/facility-utils'

const OTAKU_FACILITY_TYPES: OtakuFacilityType[] = [
  'coin_locker',
  'solo_dining',
  'charging_cafe',
  'public_restroom',
  'goods_shop',
]

/**
 * POST /api/facilities/report — 편의시설 제보 API
 * Requirements: 7.3, 7.4
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // 필수 필드 검증
    const missingFields: string[] = []

    if (!body.name || typeof body.name !== 'string') {
      missingFields.push('name')
    }

    if (
      !body.type ||
      typeof body.type !== 'string' ||
      !VALID_FACILITY_TYPES.includes(body.type as FacilityType)
    ) {
      missingFields.push('type')
    }

    if (
      !body.coordinates ||
      typeof body.coordinates !== 'object' ||
      typeof body.coordinates.lat !== 'number' ||
      typeof body.coordinates.lng !== 'number'
    ) {
      missingFields.push('coordinates')
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다', missingFields },
        { status: 400 }
      )
    }

    // otakuDetails 처리: OtakuFacilityType이면서 otakuDetails가 제공된 경우
    let otakuDetails: OtakuFacilityDetails | undefined
    if (
      OTAKU_FACILITY_TYPES.includes(body.type as OtakuFacilityType) &&
      body.otakuDetails
    ) {
      otakuDetails = {
        type: body.type as OtakuFacilityType,
        details: body.otakuDetails,
      } as OtakuFacilityDetails
    }

    const now = new Date()

    const facilityDoc = {
      name: body.name,
      type: body.type,
      coordinates: {
        lat: body.coordinates.lat,
        lng: body.coordinates.lng,
      },
      address: body.address || '',
      googlePlaceId: body.googlePlaceId || undefined,
      otakuDetails,
      status: 'active' as const,
      verificationScore: 50,
      upvotes: 0,
      downvotes: 0,
      reportedBy: body.reportedBy || undefined,
      createdAt: now,
      updatedAt: now,
    }

    const collection = await getCollection('facilities')
    const result = await collection.insertOne(facilityDoc)

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        ...facilityDoc,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error reporting facility:', error)
    return NextResponse.json(
      { error: '편의시설 제보에 실패했습니다' },
      { status: 500 }
    )
  }
}
