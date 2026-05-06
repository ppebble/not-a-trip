import Link from 'next/link'

/**
 * 랜딩 페이지 목적별 진입점 섹션
 * "작품으로 찾기", "코스로 따라가기", "인증 둘러보기" 3개 카드 진입점
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
    title: '작품으로 찾기',
    description: '좋아하는 작품의 성지를 탐색하세요',
    href: '/contents',
  },
  {
    icon: '🗺️',
    title: '코스로 따라가기',
    description: '큐레이션된 순례 코스를 따라가세요',
    href: '/routes',
  },
  {
    icon: '📸',
    title: '인증 둘러보기',
    description: '다른 순례자들의 인증을 구경하세요',
    href: '/gallery',
  },
]

export function EntryPointSection() {
  return (
    <section
      className="bg-background py-16 md:py-24"
      aria-label="목적별 진입점"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* 헤더 */}
        <header className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            어떤 방식으로{' '}
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              탐색
            </span>
            할까요?
          </h2>
          <p className="text-base text-white/50 md:text-lg">
            목적에 맞는 경로를 선택하세요
          </p>
        </header>

        {/* 진입점 카드 그리드 — 모바일 세로 스택, 태블릿 이상 가로 병렬 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ENTRY_POINTS.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-8 text-center transition-all hover:border-primary-500/50 hover:bg-white/10 hover:shadow-lg hover:shadow-primary-500/10"
            >
              {/* 아이콘 */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary-500/30 bg-primary-500/10 text-3xl transition-transform group-hover:scale-110">
                {entry.icon}
              </div>

              {/* 제목 */}
              <h3 className="mb-2 text-lg font-semibold text-white">
                {entry.title}
              </h3>

              {/* 설명 */}
              <p className="text-sm leading-relaxed text-white/50">
                {entry.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
