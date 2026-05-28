import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('spec 46 user journey UX hardening', () => {
  test('documents requirements and task checklist for the executed scope', () => {
    const requirements = read(
      '.kiro/specs/46-user-journey-ux-hardening/requirements.md'
    )
    const tasks = read('.kiro/specs/46-user-journey-ux-hardening/tasks.md')

    expect(requirements).toContain('지도 탐색 전역 진입점 노출')
    expect(requirements).toContain('스팟 상세 복귀 경로 정확화')
    expect(requirements).toContain('갤러리 실제 통계와 실제 탭 컴포넌트 사용')
    expect(requirements).toContain('스팟 상세 제보 진입점 통합')
    expect(requirements).toContain('모바일 지도 필터 점유 면적 축소')
    expect(tasks).toContain('Requirements trace')
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
