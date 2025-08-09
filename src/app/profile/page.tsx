'use client'

import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/components/providers/I18nProvider'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function ProfilePage() {
  const { t } = useI18n()
  const { session, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    // Mock profile data - în realitate ai folosi API
    if (session?.user) {
      const mockProfile: UserProfile = {
        id: session.user.id || '1',
        name: session.user.name || 'User Name',
        email: session.user.email || 'user@example.com',
        role: session.user.role || 'BUYER',
        createdAt: new Date().toISOString()
      }
      setProfile(mockProfile)
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email
      })
    }
    setLoading(false)
  }, [session, isAuthenticated])

  const handleSave = async () => {
    // Mock save - în realitate ai apela API
    if (profile) {
      setProfile({
        ...profile,
        name: formData.name,
        email: formData.email
      })
    }
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">{t('error.profileNotFound')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profile.title')}</h1>
          <p className="text-gray-600">{t('profile.subtitle')}</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {t('profile.personalInfo')}
                {!editing ? (
                  <Button
                    onClick={() => setEditing(true)}
                    variant="outline"
                    size="sm"
                  >
                    {t('common.edit')}
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                    >
                      {t('common.save')}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditing(false)
                        setFormData({
                          name: profile.name,
                          email: profile.email
                        })
                      }}
                      variant="outline"
                      size="sm"
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.name')}
                </label>
                {editing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('auth.namePlaceholder')}
                  />
                ) : (
                  <p className="text-gray-900">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email')}
                </label>
                {editing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('auth.emailPlaceholder')}
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.role')}
                </label>
                <p className="text-gray-900">
                  {profile.role === 'BUYER' ? t('auth.buyer') : 
                   profile.role === 'SELLER' ? t('auth.seller') : 
                   profile.role === 'ADMIN' ? t('auth.admin') : profile.role}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.memberSince')}
                </label>
                <p className="text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString('ro-RO')}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
            >
              {t('nav.dashboard')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
