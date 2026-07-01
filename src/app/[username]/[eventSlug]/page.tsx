import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BookingCalendar } from '@/components/booking/BookingCalendar'
import { Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { EventType, AvailabilitySlot, EventTypeQuestion } from '@/types/database'

type ProfileRow = { id: string; display_name: string; username: string; timezone: string }
type EventTypeWithQuestions = EventType & { event_type_questions: EventTypeQuestion[] }
type ScheduleWithSlots = { availability_slots: AvailabilitySlot[] }

const locationLabels: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  teams: 'Microsoft Teams',
  phone: '電話',
  in_person: '対面',
  custom: 'カスタム',
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ username: string; eventSlug: string }>
}) {
  const { username, eventSlug } = await params
  const supabase = await createClient()

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('id, display_name, username, timezone')
    .eq('username', username)
    .single()
  const profile = rawProfile as ProfileRow | null

  if (!profile) notFound()

  const { data: rawEventType } = await supabase
    .from('event_types')
    .select('*, event_type_questions(*)')
    .eq('user_id', profile.id)
    .eq('slug', eventSlug)
    .eq('is_active', true)
    .single()
  const eventType = rawEventType as EventTypeWithQuestions | null

  if (!eventType) notFound()

  // Load availability
  const { data: rawSchedule } = await supabase
    .from('availability_schedules')
    .select('*, availability_slots(*)')
    .eq('user_id', profile.id)
    .eq('is_default', true)
    .single()
  const schedule = rawSchedule as ScheduleWithSlots | null

  // Load existing bookings for conflict checking
  const now = new Date()
  const futureEnd = new Date()
  futureEnd.setDate(now.getDate() + (eventType.future_booking_days ?? 60))

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_at, end_at')
    .eq('host_user_id', profile.id)
    .eq('status', 'confirmed')
    .gte('start_at', now.toISOString())
    .lte('end_at', futureEnd.toISOString())

  const questions = eventType.event_type_questions ?? [] as EventTypeQuestion[]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Event info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <Link
                href={`/${username}`}
                className="text-xs text-gray-400 hover:text-gray-600 mb-4 block"
              >
                ← {profile.display_name}
              </Link>

              <div
                className="w-2 h-2 rounded-full mb-3"
                style={{ backgroundColor: eventType.color }}
              />
              <h1 className="text-base font-semibold text-gray-900">{eventType.title}</h1>

              {eventType.description && (
                <p className="text-sm text-gray-500 mt-2">{eventType.description}</p>
              )}

              <div className="flex flex-col gap-2 mt-4">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {eventType.duration_minutes}分
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {locationLabels[eventType.location_type]}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Calendar + Form */}
          <div className="lg:col-span-2">
            <BookingCalendar
              eventTypeId={eventType.id}
              hostUserId={profile.id}
              hostUsername={username}
              durationMinutes={eventType.duration_minutes}
              bufferBefore={eventType.buffer_before_min}
              bufferAfter={eventType.buffer_after_min}
              minNoticeHours={eventType.min_notice_hours}
              futureBookingDays={eventType.future_booking_days}
              slots={schedule?.availability_slots ?? []}
              existingBookings={existingBookings ?? []}
              questions={questions.sort((a, b) => a.sort_order - b.sort_order)}
              hostTimezone={profile.timezone}
              eventSlug={eventSlug}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
