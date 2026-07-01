'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { EventType } from '@/types/database'
import { toggleEventType } from '@/app/actions/event-types'
import { Clock, MapPin, Link2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

const locationLabels: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  teams: 'Microsoft Teams',
  phone: '電話',
  in_person: '対面',
  custom: 'カスタム',
}

export function EventTypeCard({
  eventType,
  username,
}: {
  eventType: EventType
  username: string
}) {
  const [isActive, setIsActive] = useState(eventType.is_active)
  const [copied, setCopied] = useState(false)

  const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/${username}/${eventType.slug}`

  async function handleToggle() {
    const newState = !isActive
    setIsActive(newState)
    const result = await toggleEventType(eventType.id, newState)
    if (result?.error) {
      setIsActive(!newState)
      toast.error(result.error)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    toast.success('URLをコピーしました')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 transition-opacity ${
      isActive ? '' : 'opacity-60'
    }`}>
      <div className="flex items-start gap-4">
        {/* Color indicator */}
        <div
          className="w-1 h-full min-h-[60px] rounded-full flex-shrink-0"
          style={{ backgroundColor: eventType.color }}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                href={`/dashboard/event-types/${eventType.id}`}
                className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {eventType.title}
              </Link>
              {eventType.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {eventType.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  {eventType.duration_minutes}分
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="h-3 w-3" />
                  {locationLabels[eventType.location_type]}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Link2 className="h-3 w-3" />
                  /{username}/{eventType.slug}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={copyLink}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="URLをコピー"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              {/* Toggle switch */}
              <button
                onClick={handleToggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isActive ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
