'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/app/actions/auth'
import type { Profile } from '@/types/database'
import { ExternalLink, Settings, LogOut, Menu } from 'lucide-react'

export function Header({ profile }: { profile: Profile }) {
  const initials = profile.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Mobile menu placeholder */}
      <button className="lg:hidden text-gray-500 hover:text-gray-700">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm" className="hidden sm:flex gap-2">
          <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            予約ページ
          </a>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" />}>
            <Avatar className="h-8 w-8">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{profile.display_name}</p>
                <p className="text-xs text-gray-400">@{profile.username}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/dashboard/settings" className="cursor-pointer" />}>
              <Settings className="mr-2 h-4 w-4" />
              設定
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
