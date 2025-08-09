"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/components/providers/I18nProvider'

export default function HomePage() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-white">
      {/* Header is handled globally in AppHeader */}

      {/* Hero Section - Elegant and Professional */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-luxbid-gold-50/30 via-white to-luxbid-dark-50/20">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxbid-gold-200 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxbid-gold-200 to-transparent"></div>
        
        <div className="container mx-auto text-center relative z-10 max-w-5xl">
          {/* Premium badge */}
          <div className="inline-flex items-center px-6 py-2 mb-8 rounded-full border border-luxbid-gold-200 bg-white/60 backdrop-blur-sm">
            <span className="text-sm font-medium text-luxbid-dark-700 tracking-wide">LUXURY MARKETPLACE</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-luxbid-dark-900 mb-6 tracking-tight leading-tight">
            Lux<span className="text-luxbid-gold-600">BID</span>
          </h1>
          <p className="text-xl md:text-2xl text-luxbid-dark-600 mb-4 font-light max-w-3xl mx-auto leading-relaxed">{t('home.title')}</p>
          <p className="text-lg text-luxbid-dark-500 mb-12 max-w-2xl mx-auto leading-relaxed">{t('home.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/listings">
              <Button 
                size="lg" 
                style={{
                  backgroundColor: '#B8975A',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '16px',
                  padding: '18px 40px',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(184, 151, 90, 0.25)',
                  letterSpacing: '0.5px'
                }}
                className="hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                {t('home.ctaBrowse')}
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                variant="outline" 
                size="lg"
                style={{
                  backgroundColor: 'transparent',
                  color: '#2D2D2D',
                  fontWeight: '600',
                  fontSize: '16px',
                  padding: '18px 40px',
                  borderRadius: '12px',
                  border: '2px solid #B8975A',
                  letterSpacing: '0.5px'
                }}
                className="hover:bg-luxbid-gold-50 hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                {t('home.ctaSell')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Luxury Design */}
      <section className="py-24 px-4 bg-luxbid-dark-50/30 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-luxbid-dark-900 mb-6 tracking-tight">
              {t('home.whyChoose')}
            </h2>
            <p className="text-lg text-luxbid-dark-600 max-w-2xl mx-auto">
              Descoperă avantajele platformei premium pentru obiecte de lux autentice
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Private Offers Feature */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-luxbid-gold-100 to-luxbid-gold-200 flex items-center justify-center mb-6 shadow-md">
                  <svg className="h-8 w-8 text-luxbid-gold-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-luxbid-dark-900 mb-4">{t('feature.privateOffers.title')}</CardTitle>
                <CardDescription className="text-luxbid-dark-600 leading-relaxed">{t('feature.privateOffers.desc')}</CardDescription>
              </CardHeader>
            </Card>
            
            {/* Authentication Feature */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-luxbid-dark-100 to-luxbid-dark-200 flex items-center justify-center mb-6 shadow-md">
                  <svg className="h-8 w-8 text-luxbid-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-luxbid-dark-900 mb-4">{t('feature.auth.title')}</CardTitle>
                <CardDescription className="text-luxbid-dark-600 leading-relaxed">{t('feature.auth.desc')}</CardDescription>
              </CardHeader>
            </Card>
            
            {/* Low Fees Feature */}
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-luxbid-gold-100 to-luxbid-gold-200 flex items-center justify-center mb-6 shadow-md">
                  <svg className="h-8 w-8 text-luxbid-gold-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <CardTitle className="text-xl font-bold text-luxbid-dark-900 mb-4">{t('feature.fees.title')}</CardTitle>
                <CardDescription className="text-luxbid-dark-600 leading-relaxed">{t('feature.fees.desc')}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section - Premium Design */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-luxbid-dark-900 mb-6 tracking-tight">{t('nav.browse')}</h2>
            <p className="text-lg text-luxbid-dark-600 max-w-2xl mx-auto">
              Explorează colecțiile noastre exclusive de obiecte de lux autentice
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Luxury Watches */}
            <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-white to-luxbid-gold-50/30">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gradient-to-br from-luxbid-gold-50 to-luxbid-gold-100 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-luxbid-gold-600/5"></div>
                  <svg className="h-20 w-20 text-luxbid-gold-700 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="p-8">
                  <CardTitle className="text-xl font-bold text-luxbid-dark-900 mb-3">Ceasuri de Lux</CardTitle>
                  <CardDescription className="text-luxbid-dark-600 leading-relaxed">
                    Rolex, Patek Philippe, Audemars Piguet și alte mărci de prestigiu
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
            
            {/* Designer Bags */}
            <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-white to-luxbid-dark-50/30">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gradient-to-br from-luxbid-dark-50 to-luxbid-dark-100 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-luxbid-dark-600/5"></div>
                  <svg className="h-20 w-20 text-luxbid-dark-700 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="p-8">
                  <CardTitle className="text-xl font-bold text-luxbid-dark-900 mb-3">Genți de Designer</CardTitle>
                  <CardDescription className="text-luxbid-dark-600 leading-relaxed">
                    Hermès, Chanel, Louis Vuitton și alte colecții exclusive
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
            
            {/* Fine Jewelry */}
            <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-white to-luxbid-gold-50/30">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gradient-to-br from-luxbid-gold-50 to-luxbid-gold-100 rounded-t-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-luxbid-gold-600/5"></div>
                  <svg className="h-20 w-20 text-luxbid-gold-700 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <div className="p-8">
                  <CardTitle className="text-xl font-bold text-luxbid-dark-900 mb-3">Bijuterii Fine</CardTitle>
                  <CardDescription className="text-luxbid-dark-600 leading-relaxed">
                    Diamante, pietre prețioase și creații de designer unice
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gradient-to-br from-luxbid-dark-900 to-luxbid-dark-950 text-white py-16 px-4 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-luxbid-gold-400/30 to-transparent"></div>
        
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/luxbid-logo.svg" 
                  alt="LuxBID" 
                  className="h-10 w-auto filter brightness-0 invert"
                />
              </div>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed max-w-md">
                Platforma premium pentru oferte private la obiecte de lux cu autenticitate garantată și servicii de concierge.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-luxbid-gold-600/20 rounded-full flex items-center justify-center hover:bg-luxbid-gold-600/30 transition-colors cursor-pointer">
                  <span className="text-luxbid-gold-400 font-bold">f</span>
                </div>
                <div className="w-12 h-12 bg-luxbid-gold-600/20 rounded-full flex items-center justify-center hover:bg-luxbid-gold-600/30 transition-colors cursor-pointer">
                  <span className="text-luxbid-gold-400 font-bold">ig</span>
                </div>
                <div className="w-12 h-12 bg-luxbid-gold-600/20 rounded-full flex items-center justify-center hover:bg-luxbid-gold-600/30 transition-colors cursor-pointer">
                  <span className="text-luxbid-gold-400 font-bold">in</span>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Platformă</h3>
              <ul className="space-y-3">
                <li><Link href="/listings" className="text-gray-300 hover:text-luxbid-gold-400 transition-colors">Vezi Anunțuri</Link></li>
                <li><Link href="/listings/create" className="text-gray-300 hover:text-luxbid-gold-400 transition-colors">Creează Anunț</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-luxbid-gold-400 transition-colors">Preturi</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-luxbid-gold-400 transition-colors">Despre Noi</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-bold text-white mb-6 text-lg">Suport</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-300 hover:text-luxbid-gold-400 transition-colors">Centru de Ajutor</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-luxbid-gold-400 transition-colors">Contact</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-luxbid-gold-400 transition-colors">Termeni</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-luxbid-gold-400 transition-colors">Confidențialitate</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-luxbid-gold-400/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 LuxBID. Toate drepturile rezervate.</p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">Dezvoltat cu pasiune pentru lux și autenticitate</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
