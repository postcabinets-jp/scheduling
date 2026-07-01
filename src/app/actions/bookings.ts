'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function cancelBooking(bookingId: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancel_reason: reason ?? null,
    })
    .eq('id', bookingId)
    .eq('host_user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/bookings')
  return { success: true }
}

export async function createBooking(data: {
  event_type_id: string
  host_user_id: string
  invitee_name: string
  invitee_email: string
  invitee_timezone: string
  start_at: string
  end_at: string
  answers?: Array<{ question_id: string; value: string }>
}) {
  // Use admin client for public booking creation (invitee has no auth)
  const supabase = await createAdminClient()

  const { answers, ...bookingData } = data

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single()

  if (error) return { error: error.message }

  // Insert answers if provided
  if (answers && answers.length > 0) {
    await supabase.from('booking_answers').insert(
      answers.map((a) => ({
        booking_id: booking.id,
        question_id: a.question_id,
        value: a.value,
      }))
    )
  }

  return { booking }
}

export async function cancelBookingByToken(cancelToken: string, reason?: string) {
  const supabase = await createAdminClient()

  const { data: booking, error: findError } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('cancel_token', cancelToken)
    .single()

  if (findError || !booking) return { error: '予約が見つかりません' }
  if (booking.status === 'cancelled') return { error: 'すでにキャンセルされています' }

  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancel_reason: reason ?? 'invitee_cancelled',
    })
    .eq('id', booking.id)

  if (error) return { error: error.message }

  return { success: true }
}
