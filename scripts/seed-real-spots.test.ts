import fs from 'node:fs'
import path from 'node:path'
import { buildContentMasterSeeds, MUSIC_SPOTS } from './seed-real-spots'

describe('standalone seed environment', () => {
  it('loads repository environment files before resolving the MongoDB URI', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'seed-real-spots.ts'),
      'utf8'
    )

    expect(source.indexOf('loadEnv()')).toBeLessThan(
      source.indexOf('const MONGODB_URI')
    )
  })
})

describe('legacy spot lifecycle data', () => {
  it.each([
    ['REAL-MUS-004', '2023'],
    ['REAL-MUS-005', '2020'],
  ])('marks %s as closed with closure evidence', (id, closureYear) => {
    const spot = MUSIC_SPOTS.find((candidate) => candidate.id === id)

    expect(spot).toMatchObject({
      lifecycleStatus: 'closed',
      reviewStatus: 'approved',
    })
    expect(spot?.description).toContain(closureYear)
    expect(spot?.sourceUrls?.length).toBeGreaterThan(0)
  })
})

describe('content master seed synchronization', () => {
  it('deduplicates content names and counts distinct related spots', () => {
    const masters = buildContentMasterSeeds([
      {
        id: 'SPOT-1',
        name: '첫 장소',
        description: '',
        photos: [],
        address: '일본',
        coordinates: { lat: 35, lng: 139 },
        category: 'animation',
        relatedContent: [{ name: '작품 A', type: 'anime', year: 2020 }],
        authorName: 'System',
        isGuestSpot: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'SPOT-2',
        name: '둘째 장소',
        description: '',
        photos: [],
        address: '일본',
        coordinates: { lat: 36, lng: 140 },
        category: 'animation',
        relatedContent: [{ name: '작품 A', type: 'anime', year: 2020 }],
        authorName: 'System',
        isGuestSpot: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    expect(masters).toEqual([
      {
        normalizedName: '작품 a',
        displayName: '작품 A',
        type: 'anime',
        year: 2020,
        spotCount: 2,
      },
    ])
  })
})
