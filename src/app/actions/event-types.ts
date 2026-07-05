'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  createEventTypeSchema,
  updateEventTypeSchema,
  toggleEventTypeSchema,
  deleteEventTypeSchema,
  formatValidationError,
} from '@/lib/validations'

export async function createEventType(formData: FormData) {
  const parsed = createEventTypeSchema.safeParse({
    slug: formData.get('slug'),
    title: formData.get('title'),
    description: (formData.get('description') as string) || null,
    duration_minutes: Number(formData.get('duration_minutes')),
    buffer_before_min: Number(formData.get('buffer_before_min') ?? 0),
    buffer_after_min: Number(formData.get('buffer_after_min') ?? 0),
    min_notice_hours: Number(formData.get('min_notice_hours') ?? 0),
    future_booking_days: Number(formData.get('future_booking_days') ?? 60),
    location_type: formData.get('location_type'),
    location_value: (formData.get('location_value') as string) || null,
    color: (formData.get('color') as string) || '#3B82F6',
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase.from('event_types').insert({
    user_id: user.id,
    ...parsed.data,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'このスラッグはすでに使われています' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/event-types')
  redirect('/dashboard/event-types')
}

export async function updateEventType(id: string, formData: FormData) {
  const parsed = updateEventTypeSchema.safeParse({
    id,
    title: formData.get('title'),
    description: (formData.get('description') as string) || null,
    duration_minutes: Number(formData.get('duration_minutes')),
    buffer_before_min: Number(formData.get('buffer_before_min') ?? 0),
    buffer_after_min: Number(formData.get('buffer_after_min') ?? 0),
    min_notice_hours: Number(formData.get('min_notice_hours') ?? 0),
    future_booking_days: Number(formData.get('future_booking_days') ?? 60),
    location_type: formData.get('location_type'),
    location_value: (formData.get('location_value') as string) || null,
    color: (formData.get('color') as string) || '#3B82F6',
    is_active: formData.get('is_active') === 'true',
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { id: validatedId, ...updateData } = parsed.data

  const { error } = await supabase
    .from('event_types')
    .update(updateData)
    .eq('id', validatedId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/event-types')
  revalidatePath(`/dashboard/event-types/${validatedId}`)
  return { success: true }
}

export async function toggleEventType(id: string, isActive: boolean) {
  const parsed = toggleEventTypeSchema.safeParse({
    id,
    is_active: isActive,
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('event_types')
    .update({ is_active: parsed.data.is_active })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/event-types')
  return { success: true }
}

export async function deleteEventType(id: string) {
  const parsed = deleteEventTypeSchema.safeParse({ id })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  // Check for existing bookings
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('event_type_id', parsed.data.id)
    .eq('status', 'confirmed')

  if (count && count > 0) {
    return { error: '確定済みの予約があるため削除できません。先にキャンセルしてください。' }
  }

  const { error } = await supabase
    .from('event_types')
    .delete()
    .eq('id', parsed.data.id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/event-types')
  redirect('/dashboard/event-types')
}
