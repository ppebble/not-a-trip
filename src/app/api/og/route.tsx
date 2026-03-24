import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { CATEGORY_CONFIG, type SpotCategory } from '@/types/spot'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

// ============================================
// 타입 정의
// ============================================

interface SpotOgData {
  name: string
  category?: SpotCategory
  address: string
}

interface RouteOgData {
  name: string
  spotCount: number
}

// ============================================
// 브랜드 상수
// ============================================

const BRAND_COLOR = '#4164a5'
const BRAND_BG = '#f0f4fa'

// OG 이미지 서버사이드 렌더링용 카테고리 컬러 폴백 (CSS 변수 사용 불가)
const OG_CATEGORY_COLORS: Record<SpotCategory, { bg: string; fg: string }> = {
  animation: { bg: '#E8DEFC', fg: '#5D448E' },
  sports: { bg: '#C7ECE8', fg: '#166E64' },
  movie_drama: { bg: '#C7DEFC', fg: '#224982' },
  music: { bg: '#D1EEDC', fg: '#226C3E' },
  game: { bg: '#F5DAF0', fg: '#803070' },
  other: { bg: '#E6E4E2', fg: '#4E4844' },
}
const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630

// ============================================
// 폰트 로드
// ============================================

async function loadFonts(): Promise<
  { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[]
> {
  try {
    const fontsDir = path.join(process.cwd(), 'src', 'assets', 'fonts')
    const [regularData, boldData] = await Promise.all([
      fs.readFile(path.join(fontsDir, 'PretendardRegular.ttf')),
      fs.readFile(path.join(fontsDir, 'PretendardBold.ttf')),
    ])

    return [
      {
        name: 'Pretendard',
        data: regularData.buffer as ArrayBuffer,
        weight: 400,
        style: 'normal' as const,
      },
      {
        name: 'Pretendard',
        data: boldData.buffer as ArrayBuffer,
        weight: 700,
        style: 'normal' as const,
      },
    ]
  } catch {
    return []
  }
}

// ============================================
// 데이터 조회
// ============================================

async function getSpotData(id: string): Promise<SpotOgData | null> {
  try {
    const collection = await getCollection(COLLECTIONS.SPOTS)
    const spot = await collection.findOne(
      { id },
      { projection: { name: 1, category: 1, address: 1 } }
    )
    if (!spot) return null
    return {
      name: spot.name as string,
      category: spot.category as SpotCategory | undefined,
      address: (spot.address as string) || '',
    }
  } catch {
    return null
  }
}

async function getRouteData(id: string): Promise<RouteOgData | null> {
  try {
    const collection = await getCollection(COLLECTIONS.ROUTES)
    const route = await collection.findOne(
      { id },
      { projection: { name: 1, spots: 1 } }
    )
    if (!route) return null
    const spots = (route.spots as Array<unknown>) || []
    return {
      name: route.name as string,
      spotCount: spots.length,
    }
  } catch {
    return null
  }
}

// ============================================
// OG 이미지 컴포넌트
// ============================================

function DefaultOgImage() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BRAND_BG,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: BRAND_COLOR,
            letterSpacing: '-1px',
          }}
        >
          Not a Trip
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#6b7280',
          }}
        >
          팬들만 아는 특별한 여행지
        </div>
      </div>
    </div>
  )
}

function SpotOgImage({ spot }: { spot: SpotOgData }) {
  const categoryLabel = spot.category
    ? CATEGORY_CONFIG[spot.category].label
    : null
  const categoryColors = spot.category
    ? OG_CATEGORY_COLORS[spot.category]
    : { bg: '#E6E4E2', fg: '#4E4844' }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BRAND_BG,
        padding: '60px',
      }}
    >
      {/* 상단 브랜드 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: BRAND_COLOR,
          }}
        >
          Not a Trip
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center',
          gap: '20px',
        }}
      >
        {/* 카테고리 뱃지 */}
        {categoryLabel && (
          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: categoryColors.bg,
                color: categoryColors.fg,
                fontSize: '20px',
                fontWeight: 700,
                padding: '8px 20px',
                borderRadius: '24px',
              }}
            >
              {categoryLabel}
            </div>
          </div>
        )}

        {/* 스팟 이름 */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#1f2937',
            lineHeight: 1.2,
            maxWidth: '900px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {spot.name}
        </div>

        {/* 주소 */}
        {spot.address && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '24px',
              color: '#6b7280',
            }}
          >
            <span>📍</span>
            <span>{spot.address}</span>
          </div>
        )}
      </div>

      {/* 하단 장식 라인 */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '6px',
          backgroundColor: BRAND_COLOR,
          borderRadius: '3px',
        }}
      />
    </div>
  )
}

function RouteOgImage({ route }: { route: RouteOgData }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: BRAND_BG,
        padding: '60px',
      }}
    >
      {/* 상단 브랜드 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: BRAND_COLOR,
          }}
        >
          Not a Trip
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'center',
          gap: '20px',
        }}
      >
        {/* 코스 뱃지 */}
        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: BRAND_COLOR,
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 700,
              padding: '8px 20px',
              borderRadius: '24px',
            }}
          >
            🗺️ 코스
          </div>
        </div>

        {/* 코스 이름 */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#1f2937',
            lineHeight: 1.2,
            maxWidth: '900px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {route.name}
        </div>

        {/* 스팟 수 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '24px',
            color: '#6b7280',
          }}
        >
          <span>📍</span>
          <span>{route.spotCount}개 스팟</span>
        </div>
      </div>

      {/* 하단 장식 라인 */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '6px',
          backgroundColor: BRAND_COLOR,
          borderRadius: '3px',
        }}
      />
    </div>
  )
}

// ============================================
// GET 핸들러
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') || 'default'
  const id = searchParams.get('id') || ''

  const fonts = await loadFonts()
  const fontFamily = fonts.length > 0 ? 'Pretendard' : 'sans-serif'

  try {
    let element: React.ReactElement

    if (type === 'spot' && id) {
      const spot = await getSpotData(id)
      element = spot ? <SpotOgImage spot={spot} /> : <DefaultOgImage />
    } else if (type === 'route' && id) {
      const route = await getRouteData(id)
      element = route ? <RouteOgImage route={route} /> : <DefaultOgImage />
    } else {
      element = <DefaultOgImage />
    }

    // fontFamily를 래퍼에 적용
    const wrapped = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily,
        }}
      >
        {element}
      </div>
    )

    return new ImageResponse(wrapped, {
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      ...(fonts.length > 0 ? { fonts } : {}),
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  } catch {
    // 렌더링 오류 시 기본 브랜드 이미지 반환
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily: 'sans-serif',
        }}
      >
        <DefaultOgImage />
      </div>,
      {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        headers: {
          'Cache-Control':
            'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    )
  }
}
