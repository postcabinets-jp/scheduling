import { createClient } from '@/lib/supabase/server'
import { AvailabilityEditor } from '@/components/dashboard/AvailabilityEditor'
import type { AvailabilitySchedule, AvailabilitySlot } from '@/types/database'

type ScheduleWithSlots = AvailabilitySchedule & {
  availability_slots: AvailabilitySlot[]
}

export default async function AvailabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: schedule } = await supabase
    .from('availability_schedules')
    .select('*, availability_slots(*)')
    .eq('user_id', user!.id)
    .eq('is_default', true)
    .single() as { data: ScheduleWithSlots | null }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">空き枠管理</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          予約を受け付ける曜日・時間帯を設定します
        </p>
      </div>

      <AvailabilityEditor
        scheduleId={schedule?.id ?? null}
        userId={user!.id}
        initialSlots={schedule?.availability_slots ?? []}
        timezone={schedule?.timezone ?? 'Asia/Tokyo'}
      />
    </div>
  )
}
