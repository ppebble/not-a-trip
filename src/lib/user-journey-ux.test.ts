import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('spec 46 user journey UX hardening', () => {
  test('keeps release validation independent from develop-only Kiro specs', () => {
    const workflow = read('docs/git-workflow.md')

    expect(workflow).toContain('main/develop 포함 파일 기준')
    expect(workflow).toContain('테스트 파일을 main에서 제거하지 않는다')
    expect(workflow).toContain('develop을 main에 무차별 merge하지 않는다')
  })
  test('global header exposes map navigation without removing existing IA', () => {
    const header = read('src/components/layout/Header.tsx')

    expect(header).toContain("href: '/map'")
    expect(header).toContain("label: '지도 탐색'")
    expect(header).toContain("href: '/contents'")
    expect(header).toContain("href: '/gallery'")
    expect(header).toContain("href: '/routes'")
    expect(header).toContain("href: '/spots/register'")
  })

  test('spot detail returns directly to map instead of root redirect branch', () => {
    const spotDetail = read('src/components/spot/SpotDetailClient.tsx')

    expect(spotDetail).toContain('href="/map"')
    expect(spotDetail).not.toContain('<span>메인으로 돌아가기</span>')
    expect(spotDetail).toContain('정보 제보 및 수정')
  })

  test('gallery page uses real stats/header/tabs components instead of placeholders', () => {
    const galleryPage = read('src/app/gallery/page.tsx')
    const galleryHooks = read('src/hooks/useGalleryQueries.ts')

    expect(galleryPage).toContain('GalleryHeaderWithStats')
    expect(galleryPage).toContain('<GalleryTabs activeTab={activeTab} />')
    expect(galleryPage).not.toContain('GalleryHeaderPlaceholder')
    expect(galleryPage).not.toContain('GalleryTabsPlaceholder')
    expect(galleryHooks).toContain('useGalleryStats')
    expect(galleryHooks).toContain('API_ROUTES.CHECKINS.STATS')
  })

  test('map page provides a compact mobile filter toggle while preserving filter panel', () => {
    const mapPage = read('src/app/(main)/map/page.tsx')

    expect(mapPage).toContain('isMobileFilterOpen')
    expect(mapPage).toContain('검색·필터 열기')
    expect(mapPage).toContain('필터 닫기')
    expect(mapPage).toContain('ContentSearchFilter')
    expect(mapPage).toContain('CategoryFilter')
  })
})
