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

  it('tracks raw token drift with an owned enforcement path instead of hiding debt', () => {
    const tokenAudit = read(
      '.kiro/specs/52-design-system-motion-focus-hardening/token-audit.md'
    )

    expect(tokenAudit).toContain('Design_Token_Contract: `deferred`')
    expect(tokenAudit).toContain('Raw utility enforcement: `deferred`')
    expect(tokenAudit).toContain('frontend/design-system maintainers')
    expect(tokenAudit).toContain('src/components/admin')
    expect(tokenAudit).toContain('src/components/checkin')
    expect(tokenAudit).toContain('src/components/mobile')
    expect(tokenAudit).toContain('src/components/profile')
    expect(tokenAudit).toContain('banned raw semantic classes')
    expect(tokenAudit).toContain('Remaining Unenforced Scope')
  })
})
