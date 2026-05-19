/*
  # Fix infinite recursion in profiles RLS policies

  ## Problem
  The admin policies on `profiles` were checking role by querying `profiles` itself:
    EXISTS (SELECT 1 FROM profiles p WHERE p.uid = auth.uid() AND p.role IN (...))
  This causes infinite recursion (42P17) because reading profiles triggers the policy
  which tries to read profiles again.

  ## Solution
  Replace the recursive sub-select with a security-definer function that bypasses RLS,
  so role lookups don't re-trigger the same policy.
*/

-- Drop all existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Professors can view department students" ON profiles;

-- Create a security-definer helper function that reads role without triggering RLS
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE uid = auth.uid() LIMIT 1;
$$;

-- Simple self-access policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (uid = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (uid = auth.uid())
  WITH CHECK (uid = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (uid = auth.uid());

-- Admin policies using the non-recursive helper function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'))
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert any profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (get_my_role() IN ('admin', 'super_admin'));

CREATE POLICY "Professors can view department students"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'student' AND get_my_role() = 'professor'
  );
