'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarCheck,
  LayoutDashboard,
  Calendar,
  BookOpen,
  Clock,
  Puzzle,
  Users,
  Settings,
  ExternalLink,
} from 'lucide-react'
import type { Profile } from '@/types/database'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'ホーム', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/event-types', label: 'イベントタイプ', icon: Calendar },
  { href: '/dashboard/bookings', label: '予約一覧', icon: BookOpen },
  { href: '/dashboard/availability', label: '空き枠管理', icon: Clock },
  { href: '/dashboard/integrations', label: '連携設定', icon: Puzzle },
  { href: '/dashboard/team', label: 'チーム', icon: Users },
  { href: '/dashboard/settings', label: '設定', icon: Settings },
]

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-gray-200">
        <CalendarCheck className="h-6 w-6 text-blue-600" />
        <span className="text-base font-semibold text-gray-900">scheduling</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Public profile link */}
      <div className="px-3 py-4 border-t border-gray-200">
        <a
          href={`/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          予約ページを確認
        </a>
      </div>
    </aside>
  )
}
