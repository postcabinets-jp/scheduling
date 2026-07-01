'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createEventType(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const data = {
    user_id: user.id,
    slug: formData.get('slug') as string,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    duration_minutes: Number(formData.get('duration_minutes')),
    buffer_before_min: Number(formData.get('buffer_before_min') ?? 0),
    buffer_after_min: Number(formData.get('buffer_after_min') ?? 0),
    min_notice_hours: Number(formData.get('min_notice_hours') ?? 0),
    future_booking_days: Number(formData.get('future_booking_days') ?? 60),
    location_type: formData.get('location_type') as 'zoom' | 'google_meet' | 'teams' | 'phone' | 'in_person' | 'custom',
    location_value: (formData.get('location_value') as string) || null,
    color: (formData.get('color') as string) || '#3B82F6',
  }

  const { error } = await supabase.from('event_types').insert(data)

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const data = {
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    duration_minutes: Number(formData.get('duration_minutes')),
    buffer_before_min: Number(formData.get('buffer_before_min') ?? 0),
    buffer_after_min: Number(formData.get('buffer_after_min') ?? 0),
    min_notice_hours: Number(formData.get('min_notice_hours') ?? 0),
    future_booking_days: Number(formData.get('future_booking_days') ?? 60),
    location_type: formData.get('location_type') as 'zoom' | 'google_meet' | 'teams' | 'phone' | 'in_person' | 'custom',
    location_value: (formData.get('location_value') as string) || null,
    color: (formData.get('color') as string) || '#3B82F6',
    is_active: formData.get('is_active') === 'true',
  }

  const { error } = await supabase
    .from('event_types')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/event-types')
  revalidatePath(`/dashboard/event-types/${id}`)
  return { success: true }
}

export async function toggleEventType(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('event_types')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/event-types')
  return { success: true }
}

export async function deleteEventType(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  // Check for existing bookings
  const { count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('event_type_id', id)
    .eq('status', 'confirmed')

  if (count && count > 0) {
    return { error: '確定済みの予約があるため削除できません。先にキャンセルしてください。' }
  }

  const { error } = await supabase
    .from('event_types')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/event-types')
  redirect('/dashboard/event-types')
}
