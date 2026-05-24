import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import Naver from 'next-auth/providers/naver'
import Twitter from 'next-auth/providers/twitter'
import Credentials from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import clientPromise from './mongodb-client'
import { getDb } from './db'
import {
  assertLoginNotLocked,
  clearFailedLoginAttempts,
  logSuccessfulLogin,
  recordFailedLoginAttempt,
} from './security'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const normalizedEmail = String(credentials.email).trim().toLowerCase()
        const forwardedFor = request?.headers?.get('x-forwarded-for')
        const ip =
          forwardedFor?.split(',')[0]?.trim() ||
          request?.headers?.get('x-real-ip') ||
          undefined

        await assertLoginNotLocked(normalizedEmail)

        const db = await getDb()
        const user = await db.collection('users').findOne({
          email: normalizedEmail,
        })

        if (!user || !user.password) {
          await recordFailedLoginAttempt({ email: normalizedEmail, ip })
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          await recordFailedLoginAttempt({ email: normalizedEmail, ip })
          return null
        }

        await clearFailedLoginAttempts(normalizedEmail)
        await logSuccessfulLogin({
          email: normalizedEmail,
          userId: user._id.toString(),
          ip,
        })

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || 'user',
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24,
  },
  jwt: {
    maxAge: 60 * 60 * 24,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Credentials 로그인은 authorize()에서 처리하므로 통과
      if (account?.provider === 'credentials') {
        return true
      }

      // OAuth 이메일 미제공 시 기존 계정과 충돌 없이 새 계정 생성 허용
      // Auth.js 기본 동작: 이메일이 없으면 OAuthAccountNotLinked 체크를 건너뜀
      if (!user.email) {
        // eslint-disable-next-line no-console
        console.log(
          `[Auth] OAuth 이메일 미제공 — 프로바이더: ${account?.provider}, 프로필 ID: ${profile?.sub || 'unknown'}`
        )
        return true
      }

      // 수동 Account Linking 보안 검증 (Requirements: 8.2, 8.3, 8.4)
      // user.id가 존재하면 기존 사용자에 대한 계정 연결 시도 (Account Linking)
      if (user.id) {
        // email_verified: false인 프로바이더의 계정 연결 거부
        const emailVerified =
          profile?.email_verified ??
          (profile as Record<string, unknown>)?.verified_email
        if (emailVerified === false) {
          // eslint-disable-next-line no-console
          console.log(
            `[Account Linking] 거부 — email_verified=false, userId: ${user.id}, provider: ${account?.provider}`
          )
          return '/auth/error?error=EmailNotVerified'
        }

        // Account Linking 이벤트 로그 기록
        // eslint-disable-next-line no-console
        console.log(
          `[Account Linking] 연결 — userId: ${user.id}, provider: ${account?.provider}`
        )
      }

      // 기존 소셜 로그인 사용자 정합성 확인 (Requirements: 9.1, 9.2, 9.3)
      // 레거시 사용자의 accounts 컬렉션에 연결 정보가 없으면 자동 생성
      if (user.id && account) {
        try {
          const db = await getDb()
          const userId = new ObjectId(user.id)

          const existingAccount = await db
            .collection('accounts')
            .findOne({ userId, provider: account.provider })

          if (!existingAccount) {
            await db.collection('accounts').insertOne({
              userId,
              type: account.type || 'oauth',
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            })
            // eslint-disable-next-line no-console
            console.log(
              `[Auth] 레거시 계정 정합성 복구 — userId: ${user.id}, provider: ${account.provider}`
            )
          }

          // users 컬렉션의 provider 필드 정합성 유지
          const dbUser = await db
            .collection('users')
            .findOne({ _id: userId }, { projection: { provider: 1 } })
          if (dbUser && !dbUser.provider) {
            await db
              .collection('users')
              .updateOne(
                { _id: userId },
                { $set: { provider: account.provider } }
              )
            // eslint-disable-next-line no-console
            console.log(
              `[Auth] 레거시 사용자 provider 필드 설정 — userId: ${user.id}, provider: ${account.provider}`
            )
          }
        } catch (error) {
          // 정합성 복구 실패해도 로그인은 허용
          // eslint-disable-next-line no-console
          console.error('[Auth] 레거시 계정 정합성 복구 실패:', error)
        }
      }

      // Auth.js 기본 보안 정책 준수:
      // 동일 이메일이 다른 프로바이더로 이미 존재하면 OAuthAccountNotLinked 에러 자동 발생
      // allowDangerousEmailAccountLinking을 사용하지 않으므로 자동 Account Linking 차단됨
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.provider = account?.provider || 'credentials'
      }

      // 매번 DB에서 role, name, image 조회 (프로필 변경 즉시 반영)
      if (token.email || token.id) {
        try {
          const db = await getDb()
          const query = token.email
            ? { email: token.email }
            : { _id: new ObjectId(token.id as string) }
          const dbUser = await db.collection('users').findOne(query, {
            projection: { role: 1, name: 1, image: 1 },
          })
          if (dbUser) {
            token.role = dbUser.role || 'user'
            token.name = dbUser.name ?? token.name
            token.picture = dbUser.image ?? token.picture
            // eslint-disable-next-line no-console
            console.log(
              `[Auth] User ${token.email || token.id} role: ${token.role}`
            )
          } else {
            token.role = 'user'
            // eslint-disable-next-line no-console
            console.log(
              `[Auth] User ${token.email || token.id} not found, default role: user`
            )
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[Auth] DB lookup error:', error)
          token.role = token.role || 'user'
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
        session.user.role = token.role as 'user' | 'admin'
        // DB에서 갱신된 name/image를 세션에 반영
        if (token.name) session.user.name = token.name as string
        if (token.picture) session.user.image = token.picture as string
      }
      return session
    },
  },
  events: {
    // 소셜 계정 최초 가입 시 provider 필드 설정 (Requirements: 7.1, 7.3)
    async createUser({ user }) {
      if (!user.id) return
      try {
        const db = await getDb()
        // 최초 가입 시 연결된 account에서 프로바이더 정보 조회
        const account = await db
          .collection('accounts')
          .findOne({ userId: new ObjectId(user.id) })
        if (account?.provider) {
          await db
            .collection('users')
            .updateOne(
              { _id: new ObjectId(user.id) },
              { $set: { provider: account.provider } }
            )
          // eslint-disable-next-line no-console
          console.log(
            `[Auth] 신규 사용자 provider 설정 — userId: ${user.id}, provider: ${account.provider}`
          )
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[Auth] createUser 이벤트 처리 실패:', error)
      }
    },
    // Account Linking 시 기존 프로필 보존 확인 로그 (Requirements: 7.2, 7.3)
    async linkAccount({ user, account }) {
      // eslint-disable-next-line no-console
      console.log(
        `[Account Linking] 계정 연결 완료 — userId: ${user.id}, provider: ${account.provider}`
      )
      // 기존 프로필 정보는 MongoDBAdapter가 변경하지 않으므로 자동 보존됨
      // provider 필드는 Primary_Account(최초 가입) 프로바이더를 유지
    },
  },
})
