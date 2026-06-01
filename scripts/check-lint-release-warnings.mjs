#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const baselinePath = resolve(
  repoRoot,
  'config/lint-release-warning-baseline.json'
)
const updateBaseline = process.argv.includes('--update-baseline')

const lintResult = spawnSync('npx eslint src --format json', {
  cwd: repoRoot,
  encoding: 'utf8',
  shell: true,
  maxBuffer: 1024 * 1024 * 20,
})

if (lintResult.error) {
  console.error(`Failed to run ESLint: ${lintResult.error.message}`)
  process.exit(1)
}

let reports
try {
  reports = JSON.parse(lintResult.stdout || '[]')
} catch (error) {
  console.error('Failed to parse ESLint JSON output.')
  console.error(error instanceof Error ? error.message : String(error))
  if (lintResult.stdout) console.error(lintResult.stdout.slice(0, 4000))
  if (lintResult.stderr) console.error(lintResult.stderr)
  process.exit(1)
}

const emptySummary = () => ({
  errors: 0,
  warnings: 0,
  categories: {
    reactHooksExhaustiveDeps: 0,
    jsxA11y: 0,
    productionConsole: 0,
    noExplicitAny: 0,
    unusedVariables: 0,
    otherWarnings: 0,
  },
  rules: {},
})

function isTestFile(filePath) {
  const normalized = filePath.replaceAll('\\', '/')
  return (
    normalized.includes('/__tests__/') ||
    normalized.endsWith('.test.ts') ||
    normalized.endsWith('.test.tsx') ||
    normalized.endsWith('.spec.ts') ||
    normalized.endsWith('.spec.tsx')
  )
}

function classify(ruleId, filePath) {
  if (ruleId === 'react-hooks/exhaustive-deps')
    return 'reactHooksExhaustiveDeps'
  if (ruleId?.startsWith('jsx-a11y/')) return 'jsxA11y'
  if (ruleId === '@typescript-eslint/no-explicit-any') return 'noExplicitAny'
  if (ruleId === '@typescript-eslint/no-unused-vars') return 'unusedVariables'
  if (ruleId === 'no-console' && !isTestFile(filePath))
    return 'productionConsole'
  return 'otherWarnings'
}

const summary = emptySummary()
const examples = {}

for (const report of reports) {
  for (const message of report.messages) {
    const ruleId = message.ruleId ?? 'unknown'
    if (message.severity === 2) {
      summary.errors += 1
      summary.rules[ruleId] = (summary.rules[ruleId] ?? 0) + 1
      examples[ruleId] ??= []
      if (examples[ruleId].length < 5) {
        examples[ruleId].push(
          `${relative(repoRoot, report.filePath)}:${message.line}:${message.column}`
        )
      }
      continue
    }

    summary.warnings += 1
    summary.rules[ruleId] = (summary.rules[ruleId] ?? 0) + 1
    const category = classify(ruleId, report.filePath)
    summary.categories[category] += 1
    examples[category] ??= []
    if (examples[category].length < 5) {
      examples[category].push(
        `${relative(repoRoot, report.filePath)}:${message.line}:${message.column} ${ruleId}`
      )
    }
  }
}

const payload = {
  generatedAt: new Date().toISOString(),
  command: 'npx eslint src --format json',
  scope: 'src',
  policy: {
    errors: 'must remain zero',
    warningCategories:
      'must not exceed baseline counts; react-hooks, jsx-a11y, no-explicit-any, production console, and unused variables are reported separately',
  },
  summary,
  examples,
}

if (updateBaseline) {
  mkdirSync(dirname(baselinePath), { recursive: true })
  writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(
    `Updated lint warning baseline: ${relative(repoRoot, baselinePath)}`
  )
  console.log(JSON.stringify(summary, null, 2))
  process.exit(summary.errors === 0 ? 0 : 1)
}

let baseline
try {
  baseline = JSON.parse(readFileSync(baselinePath, 'utf8'))
} catch {
  console.error(
    `Missing lint warning baseline: ${relative(repoRoot, baselinePath)}`
  )
  console.error(
    'Run: node scripts/check-lint-release-warnings.mjs --update-baseline'
  )
  process.exit(1)
}

const failures = []
if (summary.errors > 0) failures.push(`ESLint errors: ${summary.errors}`)
for (const [category, count] of Object.entries(summary.categories)) {
  const allowed = baseline.summary?.categories?.[category]
  if (typeof allowed !== 'number') {
    failures.push(`Baseline missing category ${category}`)
  } else if (count > allowed) {
    failures.push(`${category}: ${count} > baseline ${allowed}`)
  }
}

console.log('Lint release warning summary')
console.log(JSON.stringify(summary, null, 2))

if (failures.length > 0) {
  console.error('Lint release gate failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  'Lint release gate passed: no release-critical warning category regressed beyond baseline.'
)
