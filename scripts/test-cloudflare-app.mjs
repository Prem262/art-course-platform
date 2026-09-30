import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  }
});

const BASE_URL = 'http://127.0.0.1:8787';
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const projectRef = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];

console.log('Project Ref:', projectRef);

async function runTests() {
  console.log('--- 1. Testing Unauthenticated Endpoints on Cloudflare Workers ---');
  
  // GET / (unauthenticated redirects to /login)
  let res = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
  console.log(`GET / (unauth) : status ${res.status} redirect -> ${res.headers.get('location')}`);
  if (![302, 307].includes(res.status) || !res.headers.get('location')?.includes('/login')) {
    throw new Error('GET / did not redirect to /login');
  }

  // GET /login
  res = await fetch(`${BASE_URL}/login`, { redirect: 'manual' });
  console.log(`GET /login : status ${res.status}`);
  if (res.status !== 200) throw new Error(`GET /login failed with status ${res.status}`);

  // GET /dashboard without auth
  res = await fetch(`${BASE_URL}/dashboard`, { redirect: 'manual' });
  console.log(`GET /dashboard (unauth) : status ${res.status} redirect -> ${res.headers.get('location')}`);
  if (![302, 307].includes(res.status) || !res.headers.get('location')?.includes('/login')) {
    throw new Error('Middleware failed to redirect unauthenticated /dashboard request');
  }

  // GET /admin without auth
  res = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
  console.log(`GET /admin (unauth) : status ${res.status} redirect -> ${res.headers.get('location')}`);
  if (![302, 307].includes(res.status) || !res.headers.get('location')?.includes('/login')) {
    throw new Error('Middleware failed to redirect unauthenticated /admin request');
  }

  // POST /api/progress without auth
  res = await fetch(`${BASE_URL}/api/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId: 'dummy', watchedSeconds: 10 }),
  });
  console.log(`POST /api/progress (unauth) : status ${res.status}`);
  if (res.status !== 401) throw new Error('Unauthenticated progress call did not return 401');

  // GET /api/video/auth without auth
  res = await fetch(`${BASE_URL}/api/video/auth?lessonId=dummy`);
  console.log(`GET /api/video/auth (unauth) : status ${res.status}`);
  if (res.status !== 401) throw new Error('Unauthenticated video auth call did not return 401');

  console.log('\n--- 2. Authenticating Student via Supabase Auth ---');
  const { data: studentSession, error: studentLoginErr } = await supabase.auth.signInWithPassword({
    email: 'student@demo.com',
    password: 'StudioStudent2026!',
  });
  if (studentLoginErr) throw studentLoginErr;
  console.log('Student authenticated successfully! User ID:', studentSession.user.id);

  function createCookieHeader(session) {
    const rawSession = JSON.stringify(session);
    if (rawSession.length > 3000) {
      const half = Math.ceil(rawSession.length / 2);
      const part1 = rawSession.slice(0, half);
      const part2 = rawSession.slice(half);
      return `sb-${projectRef}-auth-token.0=${encodeURIComponent(part1)}; sb-${projectRef}-auth-token.1=${encodeURIComponent(part2)}`;
    }
    return `sb-${projectRef}-auth-token=${encodeURIComponent(rawSession)}`;
  }

  const studentCookie = createCookieHeader(studentSession.session);

  console.log('\n--- 3. Testing Student Routes with Session Cookie ---');
  // GET /dashboard
  res = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: studentCookie },
    redirect: 'manual',
  });
  console.log(`GET /dashboard (student): status ${res.status}`);
  const dashboardHtml = await res.text();
  console.log(`Dashboard page returned ${dashboardHtml.length} bytes`);
  if (res.status !== 200) throw new Error(`Student dashboard returned ${res.status}`);

  // GET /profile
  res = await fetch(`${BASE_URL}/profile`, {
    headers: { Cookie: studentCookie },
    redirect: 'manual',
  });
  console.log(`GET /profile (student): status ${res.status}`);
  if (res.status !== 200) throw new Error(`Student profile returned ${res.status}`);

  // Fetch an enrolled class and lesson from Supabase
  const { data: studentClasses } = await supabase
    .from('student_classes')
    .select('class_id, classes(id, slug, title)')
    .eq('student_id', studentSession.user.id);

  console.log('Student classes found:', studentClasses?.length || 0);
  let classSlug, lessonId, classLessons = [];
  if (studentClasses && studentClasses.length > 0) {
    classSlug = studentClasses[0].classes.slug;
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title, video_id')
      .eq('class_id', studentClasses[0].class_id);
    if (lessons && lessons.length > 0) {
      classLessons = lessons;
      lessonId = lessons[0].id;
      console.log(`Testing with class slug: "${classSlug}", lesson ID: "${lessonId}" ("${lessons[0].title}")`);
    }
  }

  if (classSlug) {
    // GET /classes/[classSlug]
    res = await fetch(`${BASE_URL}/classes/${classSlug}`, {
      headers: { Cookie: studentCookie },
      redirect: 'manual',
    });
    console.log(`GET /classes/${classSlug} (student): status ${res.status}`);
    if (res.status !== 200) throw new Error(`Class page returned ${res.status}`);

    if (lessonId) {
      // GET /classes/[classSlug]/lessons/[lessonId]
      res = await fetch(`${BASE_URL}/classes/${classSlug}/lessons/${lessonId}`, {
        headers: { Cookie: studentCookie },
        redirect: 'manual',
      });
      console.log(`GET /classes/${classSlug}/lessons/${lessonId} (student): status ${res.status}`);
      if (res.status !== 200) throw new Error(`Lesson page returned ${res.status}`);

      // 1. GET /api/video/auth with existing (placeholder) videoId
      res = await fetch(`${BASE_URL}/api/video/auth?lessonId=${lessonId}`, {
        headers: { Cookie: studentCookie },
      });
      console.log(`GET /api/video/auth?lessonId=${lessonId} (student): status ${res.status}`);
      const videoData = await res.json();
      console.log('Video auth response (dev mode):', JSON.stringify(videoData, null, 2));
      if (!videoData.success) throw new Error('Video auth failed');

      // 2. Test live Bunny token generation with non-placeholder videoId
      console.log('Testing live Bunny token generation with active video ID in Cloudflare Worker...');
      const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
      const originalVideoId = classLessons.find(l => l.id === lessonId)?.video_id;
      const testVideoId = '11223344-5566-7788-99aa-bbccddeeff00';
      await adminClient.from('lessons').update({ video_id: testVideoId }).eq('id', lessonId);

      try {
        const liveVideoRes = await fetch(`${BASE_URL}/api/video/auth?lessonId=${lessonId}`, {
          headers: { Cookie: studentCookie },
        });
        const liveVideoData = await liveVideoRes.json();
        console.log('Live Bunny signing response from Cloudflare Worker:', JSON.stringify(liveVideoData, null, 2));
        if (!liveVideoData.success) throw new Error('Live Bunny auth failed');
        if (!liveVideoData.isConfigured) throw new Error('Expected isConfigured to be true');
        if (liveVideoData.isDevelopmentPlaceholder) throw new Error('Expected isDevelopmentPlaceholder to be false');
        if (!liveVideoData.token || liveVideoData.token.length !== 64) {
          throw new Error('Expected 64-char SHA256 hex token from Bunny signing');
        }
        if (!liveVideoData.embedUrl?.includes(liveVideoData.token)) {
          throw new Error('embedUrl does not contain generated token');
        }
        if (!liveVideoData.playbackUrl?.includes('playlist.m3u8?token=')) {
          throw new Error('playbackUrl does not contain generated HLS token');
        }
        console.log('\x1b[32m✔ Bunny SHA256 signing inside Cloudflare Workers verified successfully!\x1b[0m');
      } finally {
        // Restore original video_id
        await adminClient.from('lessons').update({ video_id: originalVideoId }).eq('id', lessonId);
      }

      // POST /api/progress
      res = await fetch(`${BASE_URL}/api/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: studentCookie,
        },
        body: JSON.stringify({
          lessonId,
          watchedSeconds: 45,
          durationSeconds: 120,
          markComplete: false,
        }),
      });
      console.log(`POST /api/progress (student): status ${res.status}`);
      const progressData = await res.json();
      console.log('Progress response:', JSON.stringify(progressData, null, 2));
      if (!progressData.success) throw new Error('Progress update failed');
    }
  }

  // Student attempting /admin -> unauthorized redirect
  res = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: studentCookie },
    redirect: 'manual',
  });
  console.log(`GET /admin (student): status ${res.status} redirect -> ${res.headers.get('location')}`);
  if (![302, 307].includes(res.status) || !res.headers.get('location')?.includes('/unauthorized')) {
    throw new Error('Student accessing /admin was not redirected to /unauthorized');
  }

  console.log('\n--- 4. Authenticating Admin via Supabase Auth ---');
  const { data: adminSession, error: adminLoginErr } = await supabase.auth.signInWithPassword({
    email: 'admin@demo.com',
    password: 'StudioAdmin2026!',
  });
  if (adminLoginErr) throw adminLoginErr;
  console.log('Admin authenticated successfully! User ID:', adminSession.user.id);
  const adminCookie = createCookieHeader(adminSession.session);

  console.log('\n--- 5. Testing Admin Routes with Session Cookie ---');
  // GET /admin
  res = await fetch(`${BASE_URL}/admin`, {
    headers: { Cookie: adminCookie },
    redirect: 'manual',
  });
  console.log(`GET /admin (admin): status ${res.status}`);
  if (res.status !== 200) throw new Error(`Admin dashboard returned ${res.status}`);

  // GET /admin/classes
  res = await fetch(`${BASE_URL}/admin/classes`, {
    headers: { Cookie: adminCookie },
    redirect: 'manual',
  });
  console.log(`GET /admin/classes (admin): status ${res.status}`);
  if (res.status !== 200) throw new Error(`Admin classes returned ${res.status}`);

  // GET /admin/lessons
  res = await fetch(`${BASE_URL}/admin/lessons`, {
    headers: { Cookie: adminCookie },
    redirect: 'manual',
  });
  console.log(`GET /admin/lessons (admin): status ${res.status}`);
  if (res.status !== 200) throw new Error(`Admin lessons returned ${res.status}`);

  // GET /admin/students
  res = await fetch(`${BASE_URL}/admin/students`, {
    headers: { Cookie: adminCookie },
    redirect: 'manual',
  });
  console.log(`GET /admin/students (admin): status ${res.status}`);
  if (res.status !== 200) throw new Error(`Admin students returned ${res.status}`);

  // GET /admin/progress
  res = await fetch(`${BASE_URL}/admin/progress`, {
    headers: { Cookie: adminCookie },
    redirect: 'manual',
  });
  console.log(`GET /admin/progress (admin): status ${res.status}`);
  if (res.status !== 200) throw new Error(`Admin progress returned ${res.status}`);

  console.log('\n=============================================');
  console.log('ALL CLOUDFLARE WORKER CHECKS PASSED PERFECTLY!');
  console.log('=============================================');
}

runTests().catch(err => {
  console.error('\x1b[31mTEST FAILED:\x1b[0m', err);
  process.exit(1);
});
