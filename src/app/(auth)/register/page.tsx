'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register, loginWithGoogle } from '@/app/actions/auth'
import { CalendarCheck } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string

    if (password !== confirm) {
      setError('パスワードが一致しません')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      setLoading(false)
      return
    }

    const result = await register(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">メールを確認してください</h2>
            <p className="text-sm text-gray-500">{success}</p>
            <Link href="/login" className="mt-6 block text-sm text-blue-600 hover:underline">
              ログインへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <CalendarCheck className="h-7 w-7 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">scheduling</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">無料アカウントを作成</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <form action={loginWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google で登録
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-3">または</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-gray-700">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-gray-700">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="8文字以上"
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password" className="text-sm text-gray-700">パスワード（確認）</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                className="h-10"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? '登録中...' : 'アカウントを作成'}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              登録することで、利用規約とプライバシーポリシーに同意したとみなされます
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
