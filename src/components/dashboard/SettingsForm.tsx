'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateProfile } from '@/app/actions/profile'
import { toast } from 'sonner'
import type { Profile } from '@/types/database'

const TIMEZONES = [
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Australia/Sydney',
]

const BRAND_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#0EA5E9', '#14B8A6',
  '#6366F1', '#64748B',
]

export function SettingsForm({ profile }: { profile: Profile }) {
  const [loading, setLoading] = useState(false)
  const [timezone, setTimezone] = useState(profile.timezone)
  const [brandColor, setBrandColor] = useState(profile.brand_color)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('timezone', timezone)
    formData.set('brand_color', brandColor)

    const result = await updateProfile(formData)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('プロフィールを更新しました')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="display_name">表示名</Label>
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile.display_name}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">ユーザー名</Label>
            <Input
              id="username"
              name="username"
              defaultValue={profile.username}
              required
              pattern="^[a-z0-9_-]{3,30}$"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">プロフィール文</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio ?? ''}
            rows={3}
            placeholder="自己紹介を入力..."
          />
        </div>

        <div className="space-y-1.5">
          <Label>タイムゾーン</Label>
          <Select value={timezone} onValueChange={(v) => setTimezone(v ?? '')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>ブランドカラー</Label>
          <div className="flex gap-2">
            {BRAND_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setBrandColor(color)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  brandColor === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={loading} size="sm">
            {loading ? '保存中...' : '変更を保存'}
          </Button>
        </div>
      </form>
    </div>
  )
}
