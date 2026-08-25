import fs from 'fs'
import path from 'path'

const projectRoot = path.resolve(__dirname, '../../../../')

function read(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

describe('information-first landing contract', () => {
  it('keeps the landing sequence focused on public discovery information', () => {
    const page = read('src/app/(landing)/welcome/page.tsx')
    const client = read('src/components/landing/WelcomePageClient.tsx')

    expect(page).toContain('fetchShowcaseSpots')
    expect(page).toContain('fetchCategoryImages')
    expect(page).not.toContain('fetchProofImages')

    expect(client).toContain('<HeroSection')
    expect(client).toContain('<EntryPointSection />')
    expect(client).toContain('<StorytellingSection')
    expect(client).toContain('<InformationStandardsSection />')
    expect(client).not.toContain('<SocialProofSection')
    expect(client).not.toContain('<ConversionSection')
    expect(client).not.toContain('<FloatingCTA')
    expect(client).not.toContain('proofImages')
  })

  it('routes the three primary entry points to information surfaces', () => {
    const entryPoints = read('src/components/landing/EntryPointSection.tsx')

    expect(entryPoints).toContain("href: '/contents'")
    expect(entryPoints).toContain("href: '/map'")
    expect(entryPoints).toContain("href: '/routes'")
    expect(entryPoints).not.toContain("href: '/gallery'")
    expect(entryPoints).toContain('작품별 장소 찾기')
    expect(entryPoints).toContain('지도에서 위치 확인')
    expect(entryPoints).toContain('추천 코스 살펴보기')
  })

  it('does not present static testimonials as current community activity', () => {
    const hero = read('src/components/landing/HeroSection.tsx')
    const entryPoints = read('src/components/landing/EntryPointSection.tsx')

    expect(hero).not.toContain('팬들이 남긴 실제 장소')
    expect(entryPoints).not.toContain('다른 팬들의 사진과 후기')
    expect(hero).toContain('실제 장소 정보 가이드')
  })
})
