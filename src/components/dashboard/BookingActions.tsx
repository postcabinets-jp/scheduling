'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cancelBooking } from '@/app/actions/bookings'
import { toast } from 'sonner'
import { X } from 'lucide-react'

export function BookingActions({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    const result = await cancelBooking(bookingId, reason)
    setLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('予約をキャンセルしました')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" />}>
        <X className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>予約をキャンセル</DialogTitle>
          <DialogDescription>
            この予約をキャンセルします。招待者にはメールで通知されます。
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Textarea
            placeholder="キャンセル理由（任意）"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            戻る
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'キャンセル中...' : 'キャンセルする'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
