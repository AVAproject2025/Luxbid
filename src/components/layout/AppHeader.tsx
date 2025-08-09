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
    <header className="border-b border-luxbid-gold-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-all duration-300">
            <img 
              src="/luxbid-logo.svg" 
              alt="LuxBID" 
              className="h-8 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/listings" className="text-luxbid-dark-600 hover:text-luxbid-gold-600 transition-colors font-medium">
              {t('nav.browse')}
            </Link>
            <Link href="/listings/create" className="text-luxbid-dark-600 hover:text-luxbid-gold-600 transition-colors font-medium">
              {t('nav.createListing')}
            </Link>
            <Link href="/dashboard" className="text-luxbid-gold-600 font-semibold">
              {t('nav.dashboard')}
            </Link>
            <Link href="/messages" className="text-luxbid-dark-600 hover:text-luxbid-gold-600 transition-colors font-medium">
              {t('nav.messages')}
            </Link>
            <Link href="/profile" className="text-luxbid-dark-600 hover:text-luxbid-gold-600 transition-colors font-medium">
              {t('nav.profile')}
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <NotificationBell userId={userId} />
            <select
              aria-label="language"
              className="border border-luxbid-gold-300 rounded-md text-sm px-2 py-1 text-luxbid-dark-600 bg-white hover:border-luxbid-gold-500 transition-colors"
              value={lang}
              onChange={(e) => setLang(e.target.value as 'en' | 'ro' | 'it' | 'de' | 'es')}
            >
              <option value="ro">RO</option>
              <option value="en">EN</option>
              <option value="it">IT</option>
              <option value="de">DE</option>
              <option value="es">ES</option>
            </select>
            <span className="text-sm text-luxbid-dark-600 font-medium">{isAuthenticated ? `${t('header.welcome')}, ${displayName}` : t('header.welcome')}</span>
            {isAuthenticated ? (
              <button
                onClick={() => signOut({ redirect: true })}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxbid-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-luxbid-gold-400 bg-white text-luxbid-dark-700 hover:bg-luxbid-gold-50 hover:border-luxbid-gold-500 h-9 rounded-md px-4"
              >
                {t('nav.signOut')}
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-luxbid-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-brand text-white hover:opacity-90 shadow-md hover:shadow-lg h-9 rounded-md px-4"
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


