'use client'

/**
 * 2D 지구본 폴백 컴포넌트
 * WebGL 미지원 또는 저사양 기기에서 Globe3D 대신 표시
 * Requirements: 5.2, 5.4, 5.5, 7.2, 7.3
 */

interface GlobeFallback2DProps {
  className?: string
}

export function GlobeFallback2D({ className = '' }: GlobeFallback2DProps) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      role="img"
      aria-label="전 세계 성지순례 포인트를 표시하는 지구본 일러스트"
    >
      <svg
        viewBox="0 0 200 200"
        className="h-48 w-48 md:h-64 md:w-64 lg:h-80 lg:w-80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 지구본 배경 원 */}
        <circle
          cx="100"
          cy="100"
          r="90"
          className="fill-primary-100 stroke-primary-300"
          strokeWidth="2"
        />

        {/* 경도선 */}
        <ellipse
          cx="100"
          cy="100"
          rx="90"
          ry="90"
          className="stroke-primary-200"
          strokeWidth="1"
          fill="none"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="60"
          ry="90"
          className="stroke-primary-200"
          strokeWidth="1"
          fill="none"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="30"
          ry="90"
          className="stroke-primary-200"
          strokeWidth="1"
          fill="none"
        />

        {/* 위도선 */}
        <ellipse
          cx="100"
          cy="60"
          rx="78"
          ry="20"
          className="stroke-primary-200"
          strokeWidth="1"
          fill="none"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="90"
          ry="22"
          className="stroke-primary-200"
          strokeWidth="1"
          fill="none"
        />
        <ellipse
          cx="100"
          cy="140"
          rx="78"
          ry="20"
          className="stroke-primary-200"
          strokeWidth="1"
          fill="none"
        />

        {/* 성지순례 포인트 (도쿄, 오사카, 서울 등) */}
        <circle cx="145" cy="72" r="4" className="fill-primary-500" />
        <circle cx="140" cy="80" r="3" className="fill-secondary-500" />
        <circle cx="135" cy="75" r="3.5" className="fill-primary-400" />
        <circle cx="80" cy="90" r="3" className="fill-secondary-400" />
        <circle cx="60" cy="70" r="3" className="fill-primary-400" />
        <circle cx="50" cy="85" r="2.5" className="fill-secondary-500" />

        {/* 포인트 간 연결선 */}
        <line
          x1="145"
          y1="72"
          x2="140"
          y2="80"
          className="stroke-primary-300"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <line
          x1="140"
          y1="80"
          x2="135"
          y2="75"
          className="stroke-primary-300"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <line
          x1="80"
          y1="90"
          x2="60"
          y2="70"
          className="stroke-secondary-300"
          strokeWidth="1"
          strokeDasharray="3 2"
        />

        {/* 글로우 효과 */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          className="stroke-primary-400/30"
          strokeWidth="4"
        />
      </svg>
    </div>
  )
}
