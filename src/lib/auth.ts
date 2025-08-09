import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

type AppUserRole = 'USER' | 'ADMIN'
type AppAccountType = 'INDIVIDUAL' | 'COMPANY'

enum RoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

enum AccountTypeEnum {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as AppUserRole,
          accountType: user.accountType as AppAccountType,
          createdAt: user.createdAt.toISOString(),
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user.role as AppUserRole) || RoleEnum.USER
        token.accountType = (user.accountType as AppAccountType) || AccountTypeEnum.INDIVIDUAL
        token.createdAt = user.createdAt || new Date().toISOString()
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = (token.role as AppUserRole) || RoleEnum.USER
        session.user.accountType = (token.accountType as AppAccountType) || AccountTypeEnum.INDIVIDUAL
        session.user.createdAt = token.createdAt as string || new Date().toISOString()
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
