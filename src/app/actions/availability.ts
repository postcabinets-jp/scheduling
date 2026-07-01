'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type SlotInput = {
  day_of_week: number
  start_time: string
  end_time: string
}

export async function updateAvailability(
  scheduleId: string | null,
  userId: string,
  slots: SlotInput[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  let finalScheduleId = scheduleId

  if (!finalScheduleId) {
    // Create default schedule
    const { data: newSchedule, error: createError } = await supabase
      .from('availability_schedules')
      .insert({
        user_id: user.id,
        name: 'デフォルト',
        timezone: 'Asia/Tokyo',
        is_default: true,
      })
      .select()
      .single()

    if (createError) return { error: createError.message }
    finalScheduleId = newSchedule.id
  }

  // Delete existing slots and replace
  const { error: deleteError } = await supabase
    .from('availability_slots')
    .delete()
    .eq('schedule_id', finalScheduleId)

  if (deleteError) return { error: deleteError.message }

  if (slots.length > 0) {
    const { error: insertError } = await supabase
      .from('availability_slots')
      .insert(
        slots.map((slot) => ({
          schedule_id: finalScheduleId as string,
          ...slot,
        }))
      )

    if (insertError) return { error: insertError.message }
  }

  revalidatePath('/dashboard/availability')
  return { success: true }
}
