-- ==============================================================================
-- ART COURSE PLATFORM — COMPLETE PRODUCTION DATABASE SCHEMA
-- Migration: 20260925000001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE (Associated with Supabase Auth users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup by email and role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================================
-- 2. CLASSES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    cover_image_url TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_classes_slug ON public.classes(slug);
CREATE INDEX IF NOT EXISTS idx_classes_display_order ON public.classes(display_order);
CREATE INDEX IF NOT EXISTS idx_classes_published ON public.classes(is_published);

-- ==============================================================================
-- 3. LESSONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    video_id TEXT,
    video_provider TEXT NOT NULL DEFAULT 'bunny',
    duration_seconds INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lessons_class_id ON public.lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_lessons_display_order ON public.lessons(display_order);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON public.lessons(is_published);

-- ==============================================================================
-- 4. STUDENT CLASS ACCESS (Many-to-Many)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    CONSTRAINT uq_student_class UNIQUE (student_id, class_id)
);

CREATE INDEX IF NOT EXISTS idx_student_classes_student ON public.student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_class ON public.student_classes(class_id);
CREATE INDEX IF NOT EXISTS idx_student_classes_status ON public.student_classes(status);

-- ==============================================================================
-- 5. LESSON PROGRESS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    progress_percentage INT NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    watched_seconds INT NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    last_watched_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_student_lesson_progress UNIQUE (student_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_student ON public.lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON public.lesson_progress(completed);

-- ==============================================================================
-- 6. SECURITY DEFINER HELPER FUNCTIONS
-- ==============================================================================

-- Check if current authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Check if current user has active access to a class
CREATE OR REPLACE FUNCTION public.has_class_access(target_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.student_classes
            WHERE student_id = auth.uid()
              AND class_id = target_class_id
              AND status = 'active'
        )
    );
$$;

-- Check if current user has active access to a lesson via its class
CREATE OR REPLACE FUNCTION public.has_lesson_access(target_lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.lessons l
            JOIN public.student_classes sc ON sc.class_id = l.class_id
            WHERE l.id = target_lesson_id
              AND sc.student_id = auth.uid()
              AND sc.status = 'active'
        )
    );
$$;

-- ==============================================================================
-- 7. AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    default_role TEXT := 'student';
    user_name TEXT;
BEGIN
    IF (NEW.raw_user_meta_data->>'role') IS NOT NULL AND (NEW.raw_user_meta_data->>'role') IN ('student', 'admin') THEN
        default_role := NEW.raw_user_meta_data->>'role';
    END IF;

    user_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        default_role,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS touch_profiles_updated_at ON public.profiles;
CREATE TRIGGER touch_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_classes_updated_at ON public.classes;
CREATE TRIGGER touch_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_lessons_updated_at ON public.lessons;
CREATE TRIGGER touch_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS touch_lesson_progress_updated_at ON public.lesson_progress;
CREATE TRIGGER touch_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid() OR public.is_admin())
    WITH CHECK (
        public.is_admin() OR (
            id = auth.uid() AND
            role = (SELECT role FROM public.profiles WHERE id = auth.uid()) -- Students cannot promote themselves
        )
    );

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- CLASSES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "classes_select_policy" ON public.classes;
CREATE POLICY "classes_select_policy" ON public.classes
    FOR SELECT
    USING (
        public.is_admin()
        OR (is_published = true AND public.has_class_access(id))
    );

DROP POLICY IF EXISTS "classes_admin_manage" ON public.classes;
CREATE POLICY "classes_admin_manage" ON public.classes
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- LESSONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "lessons_select_policy" ON public.lessons;
CREATE POLICY "lessons_select_policy" ON public.lessons
    FOR SELECT
    USING (
        public.is_admin()
        OR (is_published = true AND public.has_class_access(class_id))
    );

DROP POLICY IF EXISTS "lessons_admin_manage" ON public.lessons;
CREATE POLICY "lessons_admin_manage" ON public.lessons
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- STUDENT CLASSES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "student_classes_select_policy" ON public.student_classes;
CREATE POLICY "student_classes_select_policy" ON public.student_classes
    FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "student_classes_admin_manage" ON public.student_classes;
CREATE POLICY "student_classes_admin_manage" ON public.student_classes
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- LESSON PROGRESS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "lesson_progress_select_policy" ON public.lesson_progress;
CREATE POLICY "lesson_progress_select_policy" ON public.lesson_progress
    FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "lesson_progress_insert_policy" ON public.lesson_progress;
CREATE POLICY "lesson_progress_insert_policy" ON public.lesson_progress
    FOR INSERT
    WITH CHECK (
        (student_id = auth.uid() AND public.has_lesson_access(lesson_id))
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "lesson_progress_update_policy" ON public.lesson_progress;
CREATE POLICY "lesson_progress_update_policy" ON public.lesson_progress
    FOR UPDATE
    USING (student_id = auth.uid() OR public.is_admin())
    WITH CHECK (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "lesson_progress_delete_policy" ON public.lesson_progress;
CREATE POLICY "lesson_progress_delete_policy" ON public.lesson_progress
    FOR DELETE
    USING (public.is_admin());
