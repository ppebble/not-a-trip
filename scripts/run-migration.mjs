/**
 * 마이그레이션 실행 래퍼
 * MONGODB_DB 환경변수를 명시적으로 설정하고 마이그레이션 스크립트를 실행
 */
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

// .env.local 파싱
const envContent = readFileSync('.env.local', 'utf-8')
const envVars = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const idx = trimmed.indexOf('=')
  if (idx === -1) continue
  const key = trimmed.slice(0, idx).trim()
  const value = trimmed.slice(idx + 1).trim()
  envVars[key] = value
}

// MONGODB_URI에서 DB 이름 추출
const uri = envVars['MONGODB_URI'] || 'mongodb://localhost:27017/not-a-trip'
const dbMatch = uri.match(/\/([^/?]+)(\?|$)/)
const dbName = dbMatch ? dbMatch[1] : 'not-a-trip'

console.log(`📦 DB: ${dbName}`)
console.log(`🔗 URI: ${uri}\n`)

const script = process.argv[2]
if (!script) {
  console.error('Usage: node scripts/run-migration.mjs <script-path>')
  process.exit(1)
}

execSync(`npx tsx ${script}`, {
  stdio: 'inherit',
  env: {
    ...process.env,
    ...envVars,
    MONGODB_DB: dbName,
  },
})
