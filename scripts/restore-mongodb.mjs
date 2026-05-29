import { spawnSync } from 'child_process'

const archivePath = process.argv[2]
const targetDb = process.argv[3]
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/not-a-trip'

if (!archivePath || !targetDb) {
  console.error(
    'Usage: node scripts/restore-mongodb.mjs <archive-path> <target-db>'
  )
  process.exit(1)
}

const result = spawnSync(
  'mongorestore',
  [
    `--uri=${uri}`,
    `--nsFrom=*`,
    `--nsTo=${targetDb}.*`,
    `--archive=${archivePath}`,
    '--gzip',
  ],
  { stdio: 'inherit' }
)

if (result.status !== 0) {
  console.error('Restore failed.')
  process.exit(result.status || 1)
}

console.log(`Restore completed into database: ${targetDb}`)
