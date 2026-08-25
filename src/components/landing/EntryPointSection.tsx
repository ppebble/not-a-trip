import Link from 'next/link'

/**
 * 랜딩 페이지 정보 탐색 진입점 섹션
 * 서버 컴포넌트 (인터랙션 없음, Link만 사용)
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

interface EntryPoint {
  icon: string
  title: string
  description: string
  href: string
}

const ENTRY_POINTS: EntryPoint[] = [
  {
    icon: '🎬',
    title: '작품별 장소 찾기',
    description: '작품과 아티스트별로 연결된 실제 장소를 모아봅니다',
    href: '/contents',
  },
  {
    icon: '🗺️',
    title: '지도에서 위치 확인',
    description: '지역과 카테고리별 장소를 지도 위에서 비교합니다',
    href: '/map',
  },
  {
    icon: '🧭',
    title: '추천 코스 살펴보기',
    description: '예상 시간과 난이도가 정리된 방문 동선을 확인합니다',
    href: '/routes',
  },
]

export function EntryPointSection() {
  return (
    <section
      className="bg-gradient-to-b from-background via-secondary-50/35 to-sunset-50/30 py-16 dark:via-secondary-500/10 dark:to-background md:py-24"
      aria-label="목적별 진입점"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* 헤더 */}
        <header className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-semibold tracking-[-0.025em] text-main-text md:text-3xl">
            어떤 정보부터{' '}
            <span className="text-primary-600 dark:text-primary-300">
              찾아볼까요?
            </span>
          </h2>
          <p className="text-base leading-7 text-sub-text md:text-lg">
            작품, 위치, 동선 중 지금 필요한 기준으로 바로 시작하세요
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ENTRY_POINTS.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group flex flex-col items-center rounded-[1.5rem] border border-border bg-surface/85 p-8 text-center shadow-sm shadow-secondary-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-secondary-500/45 hover:bg-background hover:shadow-xl hover:shadow-secondary-500/10 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/10"
            >
              {/* 아이콘 */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary-500/20 bg-secondary-500/10 text-3xl transition-transform group-hover:scale-105">
                {entry.icon}
              </div>

              {/* 제목 */}
              <h3 className="mb-2 text-lg font-semibold tracking-[-0.01em] text-main-text">
                {entry.title}
              </h3>

              {/* 설명 */}
              <p className="text-sm leading-relaxed text-sub-text">
                {entry.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
