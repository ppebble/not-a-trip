import { NextRequest, NextResponse } from 'next/server'
import { checkDuplicates } from '@/lib/spot-quality/duplicate-detector'

/**
 * GET /api/reports/nearby - 반경 이내 기존 스팟/제보 검색 + 중복 감지
 * Requirements: 1.1, 1.2, 1.3, 1.4
 * Query params:
 *   - lat: 위도 (필수)
 *   - lng: 경도 (필수)
 *   - name: 스팟 이름 (선택, 유사도 계산에 사용)
 *   - radius: 검색 반경 미터 (선택, 기본 200m)
 *
 * checkDuplicates 호출 후 { nearby, highDuplicates, proximityWarnings } 반환
 * 중복 감지 실패 시 graceful degradation (경고 없이 진행 허용)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const name = searchParams.get('name') ?? ''
  const radius = parseInt(searchParams.get('radius') ?? '200', 10)

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'lat, lng 파라미터가 필요합니다.' },
      { status: 400 }
    )
  }

  try {
    const result = await checkDuplicates({ lat, lng }, name, {
      searchRadius: radius,
    })
    return NextResponse.json({
      nearby: result.nearbyItems,
      highDuplicates: result.highDuplicates,
      proximityWarnings: result.proximityWarnings,
    })
  } catch (error) {
    // graceful degradation: 중복 감지 실패 시 경고 없이 진행 허용
    // eslint-disable-next-line no-console
    console.warn('[/api/reports/nearby] duplicate check failed:', error)
    return NextResponse.json({
      nearby: [],
      highDuplicates: [],
      proximityWarnings: [],
    })
  }
}
