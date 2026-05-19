/*
  # Blog, Finance, Certificates, Badges, Notifications, System Settings Tables

  ## New Tables
  - `articles` - Blog posts
  - `article_comments` - Comments on articles
  - `article_likes` - Likes on articles (unique per user per article)
  - `payments` - Student payment records
  - `receipts` - Payment receipts
  - `financial_records` - Student financial summary
  - `certificates` - Student certificates
  - `old_certificates` - Legacy/imported certificates
  - `badges` - Student achievement badges
  - `notifications` - User notifications
  - `service_requests` - Multiservices form requests
  - `system_settings` - System configuration key-value store

  ## Security
  - RLS enabled on all tables
*/

-- ==================== ARTICLES ====================
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  thumbnail text DEFAULT '',
  cover_image text DEFAULT '',
  author_id uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  author_name text NOT NULL DEFAULT '',
  author_role text NOT NULL DEFAULT 'admin',
  published boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category text DEFAULT '',
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view published articles"
  ON articles FOR SELECT
  TO authenticated
  USING (published = true AND status = 'published');

CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  TO anon
  USING (published = true AND status = 'published');

CREATE POLICY "Admins and professors can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Admins and professors can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Article authors can update own articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ))
  WITH CHECK (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

CREATE POLICY "Article authors can delete"
  ON articles FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

-- ==================== ARTICLE COMMENTS ====================
CREATE TABLE IF NOT EXISTS article_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  user_name text NOT NULL DEFAULT '',
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on published articles"
  ON article_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can view comments"
  ON article_comments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON article_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can delete own comments"
  ON article_comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
  ));

-- ==================== ARTICLE LIKES ====================
CREATE TABLE IF NOT EXISTS article_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(article_id, user_id)
);

ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view likes"
  ON article_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON article_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own likes"
  ON article_likes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ==================== PAYMENTS ====================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_uid uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  student_id text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  payment_type text NOT NULL,
  month text DEFAULT '',
  installment text DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'paid',
  validated_by uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  receipt_code text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (student_uid = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
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

-- ==================== RECEIPTS ====================
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_code text UNIQUE NOT NULL,
  student_uid uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  student_id text NOT NULL DEFAULT '',
  full_name text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  payment_type text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  remaining_balance numeric DEFAULT 0,
  generated_at timestamptz NOT NULL DEFAULT now(),
  validated_by uuid REFERENCES profiles(uid) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'valid'
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (student_uid = auth.uid());

CREATE POLICY "Admins can view all receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert receipts"
  ON receipts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ==================== FINANCIAL RECORDS ====================
CREATE TABLE IF NOT EXISTS financial_records (
  id text PRIMARY KEY,
  student_uid uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  total_paid numeric NOT NULL DEFAULT 0,
  total_required numeric NOT NULL DEFAULT 0,
  remaining_balance numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own financial record"
  ON financial_records FOR SELECT
  TO authenticated
  USING (student_uid = auth.uid());

CREATE POLICY "Admins can view all financial records"
  ON financial_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert financial records"
  ON financial_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update financial records"
  ON financial_records FOR UPDATE
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

-- ==================== CERTIFICATES ====================
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text UNIQUE NOT NULL,
  student_uid uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  student_name text NOT NULL DEFAULT '',
  student_id text NOT NULL DEFAULT '',
  department text NOT NULL,
  exam_id uuid REFERENCES exams(id) ON DELETE SET NULL,
  exam_title text NOT NULL DEFAULT '',
  score numeric NOT NULL DEFAULT 0,
  issued_by text NOT NULL DEFAULT 'System',
  issue_date timestamptz NOT NULL DEFAULT now(),
  verification_url text NOT NULL DEFAULT '',
  pdf_url text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked'))
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (student_uid = auth.uid());

CREATE POLICY "Admins can view all certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update certificates"
  ON certificates FOR UPDATE
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

CREATE POLICY "Public can verify certificates by code"
  ON certificates FOR SELECT
  TO anon
  USING (status = 'active');

-- ==================== OLD CERTIFICATES ====================
CREATE TABLE IF NOT EXISTS old_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text UNIQUE NOT NULL,
  student_name text NOT NULL DEFAULT '',
  pdf_url text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT true,
  issue_date timestamptz NOT NULL DEFAULT now(),
  department text DEFAULT ''
);

ALTER TABLE old_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage old certificates"
  ON old_certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Public can verify old certificates"
  ON old_certificates FOR SELECT
  TO anon
  USING (verified = true);

CREATE POLICY "Admins can insert old certificates"
  ON old_certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ==================== BADGES ====================
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_code text UNIQUE NOT NULL,
  student_uid uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  student_id text NOT NULL DEFAULT '',
  student_name text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  verification_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own badges"
  ON badges FOR SELECT
  TO authenticated
  USING (student_uid = auth.uid());

CREATE POLICY "Admins can view all badges"
  ON badges FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert badges"
  ON badges FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert own badge"
  ON badges FOR INSERT
  TO authenticated
  WITH CHECK (student_uid = auth.uid());

CREATE POLICY "Admins can update badges"
  ON badges FOR UPDATE
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

CREATE POLICY "Public can verify badges"
  ON badges FOR SELECT
  TO anon
  USING (active = true);

-- ==================== NOTIFICATIONS ====================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(uid) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'system' CHECK (type IN ('exam', 'homework', 'attendance', 'system', 'certificate')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins and professors can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('professor', 'admin', 'super_admin')
    )
  );

-- ==================== SERVICE REQUESTS ====================
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  service text NOT NULL,
  details text NOT NULL DEFAULT '',
  appointment_date text DEFAULT '',
  document_url text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert service requests"
  ON service_requests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert service requests"
  ON service_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all service requests"
  ON service_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update service requests"
  ON service_requests FOR UPDATE
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

CREATE POLICY "Admins can delete service requests"
  ON service_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- ==================== SYSTEM SETTINGS ====================
CREATE TABLE IF NOT EXISTS system_settings (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can read system settings"
  ON system_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can write system settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update system settings"
  ON system_settings FOR UPDATE
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
