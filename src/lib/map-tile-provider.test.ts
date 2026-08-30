import { readFileSync } from 'fs'
import path from 'path'

const repoRoot = process.cwd()

const mapSources = [
  'src/components/map/PilgrimageMap.tsx',
  'src/components/map/SpotDetailMap.tsx',
  'src/components/route/RouteMap.tsx',
  'src/components/spot/LocationPicker.tsx',
]

describe('map tile provider contract', () => {
  test.each(mapSources)(
    '%s uses the keyless OpenStreetMap tile endpoint',
    (file) => {
      const source = readFileSync(path.join(repoRoot, file), 'utf8')

      expect(source).toContain(
        'url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"'
      )
      expect(source).toContain('https://www.openstreetmap.org/copyright')
      expect(source).not.toContain('basemaps.cartocdn.com')
    }
  )

  test('service worker does not retain the obsolete CARTO tile cache route', () => {
    const source = readFileSync(path.join(repoRoot, 'src/sw.ts'), 'utf8')

    expect(source).toContain('tile\\.openstreetmap\\.org')
    expect(source).not.toContain('basemaps\\.cartocdn\\.com')
    expect(source).not.toContain("cacheName: 'external-tiles'")
  })
})
