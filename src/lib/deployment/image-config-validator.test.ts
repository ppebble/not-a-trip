import { validateImageRemotePatterns } from './image-config-validator'

describe('validateImageRemotePatterns', () => {
  it('finds configured hosts and flags placeholder/local hosts', () => {
    const result = validateImageRemotePatterns({
      repoRoot: process.cwd(),
    })

    expect(result.configuredHosts).toContain('picsum.photos')
    expect(result.configuredHosts).toContain('localhost')
    expect(
      result.issues.some((issue) => issue.code === 'image.placeholder-host')
    ).toBe(true)
    expect(
      result.issues.some((issue) => issue.code === 'image.localhost-host')
    ).toBe(true)
  })
})
