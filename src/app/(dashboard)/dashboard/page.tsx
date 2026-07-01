import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle, XCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { Booking } from '@/types/database'

type BookingWithEvent = Booking & {
  event_types: { title: string; color: string; duration_minutes: number } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date().toISOString()

  const [
    { data: rawBookings },
    { data: rawEventTypes },
    { count: totalBookings },
    { count: cancelledCount },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, event_types(title, color, duration_minutes)')
      .eq('host_user_id', user!.id)
      .eq('status', 'confirmed')
      .gte('start_at', now)
      .order('start_at', { ascending: true })
      .limit(5),
    supabase
      .from('event_types')
      .select('id, title, slug, color, duration_minutes, is_active')
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .limit(5),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('host_user_id', user!.id)
      .eq('status', 'confirmed'),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('host_user_id', user!.id)
      .eq('status', 'cancelled'),
  ])
  const upcomingBookings = rawBookings as BookingWithEvent[] | null
  const eventTypes = rawEventTypes as Array<{ id: string; title: string; slug: string; color: string; duration_minutes: number; is_active: boolean }> | null

  const stats = [
    {
      label: '確定済み予約',
      value: totalBookings ?? 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'イベントタイプ',
      value: eventTypes?.length ?? 0,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'キャンセル',
      value: cancelledCount ?? 0,
      icon: XCircle,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <span className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">今後の予約</h2>
          <Link
            href="/dashboard/bookings"
            className="text-xs text-blue-600 hover:underline"
          >
            すべて見る
          </Link>
        </div>

        {upcomingBookings && upcomingBookings.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {upcomingBookings.map((booking) => {
              const eventType = booking.event_types as { title: string; color: string; duration_minutes: number } | null
              const start = new Date(booking.start_at)

              return (
                <div key={booking.id} className="flex items-center gap-4 px-6 py-4">
                  <div
                    className="w-1 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: eventType?.color ?? '#3B82F6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {booking.invitee_name}
                    </p>
                    <p className="text-xs text-gray-500">{eventType?.title}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-700">
                      {format(start, 'M/d (E)', { locale: ja })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(start, 'HH:mm')} · {eventType?.duration_minutes}分
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">今後の予約はありません</p>
            <p className="text-xs mt-1">イベントタイプを公開して予約を受け付けましょう</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button asChild variant="outline" className="justify-start h-auto py-3 px-4">
            <Link href="/dashboard/event-types/new">
              <Plus className="h-4 w-4 mr-2 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-medium">新しいイベントタイプ</p>
                <p className="text-xs text-gray-400 font-normal">ミーティング種別を追加</p>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="justify-start h-auto py-3 px-4">
            <Link href="/dashboard/availability">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-medium">空き枠を設定</p>
                <p className="text-xs text-gray-400 font-normal">受付時間を更新する</p>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
