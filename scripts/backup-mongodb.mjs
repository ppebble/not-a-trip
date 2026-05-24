import { spawnSync } from 'child_process'
import { mkdirSync, readdirSync, rmSync, statSync } from 'fs'
import { join } from 'path'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/not-a-trip'
const backupRoot = process.env.BACKUP_DIR || 'backups'
const now = new Date()
const timestamp = now.toISOString().replace(/[:.]/g, '-')
const archivePath = join(backupRoot, `mongodb-backup-${timestamp}.archive.gz`)

mkdirSync(backupRoot, { recursive: true })

const result = spawnSync(
  'mongodump',
  [`--uri=${uri}`, `--archive=${archivePath}`, '--gzip'],
  { stdio: 'inherit' }
)

if (result.status !== 0) {
  console.error('Backup failed.')
  process.exit(result.status || 1)
}

const stats = statSync(archivePath)
if (!stats.isFile() || stats.size <= 0) {
  console.error('Backup integrity check failed: archive missing or empty.')
  process.exit(1)
}

const retentionThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000
for (const fileName of readdirSync(backupRoot)) {
  const fullPath = join(backupRoot, fileName)
  const fileStats = statSync(fullPath)
  if (fileStats.mtimeMs < retentionThreshold) {
    rmSync(fullPath, { force: true })
  }
}

console.log(`Backup created: ${archivePath}`)
