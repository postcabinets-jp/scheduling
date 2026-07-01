-- =========================================
-- Seed Data — Realistic Demo Data
-- =========================================
-- NOTE: This seed data uses placeholder UUIDs.
-- In production, create actual users through Supabase Auth first,
-- then run a modified seed referencing real user IDs.
-- =========================================

-- Demo user profiles (linked to real auth.users in production)
-- These are placeholders for local development preview
DO $$
DECLARE
  user1_id UUID := '11111111-1111-1111-1111-111111111111';
  user2_id UUID := '22222222-2222-2222-2222-222222222222';
  sched1_id UUID := '33333333-3333-3333-3333-333333333333';
  sched2_id UUID := '44444444-4444-4444-4444-444444444444';
  event1_id UUID := '55555555-5555-5555-5555-555555555555';
  event2_id UUID := '66666666-6666-6666-6666-666666666666';
  event3_id UUID := '77777777-7777-7777-7777-777777777777';
  event4_id UUID := '88888888-8888-8888-8888-888888888888';
BEGIN

-- NOTE: In production, create auth users first via Supabase Auth API
-- The following inserts assume those users exist in auth.users

-- =========================================
-- Profiles
-- =========================================
INSERT INTO profiles (id, username, display_name, bio, timezone, locale, brand_color)
VALUES
  (
    user1_id,
    'tanaka-kenji',
    '田中 健二',
    'SaaS企業のプロダクトマネージャー。Calendlyの代替として自社チームで運用中。',
    'Asia/Tokyo',
    'ja',
    '#0F766E'
  ),
  (
    user2_id,
    'sarah-chen',
    'Sarah Chen',
    'Freelance UX designer & consultant. Available for 30-minute discovery calls and 1-hour design reviews.',
    'America/Los_Angeles',
    'en',
    '#7C3AED'
  )
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- Availability Schedules
-- =========================================
INSERT INTO availability_schedules (id, user_id, name, timezone, is_default)
VALUES
  (sched1_id, user1_id, '通常営業時間', 'Asia/Tokyo', true),
  (sched2_id, user2_id, 'Standard Hours', 'America/Los_Angeles', true)
ON CONFLICT (id) DO NOTHING;

-- 田中: 月〜金 09:00-18:00
INSERT INTO availability_slots (schedule_id, day_of_week, start_time, end_time)
VALUES
  (sched1_id, 1, '09:00', '18:00'),  -- Monday
  (sched1_id, 2, '09:00', '18:00'),  -- Tuesday
  (sched1_id, 3, '09:00', '18:00'),  -- Wednesday
  (sched1_id, 4, '09:00', '18:00'),  -- Thursday
  (sched1_id, 5, '09:00', '18:00')   -- Friday
ON CONFLICT DO NOTHING;

-- Sarah: 月〜金 10:00-17:00 (LA time)
INSERT INTO availability_slots (schedule_id, day_of_week, start_time, end_time)
VALUES
  (sched2_id, 1, '10:00', '17:00'),
  (sched2_id, 2, '10:00', '17:00'),
  (sched2_id, 3, '10:00', '17:00'),
  (sched2_id, 4, '10:00', '17:00'),
  (sched2_id, 5, '10:00', '14:00')   -- Friday: half day
ON CONFLICT DO NOTHING;

-- =========================================
-- Event Types
-- =========================================
INSERT INTO event_types (id, user_id, schedule_id, slug, title, description, duration_minutes, buffer_before_min, buffer_after_min, min_notice_hours, future_booking_days, location_type, color, is_active, is_public)
VALUES
  (
    event1_id,
    user1_id,
    sched1_id,
    'discovery-call',
    '初回ヒアリング',
    'プロダクトについてのご相談・デモンストレーション。15分で課題をお聞きし、ご提案の方向性をお伝えします。',
    15,
    5,
    5,
    2,
    30,
    'google_meet',
    '#0F766E',
    true,
    true
  ),
  (
    event2_id,
    user1_id,
    sched1_id,
    'product-review',
    'プロダクトレビューセッション',
    '既存ユーザー向け。機能のフィードバックや改善要望のヒアリング。',
    60,
    10,
    10,
    24,
    60,
    'google_meet',
    '#1D4ED8',
    true,
    true
  ),
  (
    event3_id,
    user2_id,
    sched2_id,
    'design-consult',
    '30-Min Design Consultation',
    'Quick UX review or design direction discussion. Come with your current design challenges.',
    30,
    5,
    5,
    4,
    45,
    'zoom',
    '#7C3AED',
    true,
    true
  ),
  (
    event4_id,
    user2_id,
    sched2_id,
    'design-audit',
    'Full Design Audit (60 min)',
    'Comprehensive UX/UI audit of your product or website. Includes recorded session and written report.',
    60,
    15,
    15,
    48,
    30,
    'zoom',
    '#DB2777',
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- Event Type Questions
-- =========================================
INSERT INTO event_type_questions (event_type_id, label, type, is_required, sort_order)
VALUES
  -- 初回ヒアリング
  (event1_id, '会社名・サービス名', 'text', true, 0),
  (event1_id, '現在の課題・ご相談内容', 'textarea', true, 1),
  (event1_id, '従業員数', 'select', false, 2),
  -- Product Review
  (event2_id, 'フィードバックの対象機能', 'text', true, 0),
  (event2_id, '詳細・改善提案', 'textarea', false, 1),
  -- Design Consultation
  (event3_id, 'What type of project is this?', 'select', true, 0),
  (event3_id, 'Describe your main design challenge', 'textarea', true, 1),
  (event3_id, 'Phone number (optional, for follow-up)', 'phone', false, 2),
  -- Design Audit
  (event4_id, 'Product/website URL', 'text', true, 0),
  (event4_id, 'What are your top 3 UX concerns?', 'textarea', true, 1)
ON CONFLICT DO NOTHING;

-- Update options for select questions
UPDATE event_type_questions
SET options = '["1〜10名", "11〜50名", "51〜200名", "200名以上"]'
WHERE event_type_id = event1_id AND label = '従業員数';

UPDATE event_type_questions
SET options = '["Mobile App", "Web App", "Landing Page", "E-commerce", "Other"]'
WHERE event_type_id = event3_id AND label = 'What type of project is this?';

-- =========================================
-- Sample Bookings (future dates)
-- =========================================
INSERT INTO bookings (event_type_id, host_user_id, invitee_name, invitee_email, invitee_timezone, start_at, end_at, status, meeting_url)
VALUES
  (
    event1_id,
    user1_id,
    '山田 太郎',
    'yamada.taro@example-startup.co.jp',
    'Asia/Tokyo',
    NOW() + INTERVAL '2 days' + INTERVAL '10 hours',
    NOW() + INTERVAL '2 days' + INTERVAL '10 hours 15 minutes',
    'confirmed',
    'https://meet.google.com/abc-defg-hij'
  ),
  (
    event1_id,
    user1_id,
    '鈴木 美咲',
    'suzuki.misaki@tech-ventures.jp',
    'Asia/Tokyo',
    NOW() + INTERVAL '3 days' + INTERVAL '14 hours',
    NOW() + INTERVAL '3 days' + INTERVAL '14 hours 15 minutes',
    'confirmed',
    'https://meet.google.com/xyz-uvwx-yzab'
  ),
  (
    event2_id,
    user1_id,
    '高橋 誠一',
    'takahashi@enterprise-solutions.co.jp',
    'Asia/Tokyo',
    NOW() + INTERVAL '5 days' + INTERVAL '11 hours',
    NOW() + INTERVAL '5 days' + INTERVAL '12 hours',
    'confirmed',
    'https://meet.google.com/mno-pqrs-tuv'
  ),
  (
    event3_id,
    user2_id,
    'Marcus Johnson',
    'marcus@designstudio.io',
    'America/New_York',
    NOW() + INTERVAL '1 day' + INTERVAL '17 hours',
    NOW() + INTERVAL '1 day' + INTERVAL '17 hours 30 minutes',
    'confirmed',
    'https://zoom.us/j/12345678901'
  ),
  (
    event3_id,
    user2_id,
    'Priya Patel',
    'priya.patel@techfounders.com',
    'America/Chicago',
    NOW() + INTERVAL '4 days' + INTERVAL '19 hours',
    NOW() + INTERVAL '4 days' + INTERVAL '19 hours 30 minutes',
    'confirmed',
    'https://zoom.us/j/98765432100'
  ),
  -- Past bookings
  (
    event1_id,
    user1_id,
    '伊藤 花子',
    'ito.hanako@startup-hub.jp',
    'Asia/Tokyo',
    NOW() - INTERVAL '7 days' + INTERVAL '10 hours',
    NOW() - INTERVAL '7 days' + INTERVAL '10 hours 15 minutes',
    'confirmed',
    'https://meet.google.com/past-meeting-1'
  ),
  (
    event3_id,
    user2_id,
    'David Kim',
    'david.kim@productlab.co',
    'America/Los_Angeles',
    NOW() - INTERVAL '3 days' + INTERVAL '16 hours',
    NOW() - INTERVAL '3 days' + INTERVAL '16 hours 30 minutes',
    'cancelled',
    null
  )
ON CONFLICT DO NOTHING;

END $$;
