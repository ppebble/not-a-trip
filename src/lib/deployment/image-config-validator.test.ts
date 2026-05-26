import fs from 'fs'
import os from 'os'
import path from 'path'
import { validateImageRemotePatterns } from './image-config-validator'

describe('validateImageRemotePatterns', () => {
  it('flags placeholder and localhost hosts when they remain in image config', () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'image-config-'))
    const srcRoot = path.join(repoRoot, 'src')

    fs.mkdirSync(srcRoot, { recursive: true })
    fs.writeFileSync(
      path.join(repoRoot, 'next.config.ts'),
      `
        export default {
          images: {
            remotePatterns: [
              { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
              { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
              { protocol: 'http', hostname: 'localhost', pathname: '/uploads/**' },
            ],
          },
        }
      `
    )
    fs.writeFileSync(
      path.join(srcRoot, 'page.tsx'),
      "export default function Page(){ return 'ok' }\n"
    )

    const result = validateImageRemotePatterns({ repoRoot })

    expect(result.configuredHosts).toEqual(
      expect.arrayContaining([
        'localhost',
        'picsum.photos',
        'via.placeholder.com',
      ])
    )
    expect(
      result.issues.some((issue) => issue.code === 'image.placeholder-host')
    ).toBe(true)
    expect(
      result.issues.some((issue) => issue.code === 'image.localhost-host')
    ).toBe(true)
  })

  it('keeps placeholder and localhost hosts out of the current production config', () => {
    const result = validateImageRemotePatterns({
      repoRoot: process.cwd(),
    })

    expect(result.configuredHosts).not.toContain('picsum.photos')
    expect(result.configuredHosts).not.toContain('via.placeholder.com')
    expect(result.configuredHosts).not.toContain('localhost')
  })
})
