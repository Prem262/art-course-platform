import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateBunnyVideoAuth } from '@/lib/video/bunny';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ error: 'Missing lessonId parameter' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access lessons.' },
        { status: 401 }
      );
    }

    // Check user profile for admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    // Fetch lesson with class details
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        video_id,
        video_provider,
        duration_seconds,
        is_published,
        class_id,
        classes:class_id (
          id,
          title,
          is_published
        )
      `)
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Verify access
    if (!isAdmin) {
      // Must be published
      if (!lesson.is_published) {
        return NextResponse.json({ error: 'Lesson is not published' }, { status: 403 });
      }

      // Check student access
      const { data: access, error: accessError } = await supabase
        .from('student_classes')
        .select('id, status')
        .eq('student_id', user.id)
        .eq('class_id', lesson.class_id)
        .eq('status', 'active')
        .single();

      if (accessError || !access) {
        return NextResponse.json(
          {
            error: "Access unavailable. You do not have active enrollment in this class.",
          },
          { status: 403 }
        );
      }
    }

    // Generate secure Bunny video token or dev fallback
    const videoAuth = generateBunnyVideoAuth(lesson.video_id || '');

    return NextResponse.json({
      success: true,
      lessonId: lesson.id,
      title: lesson.title,
      durationSeconds: lesson.duration_seconds,
      ...videoAuth,
    });
  } catch (error: any) {
    console.error('Error authorizing video playback:', error);
    return NextResponse.json(
      { error: 'Internal server error verifying video access' },
      { status: 500 }
    );
  }
}
