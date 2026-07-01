'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const username = formData.get('username') as string
  const displayName = formData.get('display_name') as string
  const bio = (formData.get('bio') as string) || null
  const timezone = formData.get('timezone') as string
  const brandColor = formData.get('brand_color') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      display_name: displayName,
      bio,
      timezone,
      brand_color: brandColor,
    })
    .eq('id', user.id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'このユーザー名はすでに使われています' }
    }
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}
