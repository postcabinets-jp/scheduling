import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { EventTypeCard } from '@/components/dashboard/EventTypeCard'
import { Plus, Calendar } from 'lucide-react'
import type { EventType } from '@/types/database'

export default async function EventTypesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawEventTypes } = await supabase
    .from('event_types')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
  const eventTypes = rawEventTypes as EventType[] | null

  const { data: profileData } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user!.id)
    .single()
  const profile = profileData as { username: string } | null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">イベントタイプ</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            予約可能なミーティング種別を管理します
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/event-types/new">
            <Plus className="h-4 w-4 mr-1.5" />
            新規作成
          </Link>
        </Button>
      </div>

      {eventTypes && eventTypes.length > 0 ? (
        <div className="space-y-3">
          {eventTypes.map((eventType) => (
            <EventTypeCard
              key={eventType.id}
              eventType={eventType}
              username={profile?.username ?? ''}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <h3 className="text-sm font-medium text-gray-700">イベントタイプがありません</h3>
          <p className="text-xs text-gray-400 mt-1 mb-6">
            最初のイベントタイプを作成して予約を受け付けましょう
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard/event-types/new">
              <Plus className="h-4 w-4 mr-1.5" />
              作成する
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
