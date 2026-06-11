import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')
}

describe('new password API security contract', () => {
  test.each([
    ['src/app/api/auth/register/route.ts', 'password'],
    ['src/app/api/account/set-password/route.ts', 'password'],
    ['src/app/api/account/change-password/route.ts', 'newPassword'],
  ])(
    '%s validates breach exposure before hashing a new password',
    (file, passwordVariable) => {
      const source = read(file)
      const validateIndex = source.indexOf(
        `validateNewPasswordSecurity(${passwordVariable})`
      )
      const hashIndex = source.indexOf(`bcrypt.hash(${passwordVariable}`)

      expect(validateIndex).toBeGreaterThan(-1)
      expect(hashIndex).toBeGreaterThan(-1)
      expect(validateIndex).toBeLessThan(hashIndex)
    }
  )
})
