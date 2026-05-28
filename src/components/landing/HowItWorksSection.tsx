/**
 * HowItWorks 섹션
 * "이런 식으로 찾습니다" — 4단계 플로우
 * 서버 컴포넌트 (인터랙션 없음)
 */

const STEPS = [
  {
    step: '01',
    icon: '🔍',
    title: '떠오른 이름 검색',
    description: '작품, 아티스트, 장소 이름 중 기억나는 것만 입력하세요',
  },
  {
    step: '02',
    icon: '🗺️',
    title: '지도에서 거리감 확인',
    description: '근처 스팟과 이동 흐름을 한눈에 확인합니다',
  },
  {
    step: '03',
    icon: '📸',
    title: '현장에서 기록 남기기',
    description: '방문 사진과 짧은 메모로 그 순간을 저장하세요',
  },
  {
    step: '04',
    icon: '🏅',
    title: '나만의 코스 완성',
    description: '방문 기록이 쌓이면 다음 여행 코스가 더 쉬워집니다',
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-background py-16 md:py-24" aria-label="이용 방법">
      {/* 섹션 디바이더 */}
      <div
        className="mb-16 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4">
        {/* 헤더 */}
        <header className="mb-12 text-center md:mb-16">
          <h2 className="mb-3 text-2xl font-semibold tracking-[-0.025em] text-main-text md:text-3xl lg:text-4xl">
            복잡하게 말고,{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent dark:from-primary-300 dark:to-secondary-300">
              이렇게 찾습니다
            </span>
          </h2>
          <p className="text-base leading-7 text-sub-text md:text-lg">
            검색부터 기록까지 끊기지 않게 이어지는 흐름입니다
          </p>
        </header>

        {/* 스텝 그리드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div
              key={step.step}
              className="relative flex flex-col items-center rounded-[1.5rem] border border-border bg-surface/80 p-6 text-center shadow-sm shadow-primary-500/5 dark:border-white/10 dark:bg-white/[0.05]"
            >
              {/* 연결선 (마지막 제외) */}
              {index < STEPS.length - 1 && (
                <div
                  className="absolute left-[calc(50%+40px)] top-8 hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-primary-500/40 to-primary-500/10 lg:block"
                  aria-hidden="true"
                />
              )}

              {/* 아이콘 원 */}
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary-500/25 bg-primary-500/10 text-2xl">
                {step.icon}
                {/* 스텝 번호 */}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
              </div>

              <h3 className="mb-2 text-base font-semibold tracking-[-0.01em] text-main-text">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-sub-text">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
