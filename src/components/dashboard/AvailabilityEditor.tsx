'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateAvailability } from '@/app/actions/availability'
import { toast } from 'sonner'
import type { AvailabilitySlot } from '@/types/database'
import { Plus, Trash2 } from 'lucide-react'

const DAYS = ['日', '月', '火', '水', '木', '金', '土']

type SlotState = {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
}

export function AvailabilityEditor({
  scheduleId,
  userId,
  initialSlots,
  timezone,
}: {
  scheduleId: string | null
  userId: string
  initialSlots: AvailabilitySlot[]
  timezone: string
}) {
  const [slots, setSlots] = useState<SlotState[]>(initialSlots)
  const [loading, setLoading] = useState(false)

  const slotsByDay = DAYS.map((_, day) =>
    slots.filter((s) => s.day_of_week === day)
  )

  function addSlot(day: number) {
    setSlots([
      ...slots,
      { day_of_week: day, start_time: '09:00', end_time: '17:00' },
    ])
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index))
  }

  function updateSlot(index: number, field: 'start_time' | 'end_time', value: string) {
    const updated = [...slots]
    updated[index] = { ...updated[index], [field]: value }
    setSlots(updated)
  }

  async function handleSave() {
    setLoading(true)

    // Validate: end > start
    for (const slot of slots) {
      if (slot.start_time >= slot.end_time) {
        toast.error(`${DAYS[slot.day_of_week]}曜日: 終了時間は開始時間より後に設定してください`)
        setLoading(false)
        return
      }
    }

    const result = await updateAvailability(scheduleId, userId, slots)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('空き枠を更新しました')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      {DAYS.map((dayLabel, day) => {
        const daySlots = slotsByDay[day]
        const globalStartIndex = slots.indexOf(daySlots[0])

        return (
          <div key={day} className="flex items-start gap-6 px-6 py-4">
            <div className="w-8 text-center flex-shrink-0 mt-2">
              <span className="text-sm font-medium text-gray-700">{dayLabel}</span>
            </div>

            <div className="flex-1 space-y-2">
              {daySlots.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">休み</p>
              ) : (
                daySlots.map((slot, slotIdx) => {
                  const globalIdx = slots.indexOf(slot)

                  return (
                    <div key={slotIdx} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={slot.start_time}
                        onChange={(e) => updateSlot(globalIdx, 'start_time', e.target.value)}
                        className="h-8 w-32 text-sm"
                      />
                      <span className="text-gray-400 text-sm">〜</span>
                      <Input
                        type="time"
                        value={slot.end_time}
                        onChange={(e) => updateSlot(globalIdx, 'end_time', e.target.value)}
                        className="h-8 w-32 text-sm"
                      />
                      <button
                        onClick={() => removeSlot(globalIdx)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            <button
              onClick={() => addSlot(day)}
              className="mt-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="時間帯を追加"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )
      })}

      <div className="px-6 py-4 flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="sm">
          {loading ? '保存中...' : '変更を保存'}
        </Button>
      </div>
    </div>
  )
}
