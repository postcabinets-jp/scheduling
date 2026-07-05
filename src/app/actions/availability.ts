'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateAvailabilitySchema, formatValidationError } from '@/lib/validations'

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
  const parsed = updateAvailabilitySchema.safeParse({
    schedule_id: scheduleId,
    user_id: userId,
    slots,
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  let finalScheduleId = parsed.data.schedule_id

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

  if (parsed.data.slots.length > 0) {
    const { error: insertError } = await supabase
      .from('availability_slots')
      .insert(
        parsed.data.slots.map((slot) => ({
          schedule_id: finalScheduleId as string,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
        }))
      )

    if (insertError) return { error: insertError.message }
  }

  revalidatePath('/dashboard/availability')
  return { success: true }
}
