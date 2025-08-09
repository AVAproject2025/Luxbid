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
    <header className="border-b border-luxbid-gold-200/50 bg-white/98 backdrop-blur-md shadow-lg relative">
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxbid-gold-300/40 to-transparent"></div>
      <div className="container mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-all duration-300">
            <img 
              src="/luxbid-logo.svg" 
              alt="LuxBID" 
              className="h-8 w-auto"
            />
          </Link>
          <nav className="hidden lg:flex items-center space-x-10">
            <Link href="/listings" className="text-luxbid-dark-700 hover:text-luxbid-gold-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105">
              {t('nav.browse')}
            </Link>
            <Link href="/listings/create" className="text-luxbid-dark-700 hover:text-luxbid-gold-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105">
              {t('nav.createListing')}
            </Link>
            <Link href="/pricing" className="text-luxbid-dark-700 hover:text-luxbid-gold-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105">
              Pricing
            </Link>
            <Link href="/dashboard" className="px-4 py-2 bg-luxbid-gold-50 text-luxbid-gold-700 rounded-full font-semibold text-sm tracking-wide hover:bg-luxbid-gold-100 transition-all duration-300">
              {t('nav.dashboard')}
            </Link>
            <Link href="/messages" className="text-luxbid-dark-700 hover:text-luxbid-gold-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105">
              {t('nav.messages')}
            </Link>
            <Link href="/profile" className="text-luxbid-dark-700 hover:text-luxbid-gold-600 transition-all duration-300 font-medium text-sm tracking-wide hover:scale-105">
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
                style={{
                  backgroundColor: 'white',
                  color: '#2D2D2D',
                  fontWeight: 'bold',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '2px solid #B8975A',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
                className="inline-flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                {t('nav.signOut')}
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                style={{
                  backgroundColor: '#B8975A',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
                className="inline-flex items-center justify-center hover:opacity-90 transition-opacity"
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


