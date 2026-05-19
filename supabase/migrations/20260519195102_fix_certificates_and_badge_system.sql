/*
  # Fix Certificates & Badge System

  ## Summary
  1. Add CERT counter row for atomic certificate code generation
  2. Add `generate_certificate_code()` SECURITY DEFINER function for race-safe cert codes
  3. Add INSERT policy on certificates so authenticated students can insert their own certs
     (needed for auto-generation after exam submission)
  4. Fix certificates table: add UNIQUE constraint on certificate_code to prevent duplicates

  ## Security
  - Students can only insert certificates where student_uid = auth.uid()
  - The generate_certificate_code() function is SECURITY DEFINER so it bypasses RLS
    on the counters table (same pattern as generate_student_id)
  - UNIQUE constraint on certificate_code prevents duplicate cert codes at DB level
*/

-- Initialize CERT counter
INSERT INTO counters (id, count) VALUES ('CERT', 0)
ON CONFLICT (id) DO NOTHING;

-- Atomic certificate code generator
CREATE OR REPLACE FUNCTION generate_certificate_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
  v_year  integer := date_part('year', now())::integer;
BEGIN
  INSERT INTO counters (id, count) VALUES ('CERT', 0)
  ON CONFLICT (id) DO NOTHING;

  UPDATE counters
  SET count      = count + 1,
      updated_at = now()
  WHERE id = 'CERT'
  RETURNING count INTO v_count;

  RETURN 'WA-CERT-' || v_year || '-' || LPAD(v_count::text, 4, '0');
END;
$$;

-- Add UNIQUE constraint on certificate_code (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'certificates'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'certificates_certificate_code_key'
  ) THEN
    ALTER TABLE certificates ADD CONSTRAINT certificates_certificate_code_key UNIQUE (certificate_code);
  END IF;
END $$;

-- Add INSERT policy for students to self-generate certificates after passing exams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'certificates'
      AND policyname = 'Students can insert own certificates'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Students can insert own certificates"
        ON certificates FOR INSERT
        TO authenticated
        WITH CHECK (student_uid = auth.uid());
    $policy$;
  END IF;
END $$;

-- Add UNIQUE constraint on badge_code (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'badges'
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'badges_badge_code_key'
  ) THEN
    ALTER TABLE badges ADD CONSTRAINT badges_badge_code_key UNIQUE (badge_code);
  END IF;
END $$;
