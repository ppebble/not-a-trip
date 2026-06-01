#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const budgetPath = resolve(repoRoot, 'config/route-js-budgets.json')
const latestLogPath = resolve(
  repoRoot,
  '.omx/release-gates/next-build-latest.log'
)
const parseOnlyIndex = process.argv.indexOf('--log')
const parseOnlyPath =
  parseOnlyIndex >= 0
    ? resolve(repoRoot, process.argv[parseOnlyIndex + 1] ?? '')
    : null

const budgets = JSON.parse(
  readFileSync(budgetPath, 'utf8').replace(/^\uFEFF/, '')
)

function runBuild() {
  const result = spawnSync('npx next build', {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: true,
    maxBuffer: 1024 * 1024 * 30,
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=4096',
    },
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  mkdirSync(dirname(latestLogPath), { recursive: true })
  writeFileSync(latestLogPath, output)
  if (result.error) {
    throw new Error(`next build failed to start: ${result.error.message}`)
  }
  if (result.status !== 0) {
    throw new Error(
      `next build exited with ${result.status}; log: ${relative(repoRoot, latestLogPath)}`
    )
  }
  return output
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseKb(rawValue, unit) {
  const value = Number(rawValue)
  if (!Number.isFinite(value)) return null
  if (unit === 'MB') return value * 1024
  return value
}

function stripAnsi(value) {
  return value.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
}

function parseBuildOutput(output) {
  const cleanOutput = stripAnsi(output)
  const measurements = { routes: {} }
  const sharedMatch = cleanOutput.match(
    /^\+ First Load JS shared by all\s+([\d.]+)\s+(kB|MB)$/m
  )
  if (sharedMatch) {
    measurements.sharedFirstLoadJsKb = parseKb(sharedMatch[1], sharedMatch[2])
  }

  for (const route of Object.keys(budgets.routes)) {
    const routePattern = new RegExp(
      `^.*\\s${escapeRegExp(route)}\\s+[\\d.]+\\s+(?:B|kB|MB)\\s+([\\d.]+)\\s+(kB|MB)$`,
      'm'
    )
    const routeMatch = cleanOutput.match(routePattern)
    if (routeMatch) {
      measurements.routes[route] = parseKb(routeMatch[1], routeMatch[2])
    }
  }

  return measurements
}

const output =
  parseOnlyPath && existsSync(parseOnlyPath)
    ? readFileSync(parseOnlyPath, 'utf8')
    : runBuild()
const measurements = parseBuildOutput(output)
const failures = []

if (typeof measurements.sharedFirstLoadJsKb !== 'number') {
  failures.push('Missing shared First Load JS measurement')
} else if (measurements.sharedFirstLoadJsKb > budgets.sharedFirstLoadJsKb) {
  failures.push(
    `shared First Load JS ${measurements.sharedFirstLoadJsKb} kB > budget ${budgets.sharedFirstLoadJsKb} kB`
  )
}

for (const [route, budgetKb] of Object.entries(budgets.routes)) {
  const measured = measurements.routes[route]
  if (typeof measured !== 'number') {
    failures.push(`Missing route measurement for ${route}`)
  } else if (measured > budgetKb) {
    failures.push(
      `${route} First Load JS ${measured} kB > budget ${budgetKb} kB`
    )
  }
}

const report = {
  command: parseOnlyPath
    ? `node scripts/check-route-js-budget.mjs --log ${relative(repoRoot, parseOnlyPath)}`
    : 'npx next build',
  log: parseOnlyPath
    ? relative(repoRoot, parseOnlyPath)
    : relative(repoRoot, latestLogPath),
  budgets,
  measurements: {
    sharedFirstLoadJsKb: measurements.sharedFirstLoadJsKb,
    routes: Object.fromEntries(
      Object.keys(budgets.routes).map((route) => [
        route,
        measurements.routes[route],
      ])
    ),
  },
}

console.log('Route JS budget report')
console.log(JSON.stringify(report, null, 2))

if (failures.length > 0) {
  console.error('Route JS budget gate failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Route JS budget gate passed.')
