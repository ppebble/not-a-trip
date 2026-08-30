import fs from 'node:fs'
import path from 'node:path'

describe('researched route plans', () => {
  it('keeps the Shibuya walking course geographically inside Shibuya', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'seed-researched-routes.mjs'),
      'utf8'
    )
    const shibuyaRoute = source.slice(
      source.indexOf("id: 'ROUTE-102'"),
      source.indexOf("id: 'ROUTE-103'")
    )

    expect(shibuyaRoute).toContain(
      "spotIds: ['REAL-ANI-020', 'REAL-ANI-021', 'REAL-GAM-002']"
    )
    expect(shibuyaRoute).not.toContain('REAL-GAM-003')
    expect(shibuyaRoute).not.toContain('이케부쿠로')
  })

  it('builds routes from the latest seed-owned spot thumbnails', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'seed-researched-routes.mjs'),
      'utf8'
    )
    const mergeBlock = source.slice(
      source.indexOf('for (const spot of newSpotPlans)'),
      source.indexOf('for (const spotId of spotIds)')
    )

    expect(mergeBlock).toContain('spotById.set(spot.id')
    expect(mergeBlock).not.toContain('if (!spotById.has(spot.id))')
  })
})
