import Link from 'next/link'

const INFORMATION_STANDARDS = [
  {
    number: '01',
    title: '작품과 장소를 연결합니다',
    description:
      '작품별로 관련 스팟을 모아 보고, 어떤 장면과 장소가 연결되는지 빠르게 파악할 수 있습니다.',
  },
  {
    number: '02',
    title: '현장 위치를 확인합니다',
    description:
      '지도에서 실제 위치와 주변 스팟을 함께 확인해 이동 거리와 방문 범위를 계획할 수 있습니다.',
  },
  {
    number: '03',
    title: '방문 순서를 제안합니다',
    description:
      '편집 코스의 예상 시간과 난이도, 스팟 순서를 참고해 현실적인 동선을 만들 수 있습니다.',
  },
]

export function InformationStandardsSection() {
  return (
    <section
      className="border-t border-border bg-gradient-to-b from-background to-primary-50/55 py-16 dark:to-primary-900/10 md:py-20"
      aria-labelledby="information-standards-title"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <header>
            <p className="mb-3 text-sm font-semibold text-primary-600 dark:text-primary-300">
              NOT A TRIP INFORMATION GUIDE
            </p>
            <h2
              id="information-standards-title"
              className="text-3xl font-semibold tracking-[-0.035em] text-main-text md:text-4xl"
            >
              방문을 결정하기 전에
              <br />
              필요한 정보를 모았습니다
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-sub-text">
              로그인이나 앱 설치보다 먼저, 작품과 실제 장소를 이해하는 데 필요한
              공개 정보를 제공합니다.
            </p>
            <Link
              href="/routes"
              className="mt-7 inline-flex min-h-11 items-center rounded-full bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              편집 코스 살펴보기
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </Link>
          </header>

          <ol className="grid gap-4">
            {INFORMATION_STANDARDS.map((item) => (
              <li
                key={item.number}
                className="grid gap-3 rounded-[1.5rem] border border-border bg-surface/90 p-6 shadow-sm sm:grid-cols-[3rem_1fr] sm:items-start"
              >
                <span className="text-sm font-bold text-primary-600 dark:text-primary-300">
                  {item.number}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-main-text">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-sub-text md:text-base md:leading-7">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
