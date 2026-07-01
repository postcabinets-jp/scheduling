import Link from 'next/link'
import { CalendarCheck, Clock, Video, Bell, Users, Webhook, ArrowRight, GitFork } from 'lucide-react'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  )
}
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: CalendarCheck,
    title: 'イベントタイプ（無制限）',
    description: '1:1ミーティング・グループ・ウェビナーなど種別ごとに所要時間・バッファ・定員を設定。Free枠制限なし。',
  },
  {
    icon: Clock,
    title: '空き枠の完全コントロール',
    description: '週次テンプレ・最低通知時間・最大予約数/日・休暇設定まで細かく制御。特定日のブロックも1クリック。',
  },
  {
    icon: Video,
    title: 'ビデオ会議と自動連携',
    description: 'Google Meet・Zoom・Teams のURLを予約確定と同時に自動生成。カレンダー招待に埋め込んで送信。',
  },
  {
    icon: Bell,
    title: '確認・リマインダーメール',
    description: '予約確定・1日前・1時間前に自動通知。メール文面は完全カスタマイズ可能。',
  },
  {
    icon: Users,
    title: 'チーム予約（ラウンドロビン）',
    description: '複数ホストを登録して均等 or 優先順位付きで担当を自動振り分け。チーム全員が個別予約URLも持てる。',
  },
  {
    icon: Webhook,
    title: 'Webhook & API',
    description: 'booking.created など3種のイベントをHTTPS POSTで任意URLに送信。HubSpot・Slack連携も自作可能。',
  },
]

const VERCEL_DEPLOY_URL =
  'https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/scheduling&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL'

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-blue-600" />
            <span className="text-base font-semibold text-gray-900">scheduling</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/postcabinets-jp/scheduling"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
            <Button asChild size="sm" variant="outline">
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">無料で始める</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <GithubIcon className="h-3.5 w-3.5" />
          OSSプロジェクト — 完全無料でフル機能
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
          予約ページを
          <br />
          <span className="text-blue-600">URLで即公開</span>
        </h1>

        <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Calendlyの月額 $10/シートを払い続けるのをやめませんか。
          <br />
          scheduling はVercelワンクリックデプロイで15分で立ち上がるOSSスケジューラーです。
          シート課金なし、カスタムブランド制限なし。
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="h-11 px-6">
            <Link href="/register">
              無料でアカウントを作成
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <a
            href={VERCEL_DEPLOY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 h-11 px-5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Vercel にデプロイ
          </a>
        </div>

        <p className="mt-4 text-xs text-gray-400">
          クレジットカード不要 · セットアップ15分 · 永久無料
        </p>
      </section>

      {/* Demo UI Mockup */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 h-8 flex items-center gap-2 px-4 border-b border-gray-200">
            <div className="w-3 h-3 rounded-full bg-red-300" />
            <div className="w-3 h-3 rounded-full bg-yellow-300" />
            <div className="w-3 h-3 rounded-full bg-green-300" />
            <span className="ml-3 text-xs text-gray-400">scheduling.app/tanaka-kenji/30min</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-80">
            <div className="border-r border-gray-200 p-6 bg-white">
              <div className="w-12 h-12 rounded-full bg-blue-100 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-24 mb-6" />
              <div className="h-3 bg-blue-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
            <div className="lg:col-span-2 p-6">
              <div className="grid grid-cols-7 gap-2 mb-6">
                {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
                  <div key={d} className="text-center text-xs text-gray-400">{d}</div>
                ))}
                {Array.from({ length: 28 }, (_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                      i === 8
                        ? 'bg-blue-600 text-white'
                        : [3, 4, 10, 11, 17, 18, 24, 25].includes(i)
                        ? 'text-gray-200'
                        : 'text-gray-600 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['09:00', '09:30', '10:00', '11:00', '14:00', '15:30'].map((t) => (
                  <div key={t} className="py-2 text-center text-xs border border-blue-200 text-blue-700 rounded-lg">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">
              Calendlyのすべての機能を、コスト0で
            </h2>
            <p className="mt-3 text-gray-500 text-sm max-w-xl mx-auto">
              $10/シート/月の課金構造を捨てて、自社サーバーで完全にコントロール。
              チームが20人になっても追加コストはゼロ。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="p-5 border border-gray-200 rounded-xl">
                <feature.icon className="h-5 w-5 text-blue-600 mb-3" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Calendly vs scheduling
          </h2>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 border-b border-gray-100">
              <div className="p-4 text-xs font-medium text-gray-500">機能</div>
              <div className="p-4 text-xs font-medium text-gray-500 border-l border-gray-100">Calendly</div>
              <div className="p-4 text-xs font-medium text-blue-600 border-l border-gray-100">scheduling</div>
            </div>

            {[
              ['シート課金', '$10/シート/月', '無料（OSS）'],
              ['イベントタイプ数', 'Free: 1種のみ', '無制限'],
              ['カスタムブランディング', '有料プランのみ', '完全無料'],
              ['カスタムドメイン', '有料プランのみ', 'Vercel設定で可'],
              ['Webhook', 'Standard以上', '全ユーザー'],
              ['データ所有権', 'Calendlyサーバー', '自社Supabase'],
              ['セルフホスト', '不可', 'Vercel 1クリック'],
            ].map(([feature, calendly, sched]) => (
              <div key={feature} className="grid grid-cols-3 border-b border-gray-100 last:border-0">
                <div className="p-4 text-xs text-gray-700">{feature}</div>
                <div className="p-4 text-xs text-gray-500 border-l border-gray-100">{calendly}</div>
                <div className="p-4 text-xs text-blue-700 font-medium border-l border-gray-100">{sched}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deploy CTA */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">今すぐデプロイする</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xl mx-auto">
            Vercel Deploy Button を押して、Supabaseプロジェクトに接続するだけ。
            エンジニアでなくても15分でセルフホスト版が立ち上がります。
          </p>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-left font-mono text-sm space-y-2 mb-8">
            <p className="text-gray-400"># 手動セットアップの場合</p>
            <p>
              <span className="text-blue-600">git clone</span>{' '}
              https://github.com/postcabinets-jp/scheduling
            </p>
            <p>
              <span className="text-blue-600">cp</span> .env.example .env.local
            </p>
            <p className="text-gray-400"># Supabaseの接続情報を.env.localに追記</p>
            <p>
              <span className="text-blue-600">npm install && npm run dev</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={VERCEL_DEPLOY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 h-10 px-6 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Vercel にデプロイ
            </a>
            <a
              href="https://github.com/postcabinets-jp/scheduling"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 h-10 px-5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub でソースを見る
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">scheduling</span>
            <span className="text-xs text-gray-400">— MIT License</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <a
              href="https://github.com/postcabinets-jp/scheduling"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              GitHub
            </a>
            <span>Built by POST CABINETS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
