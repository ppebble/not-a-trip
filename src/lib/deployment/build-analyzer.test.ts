import fs from 'fs'
import os from 'os'
import path from 'path'
import { analyzeNextBuild } from './build-analyzer'

describe('analyzeNextBuild', () => {
  it('measures route bundle sizes from a Next build manifest', () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'build-analyzer-'))
    const buildDir = path.join(repoRoot, '.next')
    const sourceRoot = path.join(repoRoot, 'src')

    fs.mkdirSync(path.join(buildDir, 'static', 'chunks'), { recursive: true })
    fs.mkdirSync(sourceRoot, { recursive: true })

    fs.writeFileSync(
      path.join(buildDir, 'build-manifest.json'),
      JSON.stringify({
        pages: {
          '/': ['static/chunks/framework.js', 'static/chunks/home.js'],
          '/map': ['static/chunks/framework.js', 'static/chunks/map.js'],
        },
      })
    )

    fs.writeFileSync(
      path.join(buildDir, 'static', 'chunks', 'framework.js'),
      'console.log("framework")'.repeat(200)
    )
    fs.writeFileSync(
      path.join(buildDir, 'static', 'chunks', 'home.js'),
      'console.log("home")'.repeat(100)
    )
    fs.writeFileSync(
      path.join(buildDir, 'static', 'chunks', 'map.js'),
      Array.from(
        { length: 20000 },
        (_, index) => `console.log("map-${index}")`
      ).join('\n')
    )
    fs.writeFileSync(
      path.join(sourceRoot, 'example.tsx'),
      "const Page = dynamic(() => import('./Map'))\nexport default Page\n"
    )

    const result = analyzeNextBuild({
      repoRoot,
      buildDir,
      sourceRoot,
      pageBudgetBytes: 8 * 1024,
    })

    expect(result.routes[0].route).toBe('/map')
    expect(result.sharedChunks).toContain('static/chunks/framework.js')
    expect(result.dynamicImportCount).toBeGreaterThan(0)
    expect(
      result.issues.some((issue) => issue.code === 'build.route-over-budget')
    ).toBe(true)
  })
})
