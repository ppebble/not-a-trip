import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  describeMongoTarget,
  loadRepositoryEnv,
} from './load-repository-env.mjs'

describe('repository environment loader', () => {
  it('loads .env.local before .env without replacing explicit variables', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-env-'))
    try {
      fs.writeFileSync(
        path.join(directory, '.env.local'),
        'MONGODB_URI="mongodb+srv://user:pass@example.test/not-a-trip"\nKEEP=local\n'
      )
      fs.writeFileSync(
        path.join(directory, '.env'),
        'MONGODB_URI=mongodb://localhost/fallback\nKEEP=file\n'
      )
      const env: Record<string, string | undefined> = { KEEP: 'explicit' }

      loadRepositoryEnv({ cwd: directory, env })

      expect(env).toEqual({
        KEEP: 'explicit',
        MONGODB_URI: 'mongodb+srv://user:pass@example.test/not-a-trip',
      })
    } finally {
      fs.rmSync(directory, { recursive: true, force: true })
    }
  })

  it('describes a MongoDB target without exposing credentials', () => {
    expect(
      describeMongoTarget(
        'mongodb+srv://private-user:private-pass@example.test/not-a-trip'
      )
    ).toBe('example.test/not-a-trip')
  })
})
