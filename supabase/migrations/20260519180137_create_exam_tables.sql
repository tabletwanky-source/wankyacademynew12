/*
  # Exam System Tables

  ## New Tables
  - `exams` - Exam definitions with department, duration, passing score
  - `questions` - Exam questions (MCQ, boolean, short answer, checkbox)
  - `exam_results` - Student submissions and grades
  - `exam_attempts` - In-progress exam state (draft answers)
  - `assigned_exams` - Exam assignments to students/departments

  ## Security
  - RLS enabled, students see only their own results
  - Professors and admins can manage exams for their department
*/

-- ==================== EXAMS ====================
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  department text NOT NULL,
  created_by uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  creator_role text NOT NULL DEFAULT 'admin' CHECK (creator_role IN ('admin', 'professor')),
  duration integer NOT NULL DEFAULT 60,
  passing_score numeric NOT NULL DEFAULT 60,
  total_questions integer NOT NULL DEFAULT 0,
  attempts_allowed integer DEFAULT 2,
  instructions text DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  published boolean NOT NULL DEFAULT false,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published exams"
  ON exams FOR SELECT
  TO authenticated
  USING (published = true AND active = true);

CREATE POLICY "Professors can view department exams"
  ON exams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role = 'professor' AND p.department = exams.department
    )
  );

CREATE POLICY "Admins can view all exams"
  ON exams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Professors can insert exams for their department"
  ON exams FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert any exam"
  ON exams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Exam creator can update"
  ON exams FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ))
  WITH CHECK (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Exam creator can delete"
  ON exams FOR DELETE
  TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

-- ==================== QUESTIONS ====================
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  text text NOT NULL,
  type text NOT NULL DEFAULT 'mcq' CHECK (type IN ('mcq', 'boolean', 'short', 'identification', 'checkbox')),
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer text NOT NULL DEFAULT '',
  points numeric NOT NULL DEFAULT 1,
  image_url text DEFAULT '',
  video_url text DEFAULT '',
  explanation text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professors and admins can view questions"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Students can view questions for active exams"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exams e WHERE e.id = questions.exam_id AND e.published = true AND e.active = true
    ) AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role = 'student'
    )
  );

CREATE POLICY "Exam owners can manage questions"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exams e WHERE e.id = questions.exam_id AND (e.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "Exam owners can update questions"
  ON questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exams e WHERE e.id = questions.exam_id AND (e.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
      ))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exams e WHERE e.id = questions.exam_id AND (e.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
      ))
    )
  );

CREATE POLICY "Exam owners can delete questions"
  ON questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exams e WHERE e.id = questions.exam_id AND (e.created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
      ))
    )
  );

-- ==================== EXAM RESULTS ====================
CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  student_code text NOT NULL DEFAULT '',
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  total_points numeric NOT NULL DEFAULT 0,
  percentage numeric NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  answers jsonb NOT NULL DEFAULT '{}',
  attempt integer NOT NULL DEFAULT 1,
  teacher_comments text DEFAULT ''
);

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own results"
  ON exam_results FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert own results"
  ON exam_results FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Professors and admins can view all results"
  ON exam_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Professors and admins can update results"
  ON exam_results FOR UPDATE
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

-- ==================== EXAM ATTEMPTS (progress saving) ====================
CREATE TABLE IF NOT EXISTS exam_attempts (
  id text PRIMARY KEY, -- format: studentUid_examId
  student_id uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  current_question_index integer NOT NULL DEFAULT 0,
  last_updated timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own attempts"
  ON exam_attempts FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert attempts"
  ON exam_attempts FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own attempts"
  ON exam_attempts FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can delete own attempts"
  ON exam_attempts FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

-- ==================== ASSIGNED EXAMS ====================
CREATE TABLE IF NOT EXISTS assigned_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  assigned_to text NOT NULL DEFAULT 'all',
  department text NOT NULL,
  assigned_by uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  due_date timestamptz,
  attempts_allowed integer DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assigned_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view active assignments for their dept"
  ON assigned_exams FOR SELECT
  TO authenticated
  USING (
    active = true AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND (
        assigned_to = 'all' OR assigned_to = p.uid::text OR department = p.department
      )
    )
  );

CREATE POLICY "Professors and admins can manage assignments"
  ON assigned_exams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Professors and admins can insert assignments"
  ON assigned_exams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Professors and admins can update assignments"
  ON assigned_exams FOR UPDATE
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

CREATE POLICY "Professors and admins can delete assignments"
  ON assigned_exams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );
