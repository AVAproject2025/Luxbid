"use client"

import { useState, useEffect } from 'react'
import { useI18n } from '@/components/providers/I18nProvider'

interface CountdownProps {
  endDate: Date
  onEnd?: () => void
}

export function Countdown({ endDate, onEnd }: CountdownProps) {
  const { t } = useI18n()
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        onEnd?.()
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate, onEnd])

  const isEnded = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (isEnded) {
    return <div className="text-red-600 font-semibold">{t('common.ended')}</div>
  }

  return (
    <div className="flex space-x-2">
      {timeLeft.days > 0 && (
        <div className="text-center">
          <div className="bg-gray-100 rounded-lg p-2 min-w-[50px]">
            <div className="text-lg font-bold text-gray-900">{timeLeft.days}</div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
        </div>
      )}
      <div className="text-center">
        <div className="bg-gray-100 rounded-lg p-2 min-w-[50px]">
          <div className="text-lg font-bold text-gray-900">{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className="text-xs text-gray-500">Hours</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-gray-100 rounded-lg p-2 min-w-[50px]">
          <div className="text-lg font-bold text-gray-900">{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs text-gray-500">Minutes</div>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-gray-100 rounded-lg p-2 min-w-[50px]">
          <div className="text-lg font-bold text-gray-900">{timeLeft.seconds.toString().padStart(2, '0')}</div>
          <div className="text-xs text-gray-500">Seconds</div>
        </div>
      </div>
    </div>
  )
}
