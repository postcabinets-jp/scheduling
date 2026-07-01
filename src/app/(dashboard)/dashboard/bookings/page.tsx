import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { BookingActions } from '@/components/dashboard/BookingActions'
import { Video, Phone, MapPin } from 'lucide-react'
import type { Booking } from '@/types/database'

type BookingEventType = {
  title: string
  color: string
  duration_minutes: number
  location_type: string
}

type BookingWithEvent = Booking & {
  event_types: BookingEventType | null
}

const statusLabels: Record<string, { label: string; class: string }> = {
  confirmed: { label: '確定', class: 'bg-green-100 text-green-700' },
  cancelled: { label: 'キャンセル', class: 'bg-gray-100 text-gray-600' },
  rescheduled: { label: '変更済', class: 'bg-yellow-100 text-yellow-700' },
  no_show: { label: '不参加', class: 'bg-red-100 text-red-600' },
}

const locationIcons: Record<string, React.ElementType> = {
  zoom: Video,
  google_meet: Video,
  teams: Video,
  phone: Phone,
  in_person: MapPin,
  custom: MapPin,
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab = params.tab ?? 'upcoming'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date().toISOString()

  let query = supabase
    .from('bookings')
    .select('*, event_types(title, color, duration_minutes, location_type)')
    .eq('host_user_id', user!.id)
    .order('start_at', { ascending: tab === 'upcoming' })

  if (tab === 'upcoming') {
    query = query.gte('start_at', now).eq('status', 'confirmed')
  } else if (tab === 'past') {
    query = query.lt('start_at', now)
  } else if (tab === 'cancelled') {
    query = query.in('status', ['cancelled', 'no_show'])
  }

  const { data: rawBookings } = await query.limit(50)
  const bookings = rawBookings as BookingWithEvent[] | null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">予約一覧</h1>
        <p className="text-sm text-gray-500 mt-0.5">すべての予約を管理します</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: 'upcoming', label: '今後' },
          { key: 'past', label: '過去' },
          { key: 'cancelled', label: 'キャンセル済み' },
        ].map((t) => (
          <a
            key={t.key}
            href={`/dashboard/bookings?tab=${t.key}`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {bookings && bookings.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => {
              const eventType = booking.event_types
              const start = new Date(booking.start_at)
              const statusInfo = statusLabels[booking.status]
              const LocationIcon = locationIcons[eventType?.location_type ?? 'custom']

              return (
                <div key={booking.id} className="flex items-center gap-4 px-6 py-4">
                  <div
                    className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: eventType?.color ?? '#3B82F6' }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{booking.invitee_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-gray-500">{eventType?.title}</p>
                      {booking.meeting_url && (
                        <a
                          href={booking.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <LocationIcon className="h-3 w-3" />
                          会議リンク
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-700">
                      {format(start, 'M月d日(E)', { locale: ja })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(start, 'HH:mm')} · {eventType?.duration_minutes}分
                    </p>
                  </div>

                  {booking.status === 'confirmed' && (
                    <BookingActions bookingId={booking.id} />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">予約がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}
