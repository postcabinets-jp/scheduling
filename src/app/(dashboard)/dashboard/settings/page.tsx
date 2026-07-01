import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/dashboard/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">設定</h1>
        <p className="text-sm text-gray-500 mt-0.5">プロフィールとアカウント設定を管理します</p>
      </div>

      <SettingsForm profile={profile} />
    </div>
  )
}
