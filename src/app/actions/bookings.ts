'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  cancelBookingSchema,
  createBookingSchema,
  cancelBookingByTokenSchema,
  formatValidationError,
} from '@/lib/validations'

export async function cancelBooking(bookingId: string, reason?: string) {
  const parsed = cancelBookingSchema.safeParse({
    booking_id: bookingId,
    reason,
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancel_reason: parsed.data.reason ?? null,
    })
    .eq('id', parsed.data.booking_id)
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
  const parsed = createBookingSchema.safeParse(data)
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  // Use admin client for public booking creation (invitee has no auth)
  const supabase = await createAdminClient()

  const { answers, ...bookingData } = parsed.data

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
  const parsed = cancelBookingByTokenSchema.safeParse({
    cancel_token: cancelToken,
    reason,
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createAdminClient()

  const { data: booking, error: findError } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('cancel_token', parsed.data.cancel_token)
    .single()

  if (findError || !booking) return { error: '予約が見つかりません' }
  if (booking.status === 'cancelled') return { error: 'すでにキャンセルされています' }

  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancel_reason: parsed.data.reason ?? 'invitee_cancelled',
    })
    .eq('id', booking.id)

  if (error) return { error: error.message }

  return { success: true }
}
