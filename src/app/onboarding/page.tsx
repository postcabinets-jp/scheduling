'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProfile } from '@/app/actions/auth'
import { CalendarCheck, User, AtSign } from 'lucide-react'

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')

  const isValidUsername = /^[a-z0-9_-]{3,30}$/.test(username)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isValidUsername) return

    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createProfile(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <CalendarCheck className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h1 className="text-2xl font-semibold text-gray-900">プロフィールを設定</h1>
          <p className="mt-2 text-sm text-gray-500">
            予約ページのURLになるユーザー名を決めてください
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="display_name" className="text-sm text-gray-700">
                <User className="h-3.5 w-3.5 inline mr-1" />
                表示名
              </Label>
              <Input
                id="display_name"
                name="display_name"
                required
                placeholder="田中 健二"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm text-gray-700">
                <AtSign className="h-3.5 w-3.5 inline mr-1" />
                ユーザー名
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  scheduling.app/
                </span>
                <Input
                  id="username"
                  name="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="tanaka-kenji"
                  className="h-10 pl-32"
                  pattern="^[a-z0-9_-]{3,30}$"
                />
              </div>
              <p className="text-xs text-gray-400">
                英小文字・数字・ハイフン・アンダースコア（3〜30文字）
              </p>
              {username && !isValidUsername && (
                <p className="text-xs text-red-500">
                  使用できない文字が含まれています
                </p>
              )}
            </div>

            {username && isValidUsername && (
              <div className="bg-blue-50 rounded-lg px-4 py-3">
                <p className="text-xs text-blue-600 font-medium">予約ページURL</p>
                <p className="text-sm text-blue-800 mt-0.5">
                  scheduling.app/<strong>{username}</strong>
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-10"
              disabled={loading || !isValidUsername}
            >
              {loading ? '設定中...' : 'セットアップを完了'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
