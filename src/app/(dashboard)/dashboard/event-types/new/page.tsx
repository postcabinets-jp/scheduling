'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import { createEventType } from '@/app/actions/event-types'
import { ArrowLeft } from 'lucide-react'

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120]
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#0EA5E9', '#14B8A6',
]

export default function NewEventTypePage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#3B82F6')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTitle(val)
    // Auto-generate slug from title
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 60)
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('color', selectedColor)

    const result = await createEventType(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/event-types" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">新規イベントタイプ</h1>
          <p className="text-sm text-gray-500">ミーティングの詳細を設定します</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Title & Slug */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">基本情報</h3>

          <div className="space-y-1.5">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="30分ミーティング"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">URL スラッグ</Label>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="30min-meeting"
              pattern="^[a-z0-9-]{2,60}$"
            />
            <p className="text-xs text-gray-400">英小文字・数字・ハイフンのみ（2〜60文字）</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="このミーティングについての説明..."
            />
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">時間設定</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="duration_minutes">所要時間（分）</Label>
              <Select name="duration_minutes" defaultValue="30">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>{d}分</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="min_notice_hours">最低通知時間（時間前）</Label>
              <Input
                id="min_notice_hours"
                name="min_notice_hours"
                type="number"
                min="0"
                max="168"
                defaultValue="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="buffer_before_min">前バッファ（分）</Label>
              <Input
                id="buffer_before_min"
                name="buffer_before_min"
                type="number"
                min="0"
                max="60"
                defaultValue="0"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="buffer_after_min">後バッファ（分）</Label>
              <Input
                id="buffer_after_min"
                name="buffer_after_min"
                type="number"
                min="0"
                max="60"
                defaultValue="0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="future_booking_days">予約受付日数（今日から何日先まで）</Label>
            <Input
              id="future_booking_days"
              name="future_booking_days"
              type="number"
              min="1"
              max="365"
              defaultValue="60"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">場所・会議形式</h3>

          <div className="space-y-1.5">
            <Label htmlFor="location_type">会議タイプ</Label>
            <Select name="location_type" defaultValue="google_meet">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google_meet">Google Meet</SelectItem>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="teams">Microsoft Teams</SelectItem>
                <SelectItem value="phone">電話</SelectItem>
                <SelectItem value="in_person">対面</SelectItem>
                <SelectItem value="custom">カスタム</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location_value">詳細（URL・住所・電話番号など）</Label>
            <Input
              id="location_value"
              name="location_value"
              placeholder="https://meet.google.com/..."
            />
          </div>
        </div>

        {/* Color */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">カラー</h3>
          <div className="flex gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/event-types">キャンセル</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '作成中...' : 'イベントタイプを作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}
