import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'ADMIN' | 'USER'
      accountType: 'INDIVIDUAL' | 'COMPANY'
      createdAt: string
    } & DefaultSession['user']
  }

  interface User {
    role: 'ADMIN' | 'USER'
    accountType: 'INDIVIDUAL' | 'COMPANY'
    createdAt: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    accountType: string
    createdAt: string
  }
}
