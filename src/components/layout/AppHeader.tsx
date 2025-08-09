'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import NotificationBell from '@/components/ui/notification-bell'
import type { ReactElement } from 'react'
import { useI18n } from '@/components/providers/I18nProvider'

export default function AppHeader(): ReactElement {
  const { data: session, status } = useSession()
  const { t, lang, setLang } = useI18n()

  const isAuthenticated = status === 'authenticated' && !!session?.user
  const displayName = (session?.user?.name || session?.user?.email || 'Guest') as string
  const userId = (session?.user as { id?: string } | undefined)?.id || 'guest'

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
            <span className="text-xl font-bold text-gray-900">LuxBID</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/listings" className="text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.browse')}
            </Link>
            <Link href="/dashboard" className="text-gray-900 font-medium">
              {t('nav.dashboard')}
            </Link>
            <Link href="/messages" className="text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.messages')}
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.profile')}
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <NotificationBell userId={userId} />
            <select
              aria-label="language"
              className="border rounded-md text-sm px-2 py-1 text-gray-600"
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'ro' | 'it' | 'de' | 'es')}
            >
              <option value="ro">RO</option>
              <option value="en">EN</option>
              <option value="it">IT</option>
              <option value="de">DE</option>
              <option value="es">ES</option>
            </select>
            <span className="text-sm text-gray-600">{isAuthenticated ? `${t('header.welcome')}, ${displayName}` : t('header.welcome')}</span>
            {isAuthenticated ? (
              <button
                onClick={() => signOut({ redirect: true })}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
              >
                {t('nav.signOut')}
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
              >
                {t('nav.signIn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}


