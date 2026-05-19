/*
  # Fix infinite recursion in RLS across all tables

  ## Problem
  All tables had admin/professor role checks using:
    EXISTS (SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN (...))
  This causes infinite recursion because that sub-query hits the profiles table
  which also has RLS enabled.

  ## Solution
  Replace all EXISTS role checks with the get_my_role() security-definer function.
*/

-- ==================== EXAMS ====================
DROP POLICY IF EXISTS "Professors can view department exams" ON exams;
DROP POLICY IF EXISTS "Admins can view all exams" ON exams;
DROP POLICY IF EXISTS "Professors can insert exams for their department" ON exams;
DROP POLICY IF EXISTS "Admins can insert any exam" ON exams;
DROP POLICY IF EXISTS "Exam creator can update" ON exams;
DROP POLICY IF EXISTS "Exam creator can delete" ON exams;

CREATE POLICY "Professors can view department exams"
  ON exams FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Admins can view all exams"
  ON exams FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Staff can insert exams"
  ON exams FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Exam creator can update"
  ON exams FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (created_by = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Exam creator can delete"
  ON exams FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

-- ==================== QUESTIONS ====================
DROP POLICY IF EXISTS "Professors and admins can view questions" ON questions;
DROP POLICY IF EXISTS "Students can view questions for active exams" ON questions;
DROP POLICY IF EXISTS "Exam owners can manage questions" ON questions;
DROP POLICY IF EXISTS "Exam owners can update questions" ON questions;
DROP POLICY IF EXISTS "Exam owners can delete questions" ON questions;

CREATE POLICY "Staff can view questions"
  ON questions FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Students can view questions for active exams"
  ON questions FOR SELECT TO authenticated
  USING (
    get_my_role() = 'student' AND
    EXISTS (SELECT 1 FROM exams e WHERE e.id = questions.exam_id AND e.published = true AND e.active = true)
  );

CREATE POLICY "Staff can insert questions"
  ON questions FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can update questions"
  ON questions FOR UPDATE TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can delete questions"
  ON questions FOR DELETE TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

-- ==================== EXAM RESULTS ====================
DROP POLICY IF EXISTS "Professors and admins can view all results" ON exam_results;
DROP POLICY IF EXISTS "Professors and admins can update results" ON exam_results;

CREATE POLICY "Staff can view all results"
  ON exam_results FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can update results"
  ON exam_results FOR UPDATE TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

-- ==================== ASSIGNED EXAMS ====================
DROP POLICY IF EXISTS "Professors and admins can manage assignments" ON assigned_exams;
DROP POLICY IF EXISTS "Professors and admins can insert assignments" ON assigned_exams;
DROP POLICY IF EXISTS "Professors and admins can update assignments" ON assigned_exams;
DROP POLICY IF EXISTS "Professors and admins can delete assignments" ON assigned_exams;

CREATE POLICY "Staff can view assignments"
  ON assigned_exams FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can insert assignments"
  ON assigned_exams FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can update assignments"
  ON assigned_exams FOR UPDATE TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can delete assignments"
  ON assigned_exams FOR DELETE TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

-- ==================== VIDEOS ====================
DROP POLICY IF EXISTS "Professors can view dept videos" ON videos;
DROP POLICY IF EXISTS "Admins can view all videos" ON videos;
DROP POLICY IF EXISTS "Professors and admins can insert videos" ON videos;
DROP POLICY IF EXISTS "Video creators can update" ON videos;
DROP POLICY IF EXISTS "Video creators can delete" ON videos;

CREATE POLICY "Staff can view all videos"
  ON videos FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can insert videos"
  ON videos FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Video creators can update"
  ON videos FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (created_by = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Video creators can delete"
  ON videos FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

-- ==================== VIDEO COMMENTS ====================
DROP POLICY IF EXISTS "Users can delete own comments" ON video_comments;

CREATE POLICY "Staff can delete video comments"
  ON video_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin', 'professor'));

-- ==================== VIDEO PROGRESS ====================
DROP POLICY IF EXISTS "Professors and admins can view progress" ON video_progress;

CREATE POLICY "Staff can view progress"
  ON video_progress FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

-- ==================== HOMEWORK ====================
DROP POLICY IF EXISTS "Professors and admins can view all homework" ON homework;
DROP POLICY IF EXISTS "Professors and admins can insert homework" ON homework;
DROP POLICY IF EXISTS "Professors and admins can update homework" ON homework;
DROP POLICY IF EXISTS "Professors and admins can delete homework" ON homework;

CREATE POLICY "Staff can view all homework"
  ON homework FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can insert homework"
  ON homework FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can update homework"
  ON homework FOR UPDATE TO authenticated
  USING (professor_uid = auth.uid() OR get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (professor_uid = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Staff can delete homework"
  ON homework FOR DELETE TO authenticated
  USING (professor_uid = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

-- ==================== HOMEWORK SUBMISSIONS ====================
DROP POLICY IF EXISTS "Professors and admins can view all submissions" ON homework_submissions;
DROP POLICY IF EXISTS "Professors and admins can update submissions" ON homework_submissions;

CREATE POLICY "Staff can view all submissions"
  ON homework_submissions FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can update submissions"
  ON homework_submissions FOR UPDATE TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

-- ==================== ATTENDANCE ====================
DROP POLICY IF EXISTS "Professors can view dept attendance" ON attendance;
DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Professors and admins can insert attendance" ON attendance;

CREATE POLICY "Staff can view all attendance"
  ON attendance FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can insert attendance"
  ON attendance FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

-- ==================== CURRICULUMS ====================
DROP POLICY IF EXISTS "Admins can view all curriculums" ON curriculums;
DROP POLICY IF EXISTS "Professors and admins can insert curriculums" ON curriculums;
DROP POLICY IF EXISTS "Curriculum creators can update" ON curriculums;
DROP POLICY IF EXISTS "Curriculum creators can delete" ON curriculums;

CREATE POLICY "Staff can view all curriculums"
  ON curriculums FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can insert curriculums"
  ON curriculums FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Curriculum creators can update"
  ON curriculums FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (created_by = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Curriculum creators can delete"
  ON curriculums FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

-- ==================== ARTICLES ====================
DROP POLICY IF EXISTS "Admins and professors can view all articles" ON articles;
DROP POLICY IF EXISTS "Admins and professors can insert articles" ON articles;
DROP POLICY IF EXISTS "Article authors can update own articles" ON articles;
DROP POLICY IF EXISTS "Article authors can delete" ON articles;

CREATE POLICY "Staff can view all articles"
  ON articles FOR SELECT TO authenticated
  USING (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Staff can insert articles"
  ON articles FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

CREATE POLICY "Article authors can update own articles"
  ON articles FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (author_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Article authors can delete"
  ON articles FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

-- ==================== ARTICLE COMMENTS ====================
DROP POLICY IF EXISTS "Users can delete own comments" ON article_comments;

CREATE POLICY "Users can delete own article comments"
  ON article_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

-- ==================== PAYMENTS ====================
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Admins can insert payments" ON payments;
DROP POLICY IF EXISTS "Admins can update payments" ON payments;

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert payments"
  ON payments FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

-- ==================== RECEIPTS ====================
DROP POLICY IF EXISTS "Admins can view all receipts" ON receipts;
DROP POLICY IF EXISTS "Admins can insert receipts" ON receipts;

CREATE POLICY "Admins can view all receipts"
  ON receipts FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert receipts"
  ON receipts FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

-- ==================== FINANCIAL RECORDS ====================
DROP POLICY IF EXISTS "Admins can view all financial records" ON financial_records;
DROP POLICY IF EXISTS "Admins can insert financial records" ON financial_records;
DROP POLICY IF EXISTS "Admins can update financial records" ON financial_records;

CREATE POLICY "Admins can view all financial records"
  ON financial_records FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert financial records"
  ON financial_records FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update financial records"
  ON financial_records FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

-- ==================== CERTIFICATES ====================
DROP POLICY IF EXISTS "Admins can view all certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can insert certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can update certificates" ON certificates;

CREATE POLICY "Admins can view all certificates"
  ON certificates FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert certificates"
  ON certificates FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update certificates"
  ON certificates FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

-- ==================== OLD CERTIFICATES ====================
DROP POLICY IF EXISTS "Admins can manage old certificates" ON old_certificates;
DROP POLICY IF EXISTS "Admins can insert old certificates" ON old_certificates;

CREATE POLICY "Admins can view old certificates"
  ON old_certificates FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert old certificates"
  ON old_certificates FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

-- ==================== BADGES ====================
DROP POLICY IF EXISTS "Admins can view all badges" ON badges;
DROP POLICY IF EXISTS "Admins can insert badges" ON badges;
DROP POLICY IF EXISTS "System can insert own badge" ON badges;
DROP POLICY IF EXISTS "Admins can update badges" ON badges;

CREATE POLICY "Admins can view all badges"
  ON badges FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Anyone authenticated can insert own badge"
  ON badges FOR INSERT TO authenticated
  WITH CHECK (student_uid = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update badges"
  ON badges FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

-- ==================== NOTIFICATIONS ====================
DROP POLICY IF EXISTS "Admins and professors can insert notifications" ON notifications;

CREATE POLICY "Staff can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('professor', 'admin', 'super_admin'));

-- ==================== SERVICE REQUESTS ====================
DROP POLICY IF EXISTS "Admins can view all service requests" ON service_requests;
DROP POLICY IF EXISTS "Admins can update service requests" ON service_requests;
DROP POLICY IF EXISTS "Admins can delete service requests" ON service_requests;

CREATE POLICY "Admins can view all service requests"
  ON service_requests FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update service requests"
  ON service_requests FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can delete service requests"
  ON service_requests FOR DELETE TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

-- ==================== SYSTEM SETTINGS ====================
DROP POLICY IF EXISTS "Admins can write system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON system_settings;

CREATE POLICY "Admins can write system settings"
  ON system_settings FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update system settings"
  ON system_settings FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

-- ==================== STUDENT CODES ====================
DROP POLICY IF EXISTS "Admins can manage student codes" ON student_codes;
DROP POLICY IF EXISTS "Admins can insert student codes" ON student_codes;
DROP POLICY IF EXISTS "System can insert student codes" ON student_codes;

CREATE POLICY "Admins can view student codes"
  ON student_codes FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Anyone can insert own student code"
  ON student_codes FOR INSERT TO authenticated
  WITH CHECK (linked_uid = auth.uid() OR get_my_role() IN ('admin', 'super_admin'));
