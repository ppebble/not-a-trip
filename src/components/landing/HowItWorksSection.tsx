/**
 * HowItWorks 섹션
 * "이런 식으로 찾습니다" — 4단계 플로우
 * 서버 컴포넌트 (인터랙션 없음)
 */

const STEPS = [
  {
    step: '01',
    icon: '🔍',
    title: '작품/아티스트 검색',
    description: '좋아하는 애니메이션, 영화, 아티스트 이름으로 검색하세요',
  },
  {
    step: '02',
    icon: '🗺️',
    title: '지도에서 확인',
    description: '전 세계 성지 스팟이 지도 위에 핀으로 표시됩니다',
  },
  {
    step: '03',
    icon: '📸',
    title: '현장 방문 & 인증',
    description: '직접 방문하고 사진으로 순례 인증을 남기세요',
  },
  {
    step: '04',
    icon: '🏅',
    title: '뱃지 & 코스 완성',
    description: '인증을 쌓아 뱃지를 모으고 나만의 순례 코스를 만드세요',
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
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
            이런 식으로{' '}
            <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              찾습니다
            </span>
          </h2>
          <p className="text-base text-white/50 md:text-lg">
            4단계로 나만의 성지순례를 시작하세요
          </p>
        </header>

        {/* 스텝 그리드 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <div
              key={step.step}
              className="relative flex flex-col items-center text-center"
            >
              {/* 연결선 (마지막 제외) */}
              {index < STEPS.length - 1 && (
                <div
                  className="absolute left-[calc(50%+40px)] top-8 hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-primary-500/40 to-primary-500/10 lg:block"
                  aria-hidden="true"
                />
              )}

              {/* 아이콘 원 */}
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary-500/30 bg-primary-500/10 text-2xl">
                {step.icon}
                {/* 스텝 번호 */}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
              </div>

              <h3 className="mb-2 text-base font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/50">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
