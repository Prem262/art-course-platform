import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, watchedSeconds, durationSeconds, markComplete } = body;

    if (!lessonId || typeof watchedSeconds !== 'number') {
      return NextResponse.json({ error: 'Missing required progress parameters' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user profile for admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    // Verify student has access to the lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('id, class_id, duration_seconds')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (!isAdmin) {
      const { data: access, error: accessError } = await supabase
        .from('student_classes')
        .select('id, status')
        .eq('student_id', user.id)
        .eq('class_id', lesson.class_id)
        .eq('status', 'active')
        .single();

      if (accessError || !access) {
        return NextResponse.json({ error: 'No access to lesson class' }, { status: 403 });
      }
    }

    const effectiveDuration = durationSeconds || lesson.duration_seconds || 1;
    let percentage = Math.min(100, Math.max(0, Math.round((watchedSeconds / effectiveDuration) * 100)));

    // Fetch existing progress
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('id, completed, progress_percentage, watched_seconds, completed_at')
      .eq('student_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    const wasAlreadyCompleted = existingProgress?.completed === true;

    // Threshold: 90% or more marks completed
    const isNowCompleted = wasAlreadyCompleted || markComplete === true || percentage >= 90;
    const finalPercentage = isNowCompleted ? 100 : Math.max(percentage, existingProgress?.progress_percentage || 0);

    const nowIso = new Date().toISOString();

    const { data: updatedProgress, error: upsertError } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          student_id: user.id,
          lesson_id: lessonId,
          progress_percentage: finalPercentage,
          watched_seconds: Math.round(watchedSeconds),
          completed: isNowCompleted,
          last_watched_at: nowIso,
          completed_at: isNowCompleted
            ? existingProgress?.completed_at || nowIso
            : null,
          updated_at: nowIso,
        },
        { onConflict: 'student_id,lesson_id' }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Failed to upsert lesson progress:', upsertError);
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
    });
  } catch (error: any) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
