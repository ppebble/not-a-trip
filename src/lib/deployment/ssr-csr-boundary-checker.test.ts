import fs from 'fs'
import os from 'os'
import path from 'path'
import { analyzeSsrCsrBoundaries } from './ssr-csr-boundary-checker'

describe('analyzeSsrCsrBoundaries', () => {
  it('flags client components without client-only signals', () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-check-'))
    const srcRoot = path.join(repoRoot, 'src')
    fs.mkdirSync(srcRoot, { recursive: true })

    fs.writeFileSync(
      path.join(srcRoot, 'ClientOnly.tsx'),
      "'use client'\nexport default function ClientOnly(){ return <div>Hello</div> }\n"
    )
    fs.writeFileSync(
      path.join(srcRoot, 'ServerBad.tsx'),
      "import { MapContainer } from 'react-leaflet'\nexport default function ServerBad(){ return <MapContainer /> }\n"
    )

    const result = analyzeSsrCsrBoundaries({
      repoRoot,
      sourceRoot: srcRoot,
    })

    expect(result.simplificationCandidates).toContain('src/ClientOnly.tsx')
    expect(result.serverImportViolations).toContain('src/ServerBad.tsx')
    expect(result.issues).toHaveLength(2)
  })
})
