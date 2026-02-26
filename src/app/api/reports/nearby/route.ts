import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { auth } from '@/lib/auth'
import { calculateDistance, getBoundingBox } from '@/lib/geo-utils'

const NEARBY_RADIUS_METERS = 50

/**
 * GET /api/reports/nearby - 반경 50m 이내 기존 스팟/제보 검색
 * Requirements: 1.3
 * Query params:
 *   - lat: 위도 (필수)
 *   - lng: 경도 (필수)
 *
 * 바운딩 박스로 1차 필터 → Haversine으로 50m 이내 정밀 필터
 * spots 컬렉션과 spot_reports(pending) 컬렉션 모두 검색
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const latStr = searchParams.get('lat')
    const lngStr = searchParams.get('lng')

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: '위도(lat)와 경도(lng)는 필수입니다' },
        { status: 400 }
      )
    }

    const lat = parseFloat(latStr)
    const lng = parseFloat(lngStr)

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: '유효한 좌표를 입력해주세요' },
        { status: 400 }
      )
    }

    // 바운딩 박스 계산 (MongoDB 쿼리 최적화)
    const bbox = getBoundingBox(lat, lng, NEARBY_RADIUS_METERS)

    const bboxQuery = {
      'coordinates.lat': { $gte: bbox.minLat, $lte: bbox.maxLat },
      'coordinates.lng': { $gte: bbox.minLng, $lte: bbox.maxLng },
    }

    // 기존 스팟 검색
    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
    const nearbySpotCandidates = await spotsCollection
      .find(bboxQuery)
      .project({ id: 1, name: 1, coordinates: 1, category: 1, photos: 1 })
      .toArray()

    // 대기중 제보 검색
    const reportsCollection = await getCollection(COLLECTIONS.SPOT_REPORTS)
    const nearbyReportCandidates = await reportsCollection
      .find({ ...bboxQuery, status: 'pending' })
      .project({ id: 1, name: 1, coordinates: 1, category: 1, status: 1 })
      .toArray()

    // Haversine으로 정밀 필터링
    const nearbySpots = nearbySpotCandidates
      .filter((spot) => {
        const dist = calculateDistance(
          lat,
          lng,
          spot.coordinates.lat,
          spot.coordinates.lng
        )
        return dist <= NEARBY_RADIUS_METERS
      })
      .map((spot) => ({
        id: spot.id,
        name: spot.name,
        coordinates: spot.coordinates,
        category: spot.category,
        thumbnailUrl: spot.photos?.[0] || '',
        type: 'spot' as const,
        distance: Math.round(
          calculateDistance(
            lat,
            lng,
            spot.coordinates.lat,
            spot.coordinates.lng
          )
        ),
      }))

    const nearbyReports = nearbyReportCandidates
      .filter((report) => {
        const dist = calculateDistance(
          lat,
          lng,
          report.coordinates.lat,
          report.coordinates.lng
        )
        return dist <= NEARBY_RADIUS_METERS
      })
      .map((report) => ({
        id: report.id,
        name: report.name,
        coordinates: report.coordinates,
        category: report.category,
        type: 'report' as const,
        distance: Math.round(
          calculateDistance(
            lat,
            lng,
            report.coordinates.lat,
            report.coordinates.lng
          )
        ),
      }))

    return NextResponse.json({
      nearby: [...nearbySpots, ...nearbyReports],
      total: nearbySpots.length + nearbyReports.length,
      radius: NEARBY_RADIUS_METERS,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error searching nearby:', error)
    return NextResponse.json(
      { error: '근처 검색에 실패했습니다' },
      { status: 500 }
    )
  }
}
