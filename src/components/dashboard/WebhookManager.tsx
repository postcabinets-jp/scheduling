'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Webhook } from '@/types/database'
import { Plus, Trash2, Globe } from 'lucide-react'

export function WebhookManager({
  userId,
  initialWebhooks,
}: {
  userId: string
  initialWebhooks: Webhook[]
}) {
  const [webhooks, setWebhooks] = useState(initialWebhooks)
  const [showForm, setShowForm] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  async function addWebhook() {
    if (!url.startsWith('https://')) {
      toast.error('HTTPSのURLを入力してください')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: userId,
        url,
        events: ['booking.created', 'booking.cancelled', 'booking.rescheduled'],
        is_active: true,
      })
      .select()
      .single()

    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else if (data) {
      setWebhooks([...webhooks, data])
      setUrl('')
      setShowForm(false)
      toast.success('Webhookを追加しました')
    }
  }

  async function deleteWebhook(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error(error.message)
    } else {
      setWebhooks(webhooks.filter((w) => w.id !== id))
      toast.success('Webhookを削除しました')
    }
  }

  return (
    <div className="space-y-4">
      {webhooks.length > 0 ? (
        <div className="space-y-2">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{webhook.url}</span>
                {webhook.is_active && (
                  <Badge variant="outline" className="text-green-600 border-green-200 flex-shrink-0">
                    有効
                  </Badge>
                )}
              </div>
              <button
                onClick={() => deleteWebhook(webhook.id)}
                className="text-gray-300 hover:text-red-500 transition-colors ml-3"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-2">
          Webhookはまだ設定されていません
        </p>
      )}

      {showForm ? (
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input
              id="webhook_url"
              type="url"
              placeholder="https://your-server.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addWebhook} disabled={loading}>
              {loading ? '追加中...' : '追加'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setUrl('')
              }}
            >
              キャンセル
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm(true)}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Webhookを追加
        </Button>
      )}
    </div>
  )
}
