/**
 * ART COURSE PLATFORM — SETUP ADMIN & DEMO USERS
 * 
 * Usage:
 *   node scripts/setup-admin.mjs
 * 
 * Prerequisites:
 *   Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local
 *   or passed via environment variables.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local if present
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\x1b[31mError: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.\x1b[0m');
  console.error('Please configure them in your .env.local file or pass them as environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('\x1b[36m--- Setting up Studio Platform Accounts ---\x1b[0m\n');

  // 1. Create or update Admin User
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@demo.com';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'StudioAdmin2026!';
  const adminName = 'Studio Administrator';

  console.log(`Setting up Admin account: ${adminEmail}...`);

  const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      full_name: adminName,
      role: 'admin',
    },
  });

  let adminId = adminAuth?.user?.id;

  if (adminErr) {
    if (adminErr.message.includes('already registered')) {
      console.log(`User ${adminEmail} already exists. Updating role to admin...`);
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existing = usersData.users.find((u) => u.email === adminEmail);
      if (existing) {
        adminId = existing.id;
        await supabase.auth.admin.updateUserById(adminId, {
          password: adminPassword,
          user_metadata: { full_name: adminName, role: 'admin' },
        });
      }
    } else {
      console.error('Error creating admin:', adminErr.message);
    }
  }

  if (adminId) {
    await supabase.from('profiles').upsert({
      id: adminId,
      full_name: adminName,
      email: adminEmail,
      role: 'admin',
    });
    console.log(`\x1b[32m✔ Admin account ready:\x1b[0m`);
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}\n`);
  }

  // 2. Create or update Demo Student User
  const studentEmail = 'student@demo.com';
  const studentPassword = 'StudioStudent2026!';
  const studentName = 'Alex Mercer';

  console.log(`Setting up Demo Student: ${studentEmail}...`);

  const { data: studentAuth, error: studentErr } = await supabase.auth.admin.createUser({
    email: studentEmail,
    password: studentPassword,
    email_confirm: true,
    user_metadata: {
      full_name: studentName,
      role: 'student',
    },
  });

  let studentId = studentAuth?.user?.id;

  if (studentErr) {
    if (studentErr.message.includes('already registered')) {
      console.log(`Student ${studentEmail} already exists. Updating password...`);
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existing = usersData.users.find((u) => u.email === studentEmail);
      if (existing) {
        studentId = existing.id;
        await supabase.auth.admin.updateUserById(studentId, {
          password: studentPassword,
          user_metadata: { full_name: studentName, role: 'student' },
        });
      }
    } else {
      console.error('Error creating student:', studentErr.message);
    }
  }

  if (studentId) {
    await supabase.from('profiles').upsert({
      id: studentId,
      full_name: studentName,
      email: studentEmail,
      role: 'student',
    });

    // Assign 2 initial classes: Painting and Botanical Art
    const { data: classes } = await supabase
      .from('classes')
      .select('id, slug')
      .in('slug', ['painting', 'botanical-art']);

    if (classes && classes.length > 0) {
      for (const cls of classes) {
        await supabase.from('student_classes').upsert(
          {
            student_id: studentId,
            class_id: cls.id,
            status: 'active',
          },
          { onConflict: 'student_id,class_id' }
        );
      }
      console.log(`  Assigned Painting & Botanical Art to ${studentEmail}.`);
    }

    console.log(`\x1b[32m✔ Demo Student account ready:\x1b[0m`);
    console.log(`  Email:    ${studentEmail}`);
    console.log(`  Password: ${studentPassword}\n`);
  }

  console.log('\x1b[32mSetup complete! You can now sign in at /login.\x1b[0m');
}

main().catch(console.error);
