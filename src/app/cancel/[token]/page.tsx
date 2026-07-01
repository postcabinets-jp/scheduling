'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cancelBookingByToken } from '@/app/actions/bookings'
import { CheckCircle, XCircle } from 'lucide-react'
import { use } from 'react'

export default function CancelPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [result, setResult] = useState<'success' | 'error' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel() {
    setLoading(true)
    const res = await cancelBookingByToken(token, reason)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
      setResult('error')
    } else {
      setResult('success')
    }
  }

  if (result === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-sm w-full text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-900">予約をキャンセルしました</h1>
          <p className="text-sm text-gray-500 mt-2">ご連絡ありがとうございました。</p>
        </div>
      </div>
    )
  }

  if (result === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-sm w-full text-center">
          <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-900">エラーが発生しました</h1>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-sm w-full">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">予約のキャンセル</h1>
        <p className="text-sm text-gray-500 mb-6">
          この予約をキャンセルしてよろしいですか？
        </p>

        <div className="space-y-4">
          <Textarea
            placeholder="キャンセル理由（任意）"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />

          <Button
            className="w-full"
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'キャンセル中...' : 'キャンセルする'}
          </Button>
        </div>
      </div>
    </div>
  )
}
