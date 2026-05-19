/*
  # Core Tables Migration - Wanky Academy

  ## Summary
  Migrates all Firebase/Firestore collections to PostgreSQL tables.

  ## New Tables
  - `profiles` - Unified user profiles for all roles (student, professor, admin, super_admin)
  - `student_codes` - Student ID code mappings and lookup
  - `counters` - Atomic sequence counters for ID generation

  ## Security
  - RLS enabled on all tables
  - Authenticated users can only access their own data
  - Admin roles get broader access via policies
*/

-- ==================== PROFILES ====================
CREATE TABLE IF NOT EXISTS profiles (
  uid uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin', 'super_admin')),
  department text NOT NULL DEFAULT 'Informatique',
  active boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'disabled')),
  phone_number text DEFAULT '',
  phone text DEFAULT '',
  whatsapp text DEFAULT '',
  address text DEFAULT '',
  bio text DEFAULT '',
  emergency_contact text DEFAULT '',
  date_of_birth text DEFAULT '',
  photo_url text DEFAULT '',
  profile_image_url text DEFAULT '',
  student_id text DEFAULT '',
  student_code text DEFAULT '',
  must_change_password boolean NOT NULL DEFAULT false,
  temporary_password boolean NOT NULL DEFAULT false,
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = uid)
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert any profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Professors can view department students"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'student' AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role = 'professor' AND p.department = profiles.department
    )
  );

-- ==================== STUDENT CODES ====================
CREATE TABLE IF NOT EXISTS student_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  email text NOT NULL DEFAULT '',
  linked_uid uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  department text NOT NULL DEFAULT 'Informatique',
  prefix text NOT NULL DEFAULT 'INFO',
  year integer NOT NULL DEFAULT 2026,
  used boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE student_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage student codes"
  ON student_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Students can view own code"
  ON student_codes FOR SELECT
  TO authenticated
  USING (linked_uid = auth.uid());

CREATE POLICY "Admins can insert student codes"
  ON student_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert student codes"
  ON student_codes FOR INSERT
  TO authenticated
  WITH CHECK (linked_uid = auth.uid());

-- ==================== COUNTERS ====================
CREATE TABLE IF NOT EXISTS counters (
  id text PRIMARY KEY,
  count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read counters"
  ON counters FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update counters"
  ON counters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert counters"
  ON counters FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Initialize counters
INSERT INTO counters (id, count) VALUES ('INFO', 0), ('TECH', 0), ('AUTO', 0), ('receipts', 0)
ON CONFLICT (id) DO NOTHING;
