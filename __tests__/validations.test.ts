import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod'
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  createProfileSchema,
  updateProfileSchema,
  createEventTypeSchema,
  updateEventTypeSchema,
  toggleEventTypeSchema,
  deleteEventTypeSchema,
  updateAvailabilitySchema,
  cancelBookingSchema,
  createBookingSchema,
  cancelBookingByTokenSchema,
  formatValidationError,
} from '@/lib/validations'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

function expectFail(result: { success: boolean; error?: ZodError }) {
  expect(result.success).toBe(false)
  return result.error!
}

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------

describe('loginSchema', () => {
  const valid = { email: 'user@example.com', password: 'abcd1234' }

  it('accepts valid input', () => {
    expect(loginSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing email', () => {
    expectFail(loginSchema.safeParse({ password: 'abcd1234' }))
  })

  it('rejects missing password', () => {
    expectFail(loginSchema.safeParse({ email: 'user@example.com' }))
  })

  it('rejects invalid email', () => {
    expectFail(loginSchema.safeParse({ ...valid, email: 'not-an-email' }))
  })

  it('rejects password shorter than 8', () => {
    expectFail(loginSchema.safeParse({ ...valid, password: '1234567' }))
  })

  it('accepts password of exactly 8 characters', () => {
    expect(loginSchema.safeParse({ ...valid, password: '12345678' }).success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------

describe('registerSchema', () => {
  const valid = { email: 'new@example.com', password: 'secure99' }

  it('accepts valid input', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects missing email', () => {
    expectFail(registerSchema.safeParse({ password: 'secure99' }))
  })

  it('rejects missing password', () => {
    expectFail(registerSchema.safeParse({ email: 'new@example.com' }))
  })

  it('rejects short password', () => {
    expectFail(registerSchema.safeParse({ ...valid, password: 'short' }))
  })
})

// ---------------------------------------------------------------------------
// resetPasswordSchema
// ---------------------------------------------------------------------------

describe('resetPasswordSchema', () => {
  it('accepts valid email', () => {
    expect(resetPasswordSchema.safeParse({ email: 'a@b.co' }).success).toBe(true)
  })

  it('rejects missing email', () => {
    expectFail(resetPasswordSchema.safeParse({}))
  })

  it('rejects invalid email', () => {
    expectFail(resetPasswordSchema.safeParse({ email: 'nope' }))
  })
})

// ---------------------------------------------------------------------------
// createProfileSchema
// ---------------------------------------------------------------------------

describe('createProfileSchema', () => {
  const valid = { username: 'nobu_123', display_name: 'Nobu' }

  it('accepts valid input', () => {
    expect(createProfileSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects username shorter than 3', () => {
    expectFail(createProfileSchema.safeParse({ ...valid, username: 'ab' }))
  })

  it('accepts username of exactly 3 characters', () => {
    expect(createProfileSchema.safeParse({ ...valid, username: 'abc' }).success).toBe(true)
  })

  it('rejects username longer than 30', () => {
    expectFail(createProfileSchema.safeParse({ ...valid, username: 'a'.repeat(31) }))
  })

  it('accepts username of exactly 30 characters', () => {
    expect(createProfileSchema.safeParse({ ...valid, username: 'a'.repeat(30) }).success).toBe(true)
  })

  it('rejects username with special characters', () => {
    expectFail(createProfileSchema.safeParse({ ...valid, username: 'no bu!' }))
  })

  it('accepts username with hyphens and underscores', () => {
    expect(createProfileSchema.safeParse({ ...valid, username: 'my-user_name' }).success).toBe(true)
  })

  it('rejects empty display_name', () => {
    expectFail(createProfileSchema.safeParse({ ...valid, display_name: '' }))
  })

  it('rejects display_name over 100 chars', () => {
    expectFail(createProfileSchema.safeParse({ ...valid, display_name: 'x'.repeat(101) }))
  })
})

// ---------------------------------------------------------------------------
// updateProfileSchema
// ---------------------------------------------------------------------------

describe('updateProfileSchema', () => {
  const valid = {
    username: 'nobu',
    display_name: 'Nobu',
    bio: 'Hello world',
    timezone: 'Asia/Tokyo',
    brand_color: '#FF5500',
  }

  it('accepts valid input', () => {
    expect(updateProfileSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts null bio', () => {
    expect(updateProfileSchema.safeParse({ ...valid, bio: null }).success).toBe(true)
  })

  it('rejects bio over 500 chars', () => {
    expectFail(updateProfileSchema.safeParse({ ...valid, bio: 'x'.repeat(501) }))
  })

  it('rejects empty timezone', () => {
    expectFail(updateProfileSchema.safeParse({ ...valid, timezone: '' }))
  })

  it('rejects invalid hex color (no hash)', () => {
    expectFail(updateProfileSchema.safeParse({ ...valid, brand_color: 'FF5500' }))
  })

  it('rejects invalid hex color (short)', () => {
    expectFail(updateProfileSchema.safeParse({ ...valid, brand_color: '#FFF' }))
  })

  it('rejects invalid hex color (non-hex chars)', () => {
    expectFail(updateProfileSchema.safeParse({ ...valid, brand_color: '#GGGGGG' }))
  })

  it('accepts lowercase hex color', () => {
    expect(updateProfileSchema.safeParse({ ...valid, brand_color: '#aabbcc' }).success).toBe(true)
  })

  it('accepts mixed-case hex color', () => {
    expect(updateProfileSchema.safeParse({ ...valid, brand_color: '#AaBb01' }).success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// createEventTypeSchema
// ---------------------------------------------------------------------------

describe('createEventTypeSchema', () => {
  const valid = {
    slug: 'my-meeting',
    title: '30-min meeting',
    description: null,
    duration_minutes: 30,
    buffer_before_min: 5,
    buffer_after_min: 5,
    min_notice_hours: 24,
    future_booking_days: 60,
    location_type: 'zoom' as const,
    location_value: 'https://zoom.us/j/123',
    color: '#0066FF',
  }

  it('accepts valid input', () => {
    expect(createEventTypeSchema.safeParse(valid).success).toBe(true)
  })

  // slug
  it('rejects empty slug', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, slug: '' }))
  })

  it('rejects slug with uppercase', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, slug: 'My-Meeting' }))
  })

  it('rejects slug with underscores', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, slug: 'my_meeting' }))
  })

  it('rejects slug over 100 chars', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, slug: 'a'.repeat(101) }))
  })

  // title
  it('rejects empty title', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, title: '' }))
  })

  it('rejects title over 200 chars', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, title: 't'.repeat(201) }))
  })

  // description
  it('accepts null description', () => {
    expect(createEventTypeSchema.safeParse({ ...valid, description: null }).success).toBe(true)
  })

  it('rejects description over 2000 chars', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, description: 'd'.repeat(2001) }))
  })

  // duration_minutes
  it('rejects duration_minutes = 0', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, duration_minutes: 0 }))
  })

  it('accepts duration_minutes = 1', () => {
    expect(createEventTypeSchema.safeParse({ ...valid, duration_minutes: 1 }).success).toBe(true)
  })

  it('accepts duration_minutes = 720', () => {
    expect(createEventTypeSchema.safeParse({ ...valid, duration_minutes: 720 }).success).toBe(true)
  })

  it('rejects duration_minutes > 720', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, duration_minutes: 721 }))
  })

  it('rejects non-integer duration_minutes', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, duration_minutes: 30.5 }))
  })

  // buffer_before_min / buffer_after_min
  it('rejects negative buffer_before_min', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, buffer_before_min: -1 }))
  })

  it('rejects buffer_before_min > 180', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, buffer_before_min: 181 }))
  })

  it('accepts buffer_before_min = 0', () => {
    expect(createEventTypeSchema.safeParse({ ...valid, buffer_before_min: 0 }).success).toBe(true)
  })

  it('accepts buffer_after_min = 180', () => {
    expect(createEventTypeSchema.safeParse({ ...valid, buffer_after_min: 180 }).success).toBe(true)
  })

  // min_notice_hours
  it('rejects negative min_notice_hours', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, min_notice_hours: -1 }))
  })

  it('rejects min_notice_hours > 720', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, min_notice_hours: 721 }))
  })

  // future_booking_days
  it('rejects future_booking_days = 0', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, future_booking_days: 0 }))
  })

  it('rejects future_booking_days > 365', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, future_booking_days: 366 }))
  })

  // location_type enum
  it.each(['zoom', 'google_meet', 'teams', 'phone', 'in_person', 'custom'] as const)(
    'accepts location_type = %s',
    (lt) => {
      expect(createEventTypeSchema.safeParse({ ...valid, location_type: lt }).success).toBe(true)
    },
  )

  it('rejects unknown location_type', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, location_type: 'skype' }))
  })

  // color (hex)
  it('rejects invalid color', () => {
    expectFail(createEventTypeSchema.safeParse({ ...valid, color: 'red' }))
  })
})

// ---------------------------------------------------------------------------
// updateEventTypeSchema
// ---------------------------------------------------------------------------

describe('updateEventTypeSchema', () => {
  const valid = {
    id: VALID_UUID,
    title: 'Updated title',
    description: 'Some desc',
    duration_minutes: 60,
    buffer_before_min: 0,
    buffer_after_min: 0,
    min_notice_hours: 1,
    future_booking_days: 30,
    location_type: 'google_meet' as const,
    location_value: null,
    color: '#00AA00',
    is_active: true,
  }

  it('accepts valid input', () => {
    expect(updateEventTypeSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid UUID for id', () => {
    expectFail(updateEventTypeSchema.safeParse({ ...valid, id: 'not-a-uuid' }))
  })

  it('rejects missing is_active', () => {
    const { is_active, ...rest } = valid
    expectFail(updateEventTypeSchema.safeParse(rest))
  })
})

// ---------------------------------------------------------------------------
// toggleEventTypeSchema
// ---------------------------------------------------------------------------

describe('toggleEventTypeSchema', () => {
  it('accepts valid input', () => {
    expect(toggleEventTypeSchema.safeParse({ id: VALID_UUID, is_active: false }).success).toBe(true)
  })

  it('rejects invalid UUID', () => {
    expectFail(toggleEventTypeSchema.safeParse({ id: '123', is_active: true }))
  })

  it('rejects missing is_active', () => {
    expectFail(toggleEventTypeSchema.safeParse({ id: VALID_UUID }))
  })
})

// ---------------------------------------------------------------------------
// deleteEventTypeSchema
// ---------------------------------------------------------------------------

describe('deleteEventTypeSchema', () => {
  it('accepts valid UUID', () => {
    expect(deleteEventTypeSchema.safeParse({ id: VALID_UUID }).success).toBe(true)
  })

  it('rejects missing id', () => {
    expectFail(deleteEventTypeSchema.safeParse({}))
  })

  it('rejects non-UUID id', () => {
    expectFail(deleteEventTypeSchema.safeParse({ id: 'abc' }))
  })
})

// ---------------------------------------------------------------------------
// updateAvailabilitySchema
// ---------------------------------------------------------------------------

describe('updateAvailabilitySchema', () => {
  const validSlot = { day_of_week: 1, start_time: '09:00', end_time: '17:00' }
  const valid = {
    schedule_id: VALID_UUID,
    user_id: VALID_UUID,
    slots: [validSlot],
  }

  it('accepts valid input', () => {
    expect(updateAvailabilitySchema.safeParse(valid).success).toBe(true)
  })

  it('accepts null schedule_id', () => {
    expect(updateAvailabilitySchema.safeParse({ ...valid, schedule_id: null }).success).toBe(true)
  })

  it('rejects invalid schedule_id (non-UUID string)', () => {
    expectFail(updateAvailabilitySchema.safeParse({ ...valid, schedule_id: 'bad' }))
  })

  it('rejects invalid user_id', () => {
    expectFail(updateAvailabilitySchema.safeParse({ ...valid, user_id: 'bad' }))
  })

  it('accepts empty slots array', () => {
    expect(updateAvailabilitySchema.safeParse({ ...valid, slots: [] }).success).toBe(true)
  })

  it('rejects more than 50 slots', () => {
    const slots = Array.from({ length: 51 }, () => validSlot)
    expectFail(updateAvailabilitySchema.safeParse({ ...valid, slots }))
  })

  // day_of_week
  it('rejects day_of_week = -1', () => {
    expectFail(
      updateAvailabilitySchema.safeParse({
        ...valid,
        slots: [{ ...validSlot, day_of_week: -1 }],
      }),
    )
  })

  it('rejects day_of_week = 7', () => {
    expectFail(
      updateAvailabilitySchema.safeParse({
        ...valid,
        slots: [{ ...validSlot, day_of_week: 7 }],
      }),
    )
  })

  it('accepts day_of_week = 0', () => {
    expect(
      updateAvailabilitySchema.safeParse({
        ...valid,
        slots: [{ ...validSlot, day_of_week: 0 }],
      }).success,
    ).toBe(true)
  })

  it('accepts day_of_week = 6', () => {
    expect(
      updateAvailabilitySchema.safeParse({
        ...valid,
        slots: [{ ...validSlot, day_of_week: 6 }],
      }).success,
    ).toBe(true)
  })

  // time format HH:MM
  it('rejects invalid start_time format', () => {
    expectFail(
      updateAvailabilitySchema.safeParse({
        ...valid,
        slots: [{ ...validSlot, start_time: '9:00' }],
      }),
    )
  })

  it('rejects invalid end_time format', () => {
    expectFail(
      updateAvailabilitySchema.safeParse({
        ...valid,
        slots: [{ ...validSlot, end_time: '5pm' }],
      }),
    )
  })

  // refinement: start_time < end_time
  it('rejects slot where start_time >= end_time', () => {
    expectFail(
      updateAvailabilitySchema.safeParse({
        ...valid,
        slots: [{ ...validSlot, start_time: '17:00', end_time: '09:00' }],
      }),
    )
  })

  it('rejects slot where start_time == end_time', () => {
    expectFail(
      updateAvailabilitySchema.safeParse({
        ...valid,
        slots: [{ ...validSlot, start_time: '10:00', end_time: '10:00' }],
      }),
    )
  })
})

// ---------------------------------------------------------------------------
// cancelBookingSchema
// ---------------------------------------------------------------------------

describe('cancelBookingSchema', () => {
  it('accepts valid input with reason', () => {
    expect(
      cancelBookingSchema.safeParse({ booking_id: VALID_UUID, reason: 'conflict' }).success,
    ).toBe(true)
  })

  it('accepts valid input without reason', () => {
    expect(cancelBookingSchema.safeParse({ booking_id: VALID_UUID }).success).toBe(true)
  })

  it('rejects invalid booking_id', () => {
    expectFail(cancelBookingSchema.safeParse({ booking_id: 'nope' }))
  })

  it('rejects reason over 500 chars', () => {
    expectFail(
      cancelBookingSchema.safeParse({ booking_id: VALID_UUID, reason: 'r'.repeat(501) }),
    )
  })
})

// ---------------------------------------------------------------------------
// createBookingSchema
// ---------------------------------------------------------------------------

describe('createBookingSchema', () => {
  const valid = {
    event_type_id: VALID_UUID,
    host_user_id: VALID_UUID,
    invitee_name: 'Tanaka Taro',
    invitee_email: 'tanaka@example.com',
    invitee_timezone: 'Asia/Tokyo',
    start_at: '2026-07-10T10:00:00+09:00',
    end_at: '2026-07-10T10:30:00+09:00',
  }

  it('accepts valid input without answers', () => {
    expect(createBookingSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts valid input with answers', () => {
    const withAnswers = {
      ...valid,
      answers: [{ question_id: VALID_UUID, value: 'Yes' }],
    }
    expect(createBookingSchema.safeParse(withAnswers).success).toBe(true)
  })

  it('rejects invalid event_type_id', () => {
    expectFail(createBookingSchema.safeParse({ ...valid, event_type_id: 'bad' }))
  })

  it('rejects invalid host_user_id', () => {
    expectFail(createBookingSchema.safeParse({ ...valid, host_user_id: 'bad' }))
  })

  it('rejects empty invitee_name', () => {
    expectFail(createBookingSchema.safeParse({ ...valid, invitee_name: '' }))
  })

  it('rejects invitee_name over 200 chars', () => {
    expectFail(createBookingSchema.safeParse({ ...valid, invitee_name: 'n'.repeat(201) }))
  })

  it('rejects invalid invitee_email', () => {
    expectFail(createBookingSchema.safeParse({ ...valid, invitee_email: 'nope' }))
  })

  it('rejects empty invitee_timezone', () => {
    expectFail(createBookingSchema.safeParse({ ...valid, invitee_timezone: '' }))
  })

  it('rejects non-ISO datetime for start_at', () => {
    expectFail(createBookingSchema.safeParse({ ...valid, start_at: '2026-07-10 10:00' }))
  })

  it('rejects non-ISO datetime for end_at', () => {
    expectFail(createBookingSchema.safeParse({ ...valid, end_at: 'tomorrow' }))
  })

  it('accepts UTC Z format', () => {
    expect(
      createBookingSchema.safeParse({
        ...valid,
        start_at: '2026-07-10T01:00:00Z',
        end_at: '2026-07-10T01:30:00Z',
      }).success,
    ).toBe(true)
  })

  // answers validation
  it('rejects answer with empty value', () => {
    expectFail(
      createBookingSchema.safeParse({
        ...valid,
        answers: [{ question_id: VALID_UUID, value: '' }],
      }),
    )
  })

  it('rejects answer with value over 2000 chars', () => {
    expectFail(
      createBookingSchema.safeParse({
        ...valid,
        answers: [{ question_id: VALID_UUID, value: 'v'.repeat(2001) }],
      }),
    )
  })

  it('rejects answer with invalid question_id', () => {
    expectFail(
      createBookingSchema.safeParse({
        ...valid,
        answers: [{ question_id: 'bad', value: 'ok' }],
      }),
    )
  })
})

// ---------------------------------------------------------------------------
// cancelBookingByTokenSchema
// ---------------------------------------------------------------------------

describe('cancelBookingByTokenSchema', () => {
  it('accepts valid input with reason', () => {
    expect(
      cancelBookingByTokenSchema.safeParse({ cancel_token: 'abc123', reason: 'reschedule' })
        .success,
    ).toBe(true)
  })

  it('accepts valid input without reason', () => {
    expect(
      cancelBookingByTokenSchema.safeParse({ cancel_token: 'abc123' }).success,
    ).toBe(true)
  })

  it('rejects empty cancel_token', () => {
    expectFail(cancelBookingByTokenSchema.safeParse({ cancel_token: '' }))
  })

  it('rejects missing cancel_token', () => {
    expectFail(cancelBookingByTokenSchema.safeParse({}))
  })

  it('rejects reason over 500 chars', () => {
    expectFail(
      cancelBookingByTokenSchema.safeParse({
        cancel_token: 'tok',
        reason: 'r'.repeat(501),
      }),
    )
  })
})

// ---------------------------------------------------------------------------
// formatValidationError
// ---------------------------------------------------------------------------

describe('formatValidationError', () => {
  it('joins multiple issue messages with commas', () => {
    const result = loginSchema.safeParse({ email: 'bad', password: '1' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const formatted = formatValidationError(result.error)
      expect(typeof formatted).toBe('string')
      expect(formatted).toContain(', ')
    }
  })

  it('returns single message for single error', () => {
    const result = resetPasswordSchema.safeParse({ email: 'bad' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const formatted = formatValidationError(result.error)
      expect(typeof formatted).toBe('string')
      expect(formatted).not.toContain(', ')
    }
  })

  it('produces a non-empty string', () => {
    const result = deleteEventTypeSchema.safeParse({ id: 'not-uuid' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const formatted = formatValidationError(result.error)
      expect(formatted.length).toBeGreaterThan(0)
    }
  })
})
