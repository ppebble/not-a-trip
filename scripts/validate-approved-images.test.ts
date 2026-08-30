import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

describe('validate-approved-images CLI', () => {
  const fixtureDir = path.join(process.cwd(), 'public', '.image-validator-test')
  const manifestDir = fs.mkdtempSync(path.join(os.tmpdir(), 'image-validator-'))

  beforeAll(() => {
    fs.mkdirSync(fixtureDir, { recursive: true })
    fs.writeFileSync(
      path.join(fixtureDir, 'valid.webp'),
      Buffer.concat([Buffer.from('RIFF0000WEBP', 'ascii'), Buffer.alloc(16)])
    )
  })

  afterAll(() => {
    fs.rmSync(fixtureDir, { recursive: true, force: true })
    fs.rmSync(manifestDir, { recursive: true, force: true })
  })

  it('verifies that a local URL resolves to a real image file', () => {
    const manifest = path.join(manifestDir, 'valid.json')
    fs.writeFileSync(
      manifest,
      JSON.stringify([
        { spotId: 'SPOT-1', url: '/.image-validator-test/valid.webp' },
      ])
    )

    const output = execFileSync(
      process.execPath,
      ['scripts/validate-approved-images.mjs', manifest],
      { cwd: process.cwd(), encoding: 'utf8' }
    )
    expect(JSON.parse(output)).toMatchObject({ total: 1, passed: 1, failed: 0 })
  })

  it('fails missing local files instead of treating every slash URL as valid', () => {
    const manifest = path.join(manifestDir, 'missing.json')
    fs.writeFileSync(
      manifest,
      JSON.stringify([
        { spotId: 'SPOT-2', url: '/.image-validator-test/missing.webp' },
      ])
    )

    const result = spawnSync(
      process.execPath,
      ['scripts/validate-approved-images.mjs', manifest],
      { cwd: process.cwd(), encoding: 'utf8' }
    )
    expect(result.status).toBe(1)
    expect(JSON.parse(result.stdout)).toMatchObject({
      total: 1,
      passed: 0,
      failed: 1,
    })
  })

  it('keeps the package validation command connected to the owned-image manifest', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    )

    expect(packageJson.scripts['validate:images']).toContain(
      'public/images/spots/animation/manifest.json'
    )
  })
})
