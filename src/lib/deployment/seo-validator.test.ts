import { validateSeoMetadata } from './seo-validator'

describe('validateSeoMetadata', () => {
  it('requires canonical metadata and production crawler files', () => {
    const result = validateSeoMetadata({
      repoRoot: process.cwd(),
    })

    expect(result.checks.hasRobots).toBe(true)
    expect(result.checks.hasSitemap).toBe(true)
    expect(result.checks.hasCanonical).toBe(true)
    expect(result.checks.hasAbsoluteOgImages).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})
