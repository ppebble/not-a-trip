import 'next-auth'
import { DefaultSession } from 'next-auth'
import { UserRole } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      provider: string
      nickname?: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    id: string
    provider?: string
    nickname?: string
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    provider: string
    nickname?: string
    role: UserRole
  }
}
