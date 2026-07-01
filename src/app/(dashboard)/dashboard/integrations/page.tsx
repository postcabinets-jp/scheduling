import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WebhookManager } from '@/components/dashboard/WebhookManager'
import { Video, Calendar, Webhook } from 'lucide-react'
import type { CalendarConnection, Webhook as WebhookType } from '@/types/database'

export default async function IntegrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: rawCalendar }, { data: rawWebhooks }] = await Promise.all([
    supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user!.id),
    supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', user!.id),
  ])
  const calendarConnections = rawCalendar as CalendarConnection[] | null
  const webhooks = rawWebhooks as WebhookType[] | null

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">連携設定</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          カレンダー・ビデオ会議・Webhookの連携を管理します
        </p>
      </div>

      {/* Calendar Integrations */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">カレンダー連携</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            { id: 'google', name: 'Google カレンダー', icon: '📅' },
            { id: 'outlook', name: 'Outlook カレンダー', icon: '📆' },
          ].map((cal) => {
            const connected = calendarConnections?.find((c) => c.provider === cal.id)

            return (
              <div key={cal.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cal.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cal.name}</p>
                    {connected && (
                      <p className="text-xs text-gray-400">{connected.account_email}</p>
                    )}
                  </div>
                </div>
                {connected ? (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    接続済み
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" disabled>
                    接続（近日実装）
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Video Integrations */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">ビデオ会議</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            { id: 'zoom', name: 'Zoom', icon: '🎥' },
            { id: 'teams', name: 'Microsoft Teams', icon: '💼' },
          ].map((vid) => (
            <div key={vid.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{vid.icon}</span>
                <p className="text-sm font-medium text-gray-900">{vid.name}</p>
              </div>
              <Button size="sm" variant="outline" disabled>
                接続（近日実装）
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Webhooks */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-900">Webhook</h2>
          </div>
        </div>

        <div className="px-6 py-4">
          <WebhookManager
            userId={user!.id}
            initialWebhooks={webhooks ?? []}
          />
        </div>
      </section>
    </div>
  )
}
