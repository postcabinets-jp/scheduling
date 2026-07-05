'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  createProfileSchema,
  formatValidationError,
} from '@/lib/validations'

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'メール確認リンクを送信しました。メールをご確認ください。' }
}

export async function loginWithGoogle(): Promise<void> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function resetPassword(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get('email'),
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'パスワードリセットリンクを送信しました。' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function createProfile(formData: FormData) {
  const parsed = createProfileSchema.safeParse({
    username: formData.get('username'),
    display_name: formData.get('display_name'),
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      username: parsed.data.username,
      display_name: parsed.data.display_name,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo',
    })

  if (error) {
    if (error.code === '23505') {
      return { error: 'このユーザー名はすでに使われています' }
    }
    return { error: error.message }
  }

  // Create default availability schedule
  const { data: schedule, error: scheduleError } = await supabase
    .from('availability_schedules')
    .insert({
      user_id: user.id,
      name: 'デフォルト',
      timezone: 'Asia/Tokyo',
      is_default: true,
    })
    .select()
    .single()

  if (!scheduleError && schedule) {
    // Mon-Fri 09:00-17:00
    const defaultSlots = [1, 2, 3, 4, 5].map((day) => ({
      schedule_id: schedule.id,
      day_of_week: day,
      start_time: '09:00',
      end_time: '17:00',
    }))
    await supabase.from('availability_slots').insert(defaultSlots)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
