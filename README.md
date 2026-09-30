# The Art Studio — Production E-Course Platform

A production-grade, secure online learning platform designed specifically for a private art-learning studio. Built on Next.js App Router, Supabase PostgreSQL, and Bunny.net Stream video delivery, with an editorial botanical aesthetic.

---

## 1. Project Overview

This platform delivers structured, sequential art instruction for private studio students. The studio offers four foundational classes:
1. **01 / Painting** — Fluid qualities of water, pigment washes, and expressive floral studies.
2. **02 / Botanical Art** — Accurate botanical illustration, plant morphology, and delicate venation.
3. **03 / Zentangle** — Mindful pattern-making through structured, meditative strokes.
4. **04 / Line Arts** — Archival pen-and-ink drafting, hatching, and intricate botanical line work.

### Core Student Features
- **Student Dashboard**: Quick access to assigned classes and a prioritized "Continue Learning" action that resumes the student's next unfinished lesson.
- **Strict Server-Enforced Class Access**: Students can only access classes explicitly assigned to them by an administrator.
- **Protected Video Playback**: Bunny.net Stream HLS/video delivery with time-limited signed tokens generated server-side.
- **Resume Watching**: Tracks exact playback timestamp across sessions and devices.
- **Automated Lesson & Course Progress**: Debounced progress tracking during playback; reaching 90%+ marks the lesson completed and updates course completion metrics.
- **Sequential Lesson Navigation**: Next and Previous controls respecting curriculum order.

### Core Admin Features
- **Admin Console (`/admin`)**: Role-gated portal strictly accessible to users with `role = 'admin'`.
- **Student Management**: Create student accounts, search by name or email, toggle class assignments, and inspect individual lesson progress.
- **Class Management**: Create, edit, reorder, and publish/unpublish classes.
- **Lesson Management**: Add, edit, reorder lessons, set duration, and attach Bunny.net Video IDs.
- **Progress Overview**: Cross-student completion matrix across all studio classes.

---

## 2. Technology Stack

- **Framework**: Next.js (App Router, Server Components & Server Actions)
- **Language**: TypeScript
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS)
- **Session Management**: Cookie-based authentication via `@supabase/ssr`
- **Video Delivery**: Bunny.net Stream (HLS streaming & token authentication) with development preview fallback
- **Styling**: Tailwind CSS (Warm Ivory palette, editorial typography, subtle botanical accents)
- **Icons**: Lucide React

---

## 3. Local Setup

### Prerequisites
- Node.js v18.17+ or v20+
- A Supabase project (Free or Pro tier)
- (Optional for development) A Bunny.net Stream video library

### Installation

```bash
# Clone or navigate to the project directory
cd d:/e-course

# Install dependencies
npm install
```

---

## 4. Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Populate the required variables:

```env
# ------------------------------------------------------------------------------
# SUPABASE CONFIGURATION
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# SERVER-SIDE ONLY: Service role key for admin operations (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ------------------------------------------------------------------------------
# BUNNY.NET STREAM CONFIGURATION
# ------------------------------------------------------------------------------
BUNNY_API_KEY=your-bunny-api-key
BUNNY_LIBRARY_ID=your-bunny-library-id
BUNNY_TOKEN_KEY=your-bunny-url-token-key
BUNNY_HOSTNAME=vz-xxxxxx.b-cdn.net

# ------------------------------------------------------------------------------
# APPLICATION SETTINGS
# ------------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Development Mode Fallback**: If Bunny.net credentials are not provided or if a lesson contains a placeholder ID (`REPLACE_WITH_BUNNY_VIDEO_ID`), the platform seamlessly provides a development video stream with an informative banner. Once Bunny credentials and IDs are added, it automatically switches to token-authenticated Bunny playback.

---

## 5. Database Setup & Migrations

The database migrations are located in `supabase/migrations/`:
- `20260925000001_initial_schema.sql` — Profiles, Classes, Lessons, Student Classes, Lesson Progress tables, helper functions, and Row Level Security (RLS) policies.
- `20260925000002_seed_data.sql` — The 4 studio courses and 40 complete instructional lessons with realistic titles, durations, and descriptions.

### How to Apply Migrations

#### Option A: Via Supabase Web Dashboard
1. Go to your Supabase project dashboard at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** tab on the left sidebar.
3. Paste the contents of `supabase/migrations/20260925000001_initial_schema.sql` and click **Run**.
4. Paste the contents of `supabase/migrations/20260925000002_seed_data.sql` and click **Run**.

#### Option B: Via Supabase CLI
```bash
supabase db push
```

---

## 6. Admin & Demo Account Setup

To bootstrap an administrator and a demo student in your Supabase Auth:

```bash
node scripts/setup-admin.mjs
```

This script creates:
- **Admin**: `admin@demo.com` / `StudioAdmin2026!` (role: `admin`)
- **Student**: `student@demo.com` / `StudioStudent2026!` (role: `student`, pre-enrolled in Painting & Botanical Art)

---

## 7. Bunny.net Stream Setup

1. Log into your [Bunny.net Dashboard](https://panel.bunny.net).
2. Navigate to **Stream** → **Video Libraries** → **Add Video Library** (e.g. "Art Studio Videos").
3. In your video library, open **API & Security**:
   - Copy the **Library ID** into `BUNNY_LIBRARY_ID`.
   - Copy the **API Key** into `BUNNY_API_KEY`.
   - Enable **Token Authentication** and copy the **URL Token Authentication Key** into `BUNNY_TOKEN_KEY`.
   - Copy the **Pull Zone Hostname** (e.g. `vz-xxxxxx.b-cdn.net`) into `BUNNY_HOSTNAME`.
4. When uploading a video to Bunny, copy the video's **Direct Video ID (GUID)** into the lesson's `video_id` field in the Admin Panel (`/admin/lessons`).

---

## 8. Development Commands

```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run TypeScript check and production build
npm run build

# Start production server locally
npm run start

# Run Next.js linter
npm run lint
```

---

## 9. Security Architecture

1. **Row Level Security (RLS)**:
   - Students can only view their own profile, classes they are enrolled in with `active` status, lessons belonging to those classes, and their own progress.
   - Progress records are strictly bound to `auth.uid()`.
   - Only admins can create classes, modify lessons, or change user permissions.
2. **Server-Side Video Token Authorization (`/api/video/auth`)**:
   - The client never talks directly to Bunny.net using private keys.
   - When requesting playback, the server verifies the user's session and verifies active enrollment in `student_classes`.
   - Generates a short-lived SHA256 signed URL / embed token with expiration.
3. **No Service-Role Key Exposure**:
   - `SUPABASE_SERVICE_ROLE_KEY` is exclusively consumed by server actions and admin API routes, never sent to the browser.

---

## 10. Production Deployment

### Cloudflare Pages / Vercel
1. Push this repository to your GitHub/GitLab repository.
2. In your Cloudflare / Vercel dashboard:
   - Framework preset: **Next.js**
   - Build command: `npm run build`
   - Output directory: `.next`
3. Configure the environment variables in the hosting dashboard matching `.env.example`.
4. Deploy the project.
