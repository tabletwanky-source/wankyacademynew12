import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMIN_EMAIL = 'admin@wanky.ac';
const ADMIN_PASS = 'admin123';

async function setup() {
  try {
    console.log('--- Wanky Academy System Bootstrap ---');

    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
      email_confirm: true,
      user_metadata: { full_name: 'System Admin' }
    });

    if (error) {
      if (error.message?.includes('already registered')) {
        console.log('SKIP: Admin already exists.');
      } else {
        throw error;
      }
      process.exit();
    }

    const uid = data.user.id;
    await supabase.from('profiles').insert({
      uid,
      email: ADMIN_EMAIL,
      full_name: 'System Admin',
      role: 'admin',
      department: 'Informatique',
      active: true,
      status: 'active'
    });

    console.log('SUCCESS: Admin account initialized.');
    console.log('Email:', ADMIN_EMAIL);
    console.log('Pass:', ADMIN_PASS);
  } catch (error: any) {
    console.error('ERROR during bootstrap:', error.message);
  }
  process.exit();
}

setup();
