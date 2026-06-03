import fs from 'fs'
import path from 'path'

const projectRoot = path.resolve(__dirname, '../../')

function read(relativePath: string) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8')
}

describe('spec 52 design-system motion and focus hardening', () => {
  it('keeps keyboard focus visible without broad global outline removal', () => {
    const globals = read('src/app/globals.css')

    expect(globals).not.toMatch(/\*:focus\s*\{\s*outline:\s*none;\s*\}/)
    expect(globals).toContain(
      ':where(a, button, input, select, textarea, summary, [tabindex]):focus-visible'
    )
    expect(globals).toContain(
      'outline: 2px solid rgb(var(--color-primary-500))'
    )
    expect(globals).toContain(':focus:not(\n    :focus-visible\n  )')
  })

  it('disables every global animation utility under reduced motion', () => {
    const globals = read('src/app/globals.css')
    const reducedMotionBlock = globals.slice(
      globals.indexOf('@media (prefers-reduced-motion: reduce)')
    )

    expect(reducedMotionBlock).toContain('scroll-behavior: auto')
    expect(reducedMotionBlock).toContain(
      'transition-duration: 0.01ms !important'
    )
    expect(reducedMotionBlock).toContain(
      'animation-duration: 0.01ms !important'
    )

    for (const animationClass of [
      '.animate-fade-in',
      '.animate-slide-up',
      '.animate-fade-in-up',
      '.loading-shimmer',
      '.animate-loading-bar',
      '.animate-fade-slide-in',
    ]) {
      expect(reducedMotionBlock).toContain(animationClass)
    }
  })

  it('keeps raw design-token drift enforcement in code instead of develop-only specs', () => {
    const tokenScanTest = read('src/lib/design-token-raw-utility-scan.test.ts')
    const tokenScanScript = read('scripts/check-design-token-raw-utilities.mjs')
    const workflow = read('docs/git-workflow.md')

    expect(tokenScanTest).toContain('--check')
    expect(tokenScanScript).toContain('SCAN_SURFACES')
    expect(tokenScanScript).toContain('RAW_PALETTES')
    expect(tokenScanScript).toContain('BANNED_SHADOWS')
    expect(workflow).toContain(
      'docs/.kiro 정리는 main용 릴리즈 브랜치에서만 수행'
    )
  })
})
