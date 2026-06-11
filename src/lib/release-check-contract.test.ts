import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('release readiness command contract', () => {
  it('runs the gates that protect formatting, tokens, route data, tests, and build budgets', () => {
    const packageJson = JSON.parse(readText('package.json')) as {
      scripts: Record<string, string>
    }

    const releaseCheck = packageJson.scripts['release:check']

    expect(releaseCheck).toBeDefined()
    expect(releaseCheck).toEqual(expect.stringContaining('npm run lint'))
    expect(releaseCheck).toEqual(
      expect.stringContaining('npm run lint:release')
    )
    expect(releaseCheck).toEqual(
      expect.stringContaining('npm run format:check')
    )
    expect(releaseCheck).toEqual(
      expect.stringContaining('npm run design-token:check')
    )
    expect(releaseCheck).toEqual(
      expect.stringContaining('npm run routes:validate')
    )
    expect(releaseCheck).toEqual(
      expect.stringContaining('npm run routes:validate:seeded')
    )
    expect(releaseCheck).toEqual(expect.stringContaining('npm run type-check'))
    expect(releaseCheck).toEqual(expect.stringContaining('npm run test:ci'))
    expect(releaseCheck).toEqual(
      expect.stringContaining('npm run build:route-budget')
    )
  })

  it('keeps local OMX runtime artifacts out of repository-wide Prettier checks', () => {
    const prettierIgnore = readText('.prettierignore')

    expect(prettierIgnore.split(/\r?\n/)).toContain('.omx')
  })
})
