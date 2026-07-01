-- =========================================
-- Extensions
-- =========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- Profiles (auth.users の拡張)
-- =========================================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_-]{3,30}$'),
  display_name  TEXT NOT NULL,
  bio           TEXT,
  avatar_url    TEXT,
  timezone      TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  locale        TEXT NOT NULL DEFAULT 'ja',
  brand_color   TEXT NOT NULL DEFAULT '#3B82F6',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: own read/write"
  ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "profiles: public read"
  ON profiles FOR SELECT USING (true);

-- =========================================
-- Calendar Connections (OAuth tokens)
-- =========================================
CREATE TABLE calendar_connections (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider         TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple')),
  account_email    TEXT NOT NULL,
  access_token     TEXT NOT NULL,
  refresh_token    TEXT,
  token_expires_at TIMESTAMPTZ,
  is_primary       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider, account_email)
);

ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_connections: own only"
  ON calendar_connections FOR ALL USING (auth.uid() = user_id);

-- =========================================
-- Availability Schedules (週次テンプレ)
-- =========================================
CREATE TABLE availability_schedules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'デフォルト',
  timezone    TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE availability_slots (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id  UUID NOT NULL REFERENCES availability_schedules(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  CHECK (start_time < end_time)
);

ALTER TABLE availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_schedules: own only"
  ON availability_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "availability_schedules: public read"
  ON availability_schedules FOR SELECT USING (true);
CREATE POLICY "availability_slots: own only via schedule"
  ON availability_slots FOR ALL USING (
    EXISTS (
      SELECT 1 FROM availability_schedules s
      WHERE s.id = schedule_id AND s.user_id = auth.uid()
    )
  );
CREATE POLICY "availability_slots: public read"
  ON availability_slots FOR SELECT USING (true);

-- =========================================
-- Event Types
-- =========================================
CREATE TABLE event_types (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id          UUID REFERENCES availability_schedules(id) ON DELETE SET NULL,
  slug                 TEXT NOT NULL CHECK (slug ~ '^[a-z0-9-]{2,60}$'),
  title                TEXT NOT NULL,
  description          TEXT,
  duration_minutes     INTEGER NOT NULL CHECK (duration_minutes BETWEEN 5 AND 480),
  buffer_before_min    INTEGER NOT NULL DEFAULT 0,
  buffer_after_min     INTEGER NOT NULL DEFAULT 0,
  max_bookings_per_day INTEGER,
  min_notice_hours     INTEGER NOT NULL DEFAULT 0,
  future_booking_days  INTEGER NOT NULL DEFAULT 60,
  location_type        TEXT NOT NULL CHECK (
    location_type IN ('zoom', 'google_meet', 'teams', 'phone', 'in_person', 'custom')
  ),
  location_value       TEXT,
  color                TEXT NOT NULL DEFAULT '#3B82F6',
  is_active            BOOLEAN NOT NULL DEFAULT true,
  is_public            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, slug)
);

CREATE INDEX idx_event_types_user_id ON event_types(user_id);
CREATE INDEX idx_event_types_slug ON event_types(user_id, slug) WHERE is_active = true;

ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_types: owner full access"
  ON event_types FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "event_types: public read active"
  ON event_types FOR SELECT USING (is_public = true AND is_active = true);

-- =========================================
-- Date Overrides (ブロック日・特別営業日)
-- =========================================
CREATE TABLE date_overrides (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  is_blocked  BOOLEAN NOT NULL DEFAULT false,
  slots       JSONB,
  UNIQUE(user_id, date)
);

ALTER TABLE date_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "date_overrides: own only"
  ON date_overrides FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "date_overrides: public read"
  ON date_overrides FOR SELECT USING (true);

-- =========================================
-- Booking Form Questions
-- =========================================
CREATE TABLE event_type_questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id UUID NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('text', 'textarea', 'select', 'checkbox', 'phone')),
  options       JSONB,
  is_required   BOOLEAN NOT NULL DEFAULT false,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE event_type_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_type_questions: owner via event_type"
  ON event_type_questions FOR ALL USING (
    EXISTS (
      SELECT 1 FROM event_types e
      WHERE e.id = event_type_id AND e.user_id = auth.uid()
    )
  );
CREATE POLICY "event_type_questions: public read"
  ON event_type_questions FOR SELECT USING (true);

-- =========================================
-- Bookings
-- =========================================
CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type_id     UUID NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  host_user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  invitee_name      TEXT NOT NULL,
  invitee_email     TEXT NOT NULL,
  invitee_timezone  TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  start_at          TIMESTAMPTZ NOT NULL,
  end_at            TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed', 'cancelled', 'rescheduled', 'no_show')),
  cancel_reason     TEXT,
  meeting_url       TEXT,
  reschedule_token  TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  cancel_token      TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_at < end_at)
);

CREATE INDEX idx_bookings_host_start ON bookings(host_user_id, start_at) WHERE status = 'confirmed';
CREATE INDEX idx_bookings_event_type ON bookings(event_type_id, start_at);
CREATE INDEX idx_bookings_reschedule_token ON bookings(reschedule_token);
CREATE INDEX idx_bookings_cancel_token ON bookings(cancel_token);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings: host full access"
  ON bookings FOR ALL USING (auth.uid() = host_user_id);

-- =========================================
-- Booking Answers
-- =========================================
CREATE TABLE booking_answers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES event_type_questions(id) ON DELETE RESTRICT,
  value       TEXT
);

ALTER TABLE booking_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_answers: host access"
  ON booking_answers FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id AND b.host_user_id = auth.uid()
    )
  );

-- =========================================
-- Teams & Members
-- =========================================
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]{2,50}$'),
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams: members read"
  ON teams FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members m
      WHERE m.team_id = id AND m.user_id = auth.uid()
    )
  );
CREATE POLICY "teams: owner write"
  ON teams FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "team_members: member read"
  ON team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "team_members: admin manage"
  ON team_members FOR ALL USING (
    EXISTS (
      SELECT 1 FROM team_members m
      WHERE m.team_id = team_id
        AND m.user_id = auth.uid()
        AND m.role IN ('owner', 'admin')
    )
  );

-- =========================================
-- Webhooks
-- =========================================
CREATE TABLE webhooks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  events      TEXT[] NOT NULL DEFAULT ARRAY['booking.created', 'booking.cancelled', 'booking.rescheduled'],
  secret      TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhooks: own only"
  ON webhooks FOR ALL USING (auth.uid() = user_id);

-- =========================================
-- Updated at trigger
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- Function: handle new user signup
-- =========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Profiles are created explicitly during onboarding
  -- This function is kept for future auto-creation needs
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;
