'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createBooking } from '@/app/actions/bookings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  addDays,
  startOfDay,
  format,
  isBefore,
  addMinutes,
  addHours,
  getDay,
  setHours,
  setMinutes,
  parseISO,
  isSameDay,
  isAfter,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AvailabilitySlot, EventTypeQuestion } from '@/types/database'

type TimeSlot = {
  start: Date
  end: Date
  available: boolean
}

function generateTimeSlots(
  date: Date,
  slots: AvailabilitySlot[],
  durationMinutes: number,
  bufferBefore: number,
  bufferAfter: number,
  minNoticeHours: number,
  existingBookings: Array<{ start_at: string; end_at: string }>
): TimeSlot[] {
  const dayOfWeek = getDay(date)
  const daySlots = slots.filter((s) => s.day_of_week === dayOfWeek)
  if (daySlots.length === 0) return []

  const now = new Date()
  const minAllowedStart = addHours(now, minNoticeHours)
  const result: TimeSlot[] = []

  for (const slot of daySlots) {
    const [startH, startM] = slot.start_time.split(':').map(Number)
    const [endH, endM] = slot.end_time.split(':').map(Number)

    let current = setMinutes(setHours(date, startH), startM)
    const slotEnd = setMinutes(setHours(date, endH), endM)

    while (true) {
      const slotStart = addMinutes(current, bufferBefore)
      const slotEndTime = addMinutes(slotStart, durationMinutes)
      const blockEnd = addMinutes(slotEndTime, bufferAfter)

      if (isAfter(blockEnd, slotEnd)) break

      // Check minimum notice
      const available =
        isAfter(slotStart, minAllowedStart) &&
        !existingBookings.some((b) => {
          const bStart = parseISO(b.start_at)
          const bEnd = parseISO(b.end_at)
          return slotStart < bEnd && slotEndTime > bStart
        })

      result.push({ start: slotStart, end: slotEndTime, available })
      current = addMinutes(current, 30) // 30min intervals
    }
  }

  return result
}

export function BookingCalendar({
  eventTypeId,
  hostUserId,
  hostUsername,
  durationMinutes,
  bufferBefore,
  bufferAfter,
  minNoticeHours,
  futureBookingDays,
  slots,
  existingBookings,
  questions,
  hostTimezone,
  eventSlug,
}: {
  eventTypeId: string
  hostUserId: string
  hostUsername: string
  durationMinutes: number
  bufferBefore: number
  bufferAfter: number
  minNoticeHours: number
  futureBookingDays: number
  slots: AvailabilitySlot[]
  existingBookings: Array<{ start_at: string; end_at: string }>
  questions: EventTypeQuestion[]
  hostTimezone: string
  eventSlug: string
}) {
  const router = useRouter()
  const today = startOfDay(new Date())
  const maxDate = addDays(today, futureBookingDays)

  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [step, setStep] = useState<'calendar' | 'form'>('calendar')
  const [loading, setLoading] = useState(false)

  // Generate week days
  const weekStart = addDays(today, weekOffset * 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Available time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return []
    return generateTimeSlots(
      selectedDate,
      slots,
      durationMinutes,
      bufferBefore,
      bufferAfter,
      minNoticeHours,
      existingBookings
    )
  }, [selectedDate, slots, durationMinutes, bufferBefore, bufferAfter, minNoticeHours, existingBookings])

  // Check if a date has available slots
  function hasAvailableSlots(date: Date): boolean {
    if (isBefore(date, today) || isAfter(date, maxDate)) return false
    const testSlots = generateTimeSlots(date, slots, durationMinutes, bufferBefore, bufferAfter, minNoticeHours, existingBookings)
    return testSlots.some((s) => s.available)
  }

  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedSlot) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const answers = questions.map((q) => ({
      question_id: q.id,
      value: (formData.get(`question_${q.id}`) as string) ?? '',
    }))

    const result = await createBooking({
      event_type_id: eventTypeId,
      host_user_id: hostUserId,
      invitee_name: formData.get('name') as string,
      invitee_email: formData.get('email') as string,
      invitee_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      start_at: selectedSlot.start.toISOString(),
      end_at: selectedSlot.end.toISOString(),
      answers: answers.filter((a) => a.value),
    })

    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.booking) {
      router.push(`/${hostUsername}/${eventSlug}/confirmed?bookingId=${result.booking.id}`)
    }
  }

  if (step === 'form' && selectedSlot) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="mb-6">
          <button
            onClick={() => { setStep('calendar'); setSelectedSlot(null) }}
            className="text-xs text-gray-400 hover:text-gray-600 mb-3 block"
          >
            ← 日時を変更
          </button>
          <p className="text-sm font-semibold text-gray-900">
            {format(selectedSlot.start, 'M月d日(E) HH:mm', { locale: ja })} 〜{' '}
            {format(selectedSlot.end, 'HH:mm')}
          </p>
        </div>

        <form onSubmit={handleBooking} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">お名前</Label>
            <Input id="name" name="name" required placeholder="田中 太郎" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" required placeholder="taro@example.com" />
          </div>

          {questions.map((q) => (
            <div key={q.id} className="space-y-1.5">
              <Label htmlFor={`question_${q.id}`}>
                {q.label}
                {q.is_required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {q.type === 'textarea' ? (
                <Textarea
                  id={`question_${q.id}`}
                  name={`question_${q.id}`}
                  required={q.is_required}
                  rows={3}
                />
              ) : q.type === 'select' && q.options ? (
                <select
                  id={`question_${q.id}`}
                  name={`question_${q.id}`}
                  required={q.is_required}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">選択してください</option>
                  {(q.options as string[]).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`question_${q.id}`}
                  name={`question_${q.id}`}
                  type={q.type === 'phone' ? 'tel' : 'text'}
                  required={q.is_required}
                />
              )}
            </div>
          ))}

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? '予約中...' : '予約を確定する'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="text-sm font-medium text-gray-700">
          {format(weekDays[0], 'M月d日', { locale: ja })} 〜{' '}
          {format(weekDays[6], 'M月d日', { locale: ja })}
        </span>

        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 pb-1">{d}</div>
        ))}
        {weekDays.map((day) => {
          const hasSlots = hasAvailableSlots(day)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isPast = isBefore(day, today)

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                if (hasSlots) {
                  setSelectedDate(day)
                  setSelectedSlot(null)
                }
              }}
              disabled={isPast || !hasSlots}
              className={`
                w-full aspect-square rounded-lg text-sm font-medium transition-colors
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${!isSelected && hasSlots ? 'hover:bg-blue-50 text-gray-800 cursor-pointer' : ''}
                ${isPast || !hasSlots ? 'text-gray-300 cursor-not-allowed' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="text-xs text-gray-500 mb-3">
            {format(selectedDate, 'M月d日(E)', { locale: ja })} の空き時間
          </p>
          {timeSlots.filter((s) => s.available).length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {timeSlots
                .filter((s) => s.available)
                .map((slot) => (
                  <button
                    key={slot.start.toISOString()}
                    onClick={() => {
                      setSelectedSlot(slot)
                      setStep('form')
                    }}
                    className="py-2 px-3 border border-blue-200 text-blue-700 text-sm rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors font-medium"
                  >
                    {format(slot.start, 'HH:mm')}
                  </button>
                ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              この日に空き枠はありません
            </p>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">日付を選択してください</p>
        </div>
      )}
    </div>
  )
}
