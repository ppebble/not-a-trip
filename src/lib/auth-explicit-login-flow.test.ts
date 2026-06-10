import { readFileSync } from 'fs'
import path from 'path'

function readRepoFile(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('explicit login selection flow', () => {
  test('registration no longer signs in with credentials automatically', () => {
    const hook = readRepoFile('src/hooks/useAuth.ts')

    expect(hook).not.toContain(
      'return await loginWithCredentials(data.email, data.password)'
    )
    expect(hook).toContain('회원가입은 계정 생성까지만 수행한다.')
    expect(hook).toContain('return true')
  })

  test('successful registration routes to the login screen instead of home', () => {
    const registerPage = readRepoFile('src/app/auth/register/page.tsx')

    expect(registerPage).toContain(
      'router.push(`/auth/signin?registered=1&email=${email}`)'
    )
    expect(registerPage).not.toContain("router.push('/')")
  })

  test('sign-in page requires selecting email login before rendering the form', () => {
    const signInPage = readRepoFile('src/app/auth/signin/page.tsx')

    expect(signInPage).toContain('가입한 계정으로 로그인')
    expect(signInPage).toContain('이메일로 로그인')
    expect(signInPage).toContain("selectedLoginMethod === 'email'")
    expect(signInPage).toContain('자동 로그인하지 않았습니다')
  })
})
