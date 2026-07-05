import { z } from 'zod'

// --- Shared primitives ---

const uuid = z.string().uuid('有効なUUIDを入力してください')
const email = z.string().email('有効なメールアドレスを入力してください')
const timeHHMM = z.string().regex(/^\d{2}:\d{2}$/, '時刻は HH:MM 形式で入力してください')
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, '色は #RRGGBB 形式で入力してください')

const locationType = z.enum(
  ['zoom', 'google_meet', 'teams', 'phone', 'in_person', 'custom'],
  { message: 'サポートされていない場所タイプです' },
)

// --- Auth ---

export const loginSchema = z.object({
  email,
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

export const registerSchema = z.object({
  email,
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
})

export const resetPasswordSchema = z.object({
  email,
})

export const createProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(30, 'ユーザー名は30文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ユーザー名は英数字・ハイフン・アンダースコアのみ使用できます'),
  display_name: z.string().min(1, '表示名を入力してください').max(100, '表示名は100文字以内で入力してください'),
})

// --- Profile ---

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(30, 'ユーザー名は30文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_-]+$/, 'ユーザー名は英数字・ハイフン・アンダースコアのみ使用できます'),
  display_name: z.string().min(1, '表示名を入力してください').max(100, '表示名は100文字以内で入力してください'),
  bio: z.string().max(500, '自己紹介は500文字以内で入力してください').nullable(),
  timezone: z.string().min(1, 'タイムゾーンを選択してください'),
  brand_color: hexColor,
})

// --- Event Types ---

const eventTypeBase = {
  title: z.string().min(1, 'タイトルを入力してください').max(200, 'タイトルは200文字以内で入力してください'),
  description: z.string().max(2000, '説明は2000文字以内で入力してください').nullable(),
  duration_minutes: z.number().int('整数で入力してください').min(1, '所要時間は1分以上で入力してください').max(720, '所要時間は720分以内で入力してください'),
  buffer_before_min: z.number().int('整数で入力してください').min(0, '0以上の値を入力してください').max(180, '180分以内で入力してください'),
  buffer_after_min: z.number().int('整数で入力してください').min(0, '0以上の値を入力してください').max(180, '180分以内で入力してください'),
  min_notice_hours: z.number().int('整数で入力してください').min(0, '0以上の値を入力してください').max(720, '720時間以内で入力してください'),
  future_booking_days: z.number().int('整数で入力してください').min(1, '1日以上で入力してください').max(365, '365日以内で入力してください'),
  location_type: locationType,
  location_value: z.string().max(500).nullable(),
  color: hexColor,
}

export const createEventTypeSchema = z.object({
  slug: z
    .string()
    .min(1, 'スラッグを入力してください')
    .max(100, 'スラッグは100文字以内で入力してください')
    .regex(/^[a-z0-9-]+$/, 'スラッグは小文字英数字とハイフンのみ使用できます'),
  ...eventTypeBase,
})

export const updateEventTypeSchema = z.object({
  id: uuid,
  ...eventTypeBase,
  is_active: z.boolean(),
})

export const toggleEventTypeSchema = z.object({
  id: uuid,
  is_active: z.boolean(),
})

export const deleteEventTypeSchema = z.object({
  id: uuid,
})

// --- Availability ---

const availabilitySlotSchema = z
  .object({
    day_of_week: z.number().int().min(0, '曜日は0〜6で指定してください').max(6, '曜日は0〜6で指定してください'),
    start_time: timeHHMM,
    end_time: timeHHMM,
  })
  .refine((slot) => slot.start_time < slot.end_time, {
    message: '終了時刻は開始時刻より後に設定してください',
  })

export const updateAvailabilitySchema = z.object({
  schedule_id: uuid.nullable(),
  user_id: uuid,
  slots: z.array(availabilitySlotSchema).max(50, 'スロットは最大50件までです'),
})

// --- Bookings ---

export const cancelBookingSchema = z.object({
  booking_id: uuid,
  reason: z.string().max(500, 'キャンセル理由は500文字以内で入力してください').optional(),
})

const bookingAnswerSchema = z.object({
  question_id: uuid,
  value: z.string().min(1, '回答を入力してください').max(2000, '回答は2000文字以内で入力してください'),
})

export const createBookingSchema = z.object({
  event_type_id: uuid,
  host_user_id: uuid,
  invitee_name: z.string().min(1, 'お名前を入力してください').max(200, 'お名前は200文字以内で入力してください'),
  invitee_email: email,
  invitee_timezone: z.string().min(1, 'タイムゾーンを選択してください'),
  start_at: z.string().datetime({ offset: true, message: '開始日時はISO 8601形式で入力してください' }),
  end_at: z.string().datetime({ offset: true, message: '終了日時はISO 8601形式で入力してください' }),
  answers: z.array(bookingAnswerSchema).optional(),
})

export const cancelBookingByTokenSchema = z.object({
  cancel_token: z.string().min(1, 'キャンセルトークンが必要です'),
  reason: z.string().max(500, 'キャンセル理由は500文字以内で入力してください').optional(),
})

// --- Helper ---

export function formatValidationError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ')
}
