/*
  # Learning System Tables

  ## New Tables
  - `videos` - Video lessons per department
  - `video_comments` - Comments on videos
  - `video_progress` - Student progress tracking per video
  - `homework` - Homework assignments
  - `homework_submissions` - Student homework submissions
  - `attendance` - Attendance records
  - `curriculums` - Course curriculum definitions (with nested modules as JSONB)

  ## Security
  - RLS enabled on all tables
*/

-- ==================== VIDEOS ====================
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  department text NOT NULL,
  video_type text NOT NULL DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'vimeo', 'storage', 'url')),
  video_url text NOT NULL DEFAULT '',
  thumbnail text DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  creator_name text DEFAULT '',
  duration text DEFAULT '',
  views integer NOT NULL DEFAULT 0,
  materials jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view published videos for their dept"
  ON videos FOR SELECT
  TO authenticated
  USING (
    published = true AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.department = videos.department
    )
  );

CREATE POLICY "Professors can view dept videos"
  ON videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role = 'professor' AND p.department = videos.department
    )
  );

CREATE POLICY "Admins can view all videos"
  ON videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Professors and admins can insert videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Video creators can update"
  ON videos FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ))
  WITH CHECK (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Video creators can delete"
  ON videos FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

-- ==================== VIDEO COMMENTS ====================
CREATE TABLE IF NOT EXISTS video_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  user_role text NOT NULL DEFAULT 'student',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view video comments"
  ON video_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON video_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON video_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin', 'professor')
  ));

-- ==================== VIDEO PROGRESS ====================
CREATE TABLE IF NOT EXISTS video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_uid uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  progress numeric NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  last_updated timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_uid, video_id)
);

ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own progress"
  ON video_progress FOR SELECT
  TO authenticated
  USING (student_uid = auth.uid());

CREATE POLICY "Students can insert progress"
  ON video_progress FOR INSERT
  TO authenticated
  WITH CHECK (student_uid = auth.uid());

CREATE POLICY "Students can update own progress"
  ON video_progress FOR UPDATE
  TO authenticated
  USING (student_uid = auth.uid())
  WITH CHECK (student_uid = auth.uid());

CREATE POLICY "Professors and admins can view progress"
  ON video_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

-- ==================== HOMEWORK ====================
CREATE TABLE IF NOT EXISTS homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  department text NOT NULL,
  professor_uid uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  due_date timestamptz,
  file_url text DEFAULT '',
  max_points numeric DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view dept homework"
  ON homework FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.department = homework.department
    )
  );

CREATE POLICY "Professors and admins can view all homework"
  ON homework FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Professors and admins can insert homework"
  ON homework FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Professors and admins can update homework"
  ON homework FOR UPDATE
  TO authenticated
  USING (professor_uid = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ))
  WITH CHECK (professor_uid = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Professors and admins can delete homework"
  ON homework FOR DELETE
  TO authenticated
  USING (professor_uid = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

-- ==================== HOMEWORK SUBMISSIONS ====================
CREATE TABLE IF NOT EXISTS homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id uuid NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_uid uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  student_name text NOT NULL DEFAULT '',
  student_code text NOT NULL DEFAULT '',
  submission_text text DEFAULT '',
  file_url text DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'pending', 'graded', 'late', 'resubmitted')),
  grade numeric,
  max_points numeric DEFAULT 100,
  feedback text DEFAULT '',
  department text DEFAULT '',
  graded_at timestamptz
);

ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own submissions"
  ON homework_submissions FOR SELECT
  TO authenticated
  USING (student_uid = auth.uid());

CREATE POLICY "Students can insert own submissions"
  ON homework_submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_uid = auth.uid());

CREATE POLICY "Professors and admins can view all submissions"
  ON homework_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Professors and admins can update submissions"
  ON homework_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

-- ==================== ATTENDANCE ====================
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_uid uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  student_id text DEFAULT '',
  professor_uid uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  department text NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  date text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (student_uid = auth.uid());

CREATE POLICY "Professors can view dept attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role = 'professor' AND p.department = attendance.department
    )
  );

CREATE POLICY "Admins can view all attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Professors and admins can insert attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

-- ==================== CURRICULUMS ====================
CREATE TABLE IF NOT EXISTS curriculums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  department text NOT NULL,
  thumbnail text DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  published boolean NOT NULL DEFAULT false,
  difficulty text NOT NULL DEFAULT 'Beginner',
  duration text DEFAULT '',
  assigned_professor uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  professor_name text DEFAULT '',
  created_by uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  creator_role text NOT NULL DEFAULT 'admin',
  modules jsonb NOT NULL DEFAULT '[]',
  total_lessons integer NOT NULL DEFAULT 0,
  total_students integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE curriculums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view published curriculums for their dept"
  ON curriculums FOR SELECT
  TO authenticated
  USING (
    published = true AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.department = curriculums.department
    )
  );

CREATE POLICY "Professors can view assigned curriculums"
  ON curriculums FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role = 'professor' AND (
        p.department = curriculums.department OR assigned_professor = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can view all curriculums"
  ON curriculums FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Professors and admins can insert curriculums"
  ON curriculums FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Curriculum creators can update"
  ON curriculums FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ))
  WITH CHECK (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Curriculum creators can delete"
  ON curriculums FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));
