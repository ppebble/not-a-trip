import fs from 'node:fs'

function read(path: string): string {
  return fs.readFileSync(path, 'utf8')
}

describe('QA hardening static contracts', () => {
  it('keeps onboarding as a non-modal coach mark that cannot block route clicks', () => {
    const tour = read('src/components/common/OnboardingTour.tsx')
    const hook = read('src/hooks/useOnboarding.ts')

    expect(tour).not.toContain('role="dialog"')
    expect(tour).not.toContain('aria-modal="true"')
    expect(tour).toContain('pointer-events-none fixed inset-0')
    expect(tour).toContain('pointer-events-auto fixed z-[10000]')
    expect(tour).not.toContain('nextButtonRef.current.focus')
    expect(hook).toContain('const dismiss = useCallback')
    expect(hook).toContain('setStoredDismissed(storageKey, true)')
    expect(tour).toContain('if (onDismiss)')
  })

  it('gates scene upload file selection behind settled authentication state', () => {
    const modal = read('src/components/spot/scene/AddSceneModal.tsx')

    expect(modal).toContain('AUTH_REQUIRED_MESSAGE')
    expect(modal).toContain('isFileSelectionDisabled')
    expect(modal).toContain('disabled={isFileSelectionDisabled}')
    expect(modal).toContain('.jpg,.jpeg,.png,.gif,.webp')
    expect(modal).toContain('useAuth()')
  })

  it('bypasses next/image optimizer for fragile local static and upload assets', () => {
    const optimizedImage = read('src/components/common/OptimizedImage.tsx')
    const appIcon = read('src/components/common/AppIcon.tsx')
    const mascot = read('src/components/common/MascotIllustration.tsx')
    const contentCard = read('src/components/content/ContentCard.tsx')

    for (const prefix of ['/icons/', '/uploads/', '/images/']) {
      expect(optimizedImage).toContain(prefix)
      expect(contentCard).toContain(prefix)
    }
    expect(appIcon).toContain('unoptimized')
    expect(mascot).toContain('unoptimized')
  })

  it('keeps representative spot and route map areas keyboard-escapable', () => {
    const spotDetail = read('src/components/spot/SpotDetailClient.tsx')
    const spotMap = read('src/components/map/SpotDetailMap.tsx')
    const routeDetail = read('src/components/route/RouteDetailContent.tsx')
    const routeMap = read('src/components/route/RouteMap.tsx')

    expect((spotDetail.match(/<h1\b/g) ?? []).length).toBe(1)
    expect(spotDetail).toContain('href="#spot-after-map"')
    expect(routeDetail).toContain('href="#route-after-map"')
    expect(spotMap).toContain('keyboard={false}')
    expect(routeMap).toContain('keyboard={false}')
  })
})
