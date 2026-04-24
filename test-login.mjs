import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function run() {
  const { data: users } = await supabase.from('admin_users').select('*');
  console.log("Found users...");
  for (const u of users) {
    const isValid = bcrypt.compareSync('Sarelli123@', u.password_hash);
    console.log(`User: ${u.username} | Pass 'Sarelli123@' is valid? ${isValid}`);
    const adminPass = bcrypt.compareSync('12345678', u.password_hash);
    console.log(`User: ${u.username} | Pass '12345678' is valid? ${adminPass}`);
  }
}

run();
