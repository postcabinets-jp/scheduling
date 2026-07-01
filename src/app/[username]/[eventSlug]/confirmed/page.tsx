import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'
import { CalendarCheck, CheckCircle, Clock, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Booking } from '@/types/database'

type BookingWithEventType = Booking & {
  event_types: { title: string; duration_minutes: number; location_type: string } | null
}

export default async function BookingConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; eventSlug: string }>
  searchParams: Promise<{ bookingId?: string }>
}) {
  const { username, eventSlug } = await params
  const { bookingId } = await searchParams

  const supabase = await createClient()

  let booking: BookingWithEventType | null = null
  if (bookingId) {
    const { data } = await supabase
      .from('bookings')
      .select('*, event_types(title, duration_minutes, location_type)')
      .eq('id', bookingId)
      .single()
    booking = data as BookingWithEventType | null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900 mb-1">予約が確定しました</h1>
          <p className="text-sm text-gray-500 mb-6">確認メールをご確認ください</p>

          {booking && (
            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CalendarCheck className="h-4 w-4 text-gray-400" />
                <span className="font-medium">
                  {format(new Date(booking.start_at), 'M月d日(E) HH:mm', { locale: ja })}
                  {' 〜 '}
                  {format(new Date(booking.end_at), 'HH:mm')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{booking.event_types?.duration_minutes}分</span>
              </div>
              {booking.meeting_url && (
                <a
                  href={booking.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Video className="h-4 w-4" />
                  会議リンクを開く
                </a>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full" variant="outline">
              <Link href={`/${username}`}>
                他の予約を見る
              </Link>
            </Button>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-gray-300 hover:text-gray-500">
            scheduling で作成
          </Link>
        </div>
      </div>
    </div>
  )
}
