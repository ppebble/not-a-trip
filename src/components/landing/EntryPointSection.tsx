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
    description: '이름만 떠올라도 관련 스팟을 바로 모아볼 수 있어요',
    href: '/contents',
  },
  {
    icon: '🗺️',
    title: '코스로 따라가기',
    description: '처음 가는 도시에서도 순서대로 따라가면 됩니다',
    href: '/routes',
  },
  {
    icon: '📸',
    title: '인증 둘러보기',
    description: '다른 팬들의 사진과 후기로 분위기를 먼저 확인해요',
    href: '/gallery',
  },
]

export function EntryPointSection() {
  return (
    <section
      className="bg-gradient-to-b from-background to-primary-50/40 py-16 dark:to-background md:py-24"
      aria-label="목적별 진입점"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* 헤더 */}
        <header className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-semibold tracking-[-0.025em] text-main-text md:text-3xl">
            오늘은 어떻게{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent dark:from-primary-300 dark:to-secondary-300">
              떠나볼까요?
            </span>
          </h2>
          <p className="text-base leading-7 text-sub-text md:text-lg">
            원하는 시작점만 고르면 나머지는 자연스럽게 이어집니다
          </p>
        </header>

        {/* 진입점 카드 그리드 — 모바일 세로 스택, 태블릿 이상 가로 병렬 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ENTRY_POINTS.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="group flex flex-col items-center rounded-[1.5rem] border border-border bg-surface/85 p-8 text-center shadow-sm shadow-primary-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary-500/45 hover:bg-background hover:shadow-xl hover:shadow-primary-500/10 dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/10"
            >
              {/* 아이콘 */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-500/10 text-3xl transition-transform group-hover:scale-105">
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
