import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      provider: string
      nickname?: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    provider?: string
    nickname?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    provider: string
    nickname?: string
  }
}
