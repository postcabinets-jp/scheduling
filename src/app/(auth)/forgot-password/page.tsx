'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/app/actions/auth'
import { CalendarCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await resetPassword(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <CalendarCheck className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">scheduling</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">パスワードをリセット</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-500 mb-6">
                登録済みのメールアドレスを入力してください。パスワードリセットリンクをお送りします。
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-gray-700">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="h-10"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" className="w-full h-10" disabled={loading}>
                {loading ? '送信中...' : 'リセットリンクを送信'}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-blue-600 hover:underline">
            ← ログインへ戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
