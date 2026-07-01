import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Crown, Shield, User } from 'lucide-react'

type TeamWithMembers = {
  id: string
  name: string
  slug: string
  team_members: Array<{
    user_id: string
    role: string
    profiles: { display_name: string; username: string; avatar_url: string | null }
  }>
}

const roleLabels: Record<string, { label: string; icon: React.ElementType }> = {
  owner: { label: 'オーナー', icon: Crown },
  admin: { label: '管理者', icon: Shield },
  member: { label: 'メンバー', icon: User },
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawTeams } = await supabase
    .from('teams')
    .select('*, team_members(*, profiles(display_name, username, avatar_url))')
    .or(`owner_id.eq.${user!.id}`)
  const teams = rawTeams as TeamWithMembers[] | null

  const { data: memberships } = await supabase
    .from('team_members')
    .select('*, teams(name, slug)')
    .eq('user_id', user!.id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">チーム</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            チームメンバーを管理してラウンドロビン予約を設定できます
          </p>
        </div>
        <Button size="sm" disabled>
          チームを作成（近日実装）
        </Button>
      </div>

      {teams && teams.length > 0 ? (
        <div className="space-y-4">
          {teams.map((team) => {
            const members = team.team_members

            return (
              <div key={team.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">scheduling.app/team/{team.slug}</p>
                </div>

                <div className="divide-y divide-gray-100">
                  {members.map((member) => {
                    const roleInfo = roleLabels[member.role]
                    const RoleIcon = roleInfo.icon

                    return (
                      <div key={member.user_id} className="flex items-center gap-3 px-6 py-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {member.profiles.display_name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {member.profiles.display_name}
                          </p>
                          <p className="text-xs text-gray-400">@{member.profiles.username}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleInfo.label}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <h3 className="text-sm font-medium text-gray-700">チームがありません</h3>
          <p className="text-xs text-gray-400 mt-1">
            チームを作成するとメンバー間でラウンドロビン予約が使えます
          </p>
        </div>
      )}
    </div>
  )
}
