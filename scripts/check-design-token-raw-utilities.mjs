import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

export const SCAN_SURFACES = ['admin', 'checkin', 'mobile', 'profile']
export const SURFACE_ROOTS = SCAN_SURFACES.map((surface) =>
  path.join(repoRoot, 'src', 'components', surface)
)

export const BASELINE_PATH = path.join(
  repoRoot,
  'config',
  'design-token-raw-utility-baseline.json'
)

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])

const APPROVED_PRIMITIVE_BOUNDARIES = new Set([
  'src/components/admin/AdminReviewPrimitives.tsx',
])

const SEMANTIC_PALETTES = new Set([
  'primary',
  'secondary',
  'sunset',
  'surface',
  'accent-surface',
  'background',
  'main-text',
  'sub-text',
  'muted',
  'border',
  'danger',
  'danger-surface',
  'text-primary',
  'text-secondary',
])

const RAW_PALETTES = new Set([
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'black',
  'white',
])

const SEMANTIC_PREFIXES = [
  'bg',
  'text',
  'border',
  'ring',
  'outline',
  'divide',
  'from',
  'via',
  'to',
  'placeholder',
  'accent',
  'caret',
  'decoration',
  'fill',
  'stroke',
]

const BANNED_SHADOWS = new Set([
  'shadow',
  'shadow-sm',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
  'shadow-inner',
])

const TOKEN_PATTERN = /[A-Za-z0-9_:[\]()./%#,-]+/g
const VARIANT_SEPARATOR_PATTERN = /:(?![^[]*\])/g
const IMPORTANT_PREFIX = /^!+/
const NEGATIVE_PREFIX = /^-/

function walkSourceFiles(root) {
  if (!existsSync(root)) return []

  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(root, entry.name)
    if (entry.isDirectory()) return walkSourceFiles(fullPath)
    if (!entry.isFile()) return []
    return SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [fullPath] : []
  })
}

function stripVariant(token) {
  const segments = token.split(VARIANT_SEPARATOR_PATTERN)
  return segments[segments.length - 1]
    .replace(IMPORTANT_PREFIX, '')
    .replace(NEGATIVE_PREFIX, '')
}

function paletteForUtility(utility) {
  for (const prefix of SEMANTIC_PREFIXES) {
    const marker = `${prefix}-`
    if (!utility.startsWith(marker)) continue
    const value = utility.slice(marker.length)
    const palette = [...SEMANTIC_PALETTES].find(
      (candidate) =>
        value === candidate ||
        value.startsWith(`${candidate}-`) ||
        value.startsWith(`${candidate}/`)
    )
    if (palette) return { prefix, palette, semantic: true }

    const rawPalette = value.split(/[-/[]/, 1)[0]
    if (RAW_PALETTES.has(rawPalette)) {
      return { prefix, palette: rawPalette, semantic: false }
    }
  }

  return null
}

export function classifyToken(token) {
  const utility = stripVariant(token)
  if (!utility || utility.includes('{') || utility.includes('}')) return null

  if (BANNED_SHADOWS.has(utility)) {
    return { token, utility, category: 'shadow', palette: 'shadow' }
  }

  const palette = paletteForUtility(utility)
  if (!palette || palette.semantic) return null

  return {
    token,
    utility,
    category: palette.prefix,
    palette: palette.palette,
  }
}

export function scanText(source, relativePath = '<inline>') {
  const findings = []
  const lines = source.split(/\r?\n/)

  lines.forEach((line, index) => {
    const tokens = line.match(TOKEN_PATTERN) ?? []
    for (const token of tokens) {
      const finding = classifyToken(token)
      if (!finding) continue
      findings.push({
        ...finding,
        file: relativePath.replaceAll('\\\\', '/').replaceAll('\\', '/'),
        line: index + 1,
      })
    }
  })

  return findings
}

export function scanSurface(surface) {
  const root = path.join(repoRoot, 'src', 'components', surface)
  return walkSourceFiles(root).flatMap((filePath) => {
    const relativePath = path.relative(repoRoot, filePath).replaceAll('\\', '/')
    if (APPROVED_PRIMITIVE_BOUNDARIES.has(relativePath)) return []
    return scanText(readFileSync(filePath, 'utf8'), relativePath)
  })
}

export function scanDesignTokenDebt() {
  const surfaces = Object.fromEntries(
    SCAN_SURFACES.map((surface) => {
      const findings = scanSurface(surface)
      const byFile = findings.reduce((acc, finding) => {
        acc[finding.file] = (acc[finding.file] ?? 0) + 1
        return acc
      }, {})
      return [surface, { total: findings.length, files: byFile }]
    })
  )

  const total = Object.values(surfaces).reduce(
    (sum, surface) => sum + surface.total,
    0
  )
  return {
    version: 1,
    generatedBy: 'npm run design-token:scan -- --update-baseline',
    mode: 'baseline-delta',
    surfaces,
    total,
  }
}

function readBaseline() {
  if (!existsSync(BASELINE_PATH)) return null
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
}

function compareToBaseline(current, baseline) {
  const failures = []
  if (!baseline) {
    failures.push(
      'Baseline file is missing. Run npm run design-token:scan -- --update-baseline after reviewing the inventory.'
    )
    return failures
  }

  for (const surface of SCAN_SURFACES) {
    const currentTotal = current.surfaces[surface]?.total ?? 0
    const baselineTotal = baseline.surfaces?.[surface]?.total ?? 0
    if (currentTotal > baselineTotal) {
      failures.push(
        `${surface}: ${currentTotal} raw semantic utilities exceeds baseline ${baselineTotal}`
      )
    }

    const currentFiles = current.surfaces[surface]?.files ?? {}
    const baselineFiles = baseline.surfaces?.[surface]?.files ?? {}
    for (const [file, count] of Object.entries(currentFiles)) {
      const baselineCount = baselineFiles[file] ?? 0
      if (count > baselineCount) {
        failures.push(
          `${file}: ${count} raw semantic utilities exceeds baseline ${baselineCount}`
        )
      }
    }
  }

  return failures
}

function printReport(current) {
  console.log('Design token raw semantic utility inventory')
  console.log(`Mode: ${current.mode}`)
  console.log(`Total: ${current.total}`)

  for (const surface of SCAN_SURFACES) {
    const result = current.surfaces[surface]
    console.log(
      `- ${surface}: ${result.total} findings in ${Object.keys(result.files).length} files`
    )
  }
}

function main() {
  const args = new Set(process.argv.slice(2))
  const current = scanDesignTokenDebt()

  if (args.has('--update-baseline')) {
    writeFileSync(BASELINE_PATH, `${JSON.stringify(current, null, 2)}\n`)
    printReport(current)
    console.log(`Baseline updated: ${path.relative(repoRoot, BASELINE_PATH)}`)
    return
  }

  printReport(current)

  if (args.has('--json')) {
    console.log(JSON.stringify(current, null, 2))
  }

  if (args.has('--check')) {
    const failures = compareToBaseline(current, readBaseline())
    if (failures.length > 0) {
      console.error('Design token baseline check failed:')
      for (const failure of failures) console.error(`- ${failure}`)
      process.exitCode = 1
      return
    }
    console.log('Design token baseline check passed.')
  }
}

if (process.argv[1] === __filename) {
  main()
}
