'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateProfileSchema, formatValidationError } from '@/lib/validations'

export async function updateProfile(formData: FormData) {
  const parsed = updateProfileSchema.safeParse({
    username: formData.get('username'),
    display_name: formData.get('display_name'),
    bio: (formData.get('bio') as string) || null,
    timezone: formData.get('timezone'),
    brand_color: formData.get('brand_color'),
  })
  if (!parsed.success) return { error: formatValidationError(parsed.error) }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('profiles')
    .update({
      username: parsed.data.username,
      display_name: parsed.data.display_name,
      bio: parsed.data.bio,
      timezone: parsed.data.timezone,
      brand_color: parsed.data.brand_color,
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
