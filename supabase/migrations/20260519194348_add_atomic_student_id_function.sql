/*
  # Atomic Student ID Generation Function

  ## Summary
  Adds a PostgreSQL function that atomically increments the per-department
  counter and returns the next student ID code in the format WA-{PREFIX}-{YEAR}-{NNNN}.

  ## New Functions
  - `generate_student_id(department text)` - SECURITY DEFINER, atomically increments
    the counter for the given department prefix and returns the formatted student ID string.

  ## Department → Prefix Mapping
  - 'Informatique'           → INFO
  - 'Technique Informatique' → TECH
  - 'Auto École'             → AUTO

  ## Notes
  - Uses FOR UPDATE locking on the counters row to prevent race conditions during
    concurrent registrations.
  - The year is hardcoded to 2026 as per the school's current academic year logic.
  - Raises an exception for unknown departments so callers receive a clear error.
  - SECURITY DEFINER runs with the function owner's privileges so it can bypass RLS
    on the counters table without exposing it to arbitrary writes.
*/

CREATE OR REPLACE FUNCTION generate_student_id(p_department text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefix  text;
  v_count   integer;
  v_year    integer := 2026;
BEGIN
  -- Resolve department to prefix
  v_prefix := CASE p_department
    WHEN 'Informatique'           THEN 'INFO'
    WHEN 'Technique Informatique' THEN 'TECH'
    WHEN 'Auto École'             THEN 'AUTO'
    ELSE NULL
  END;

  IF v_prefix IS NULL THEN
    RAISE EXCEPTION 'Invalid department: %', p_department;
  END IF;

  -- Ensure row exists, then lock and increment atomically
  INSERT INTO counters (id, count) VALUES (v_prefix, 0)
  ON CONFLICT (id) DO NOTHING;

  UPDATE counters
  SET count      = count + 1,
      updated_at = now()
  WHERE id = v_prefix
  RETURNING count INTO v_count;

  RETURN 'WA-' || v_prefix || '-' || v_year || '-' || LPAD(v_count::text, 4, '0');
END;
$$;
