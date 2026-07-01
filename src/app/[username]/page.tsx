import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Clock, MapPin, CalendarCheck } from 'lucide-react'
import type { Profile, EventType } from '@/types/database'

const locationLabels: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  teams: 'Microsoft Teams',
  phone: '電話',
  in_person: '対面',
  custom: 'カスタム',
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  const profile = rawProfile as Profile | null

  if (!profile) notFound()

  const { data: rawEventTypes } = await supabase
    .from('event_types')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .eq('is_public', true)
    .order('created_at', { ascending: true })
  const eventTypes = rawEventTypes as EventType[] | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600 mx-auto mb-3">
            {profile.display_name[0]}
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{profile.display_name}</h1>
          {profile.bio && (
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Event Types */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
        {eventTypes && eventTypes.length > 0 ? (
          eventTypes.map((eventType) => (
            <Link
              key={eventType.id}
              href={`/${username}/${eventType.slug}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-1 h-full min-h-[56px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: eventType.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {eventType.title}
                  </h3>
                  {eventType.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {eventType.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {eventType.duration_minutes}分
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {locationLabels[eventType.location_type]}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-gray-300 group-hover:text-blue-400 transition-colors mt-1">
                  →
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-16 text-gray-400">
            <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">現在予約可能なイベントはありません</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8">
        <Link href="/" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
          scheduling で作成
        </Link>
      </div>
    </div>
  )
}
