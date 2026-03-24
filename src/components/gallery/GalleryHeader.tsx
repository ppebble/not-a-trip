'use client'

/**
 * GalleryHeader 컴포넌트
 * 순례 갤러리 페이지의 헤더 영역을 담당합니다.
 *
 * Requirements:
 * - 5.1: "순례 갤러리" 페이지 제목 표시
 * - 5.2: "오타쿠들의 발자취" 부제목 표시
 * - 5.3: 총 인증 수, 오늘 인증 수 통계 표시
 */

export interface GalleryHeaderProps {
  totalCheckIns: number
  todayCheckIns: number
}

export function GalleryHeader({
  totalCheckIns,
  todayCheckIns,
}: GalleryHeaderProps) {
  return (
    <header className="border-navy-200 border-b bg-white px-4 py-6">
      <div className="mx-auto max-w-6xl">
        {/* 페이지 제목 - Requirements 5.1 */}
        <h1 className="text-navy-800 text-2xl font-bold">순례 갤러리</h1>

        {/* 부제목 - Requirements 5.2 */}
        <p className="text-navy-500 mt-1 text-sm">오타쿠들의 발자취</p>

        {/* 통계 영역 - Requirements 5.3 */}
        <div className="mt-4 flex gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="bg-navy-100 flex h-8 w-8 items-center justify-center rounded-full">
              📸
            </span>
            <div>
              <span className="text-navy-700 font-semibold">총 인증</span>{' '}
              <span className="text-navy-600 font-bold">
                {totalCheckIns.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              🔥
            </span>
            <div>
              <span className="text-navy-700 font-semibold">오늘 인증</span>{' '}
              <span className="font-bold text-green-600">
                {todayCheckIns.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default GalleryHeader
