'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const register = async (userData: {
    name: string
    email: string
    password: string
    role: 'BUYER' | 'SELLER'
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      return data
    } catch (error) {
      throw error
    }
  }

  return {
    session,
    status,
    login,
    logout,
    register,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
  }
}
