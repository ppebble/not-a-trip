import { auditPerformanceHeuristics } from './performance-auditor'

describe('auditPerformanceHeuristics', () => {
  it('confirms core performance heuristics already enforced in the app shell', () => {
    const result = auditPerformanceHeuristics({
      repoRoot: process.cwd(),
    })

    expect(result.checks.fontDisplaySwapEnabled).toBe(true)
    expect(result.checks.mapViewsUseDynamicImport).toBe(true)
    expect(result.issues).toHaveLength(0)
  })
})
