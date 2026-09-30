import { createClient } from '@/lib/supabase/server';
import { CourseClass, Lesson, LessonProgress, ClassWithProgress, LessonWithProgress } from '@/types/database';

/**
 * Fetch all classes assigned to a student with calculated progress
 */
export async function getStudentAssignedClasses(studentId: string): Promise<ClassWithProgress[]> {
  const supabase = await createClient();

  // 1. Get active student class enrollments
  const { data: enrollments, error: enrollError } = await supabase
    .from('student_classes')
    .select('class_id')
    .eq('student_id', studentId)
    .eq('status', 'active');

  if (enrollError || !enrollments || enrollments.length === 0) {
    return [];
  }

  const classIds = enrollments.map((e) => e.class_id);

  // 2. Fetch classes that are published
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('*')
    .in('id', classIds)
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  if (classError || !classes) {
    return [];
  }

  // 3. For each class, fetch lessons and student progress
  const results: ClassWithProgress[] = await Promise.all(
    classes.map(async (cls) => {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, title, display_order, duration_seconds')
        .eq('class_id', cls.id)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      const totalLessons = lessons?.length || 0;

      if (totalLessons === 0) {
        return {
          ...cls,
          total_lessons: 0,
          completed_lessons: 0,
          progress_percentage: 0,
          next_lesson: null,
        };
      }

      const lessonIds = lessons!.map((l) => l.id);

      const { data: progressRecords } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed, progress_percentage, watched_seconds, last_watched_at')
        .eq('student_id', studentId)
        .in('lesson_id', lessonIds);

      const progressMap = new Map<string, any>();
      (progressRecords || []).forEach((p) => progressMap.set(p.lesson_id, p));

      const completedCount = (progressRecords || []).filter((p) => p.completed).length;
      const progressPercentage = Math.round((completedCount / totalLessons) * 100);

      // Determine next lesson:
      // Priority 1: A lesson in-progress (watched > 0 and not completed)
      // Priority 2: First lesson not completed
      let nextLessonCandidate = lessons!.find((l) => {
        const prog = progressMap.get(l.id);
        return prog && !prog.completed && prog.watched_seconds > 0;
      });

      if (!nextLessonCandidate) {
        nextLessonCandidate = lessons!.find((l) => {
          const prog = progressMap.get(l.id);
          return !prog || !prog.completed;
        });
      }

      const nextLessonProg = nextLessonCandidate
        ? progressMap.get(nextLessonCandidate.id)
        : null;

      return {
        ...cls,
        total_lessons: totalLessons,
        completed_lessons: completedCount,
        progress_percentage: progressPercentage,
        next_lesson: nextLessonCandidate
          ? {
              id: nextLessonCandidate.id,
              title: nextLessonCandidate.title,
              display_order: nextLessonCandidate.display_order,
              duration_seconds: nextLessonCandidate.duration_seconds,
              progress_percentage: nextLessonProg?.progress_percentage || 0,
            }
          : null,
      };
    })
  );

  return results;
}

/**
 * Get Continue Learning candidate for student dashboard
 */
export async function getContinueLearning(studentId: string) {
  const classesWithProgress = await getStudentAssignedClasses(studentId);

  // Filter to classes that have a next lesson to watch
  const activeClasses = classesWithProgress.filter((c) => c.next_lesson !== null);

  if (activeClasses.length === 0) {
    return null;
  }

  // Find the one with most recent activity or first incomplete
  const supabase = await createClient();
  const { data: recentProgress } = await supabase
    .from('lesson_progress')
    .select('lesson_id, last_watched_at')
    .eq('student_id', studentId)
    .order('last_watched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recentProgress) {
    for (const cls of activeClasses) {
      if (cls.next_lesson && cls.next_lesson.id === recentProgress.lesson_id) {
        return {
          class: cls,
          lesson: cls.next_lesson,
        };
      }
    }
  }

  // Otherwise pick the first active class's next lesson
  const firstActive = activeClasses[0];
  if (!firstActive || !firstActive.next_lesson) {
    return null;
  }

  return {
    class: firstActive,
    lesson: firstActive.next_lesson,
  };
}

/**
 * Fetch class details by slug with access verification
 */
export async function getClassBySlug(slug: string, userId: string, isAdmin: boolean) {
  const supabase = await createClient();

  // 1. Fetch class
  const { data: courseClass, error: classError } = await supabase
    .from('classes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (classError || !courseClass) {
    return { error: 'Class not found', class: null, hasAccess: false };
  }

  // 2. Check access
  let hasAccess = isAdmin;
  if (!isAdmin) {
    const { data: access } = await supabase
      .from('student_classes')
      .select('id, status')
      .eq('student_id', userId)
      .eq('class_id', courseClass.id)
      .eq('status', 'active')
      .maybeSingle();

    hasAccess = !!access;
  }

  if (!hasAccess) {
    return { error: 'Access unavailable', class: courseClass, hasAccess: false };
  }

  // 3. Fetch lessons
  let lessonQuery = supabase
    .from('lessons')
    .select('*')
    .eq('class_id', courseClass.id)
    .order('display_order', { ascending: true });

  if (!isAdmin) {
    lessonQuery = lessonQuery.eq('is_published', true);
  }

  const { data: lessons } = await lessonQuery;

  // 4. Fetch progress for all lessons
  const lessonIds = (lessons || []).map((l) => l.id);
  const { data: progressRecords } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('student_id', userId)
    .in('lesson_id', lessonIds);

  const progressMap = new Map<string, LessonProgress>();
  (progressRecords || []).forEach((p) => progressMap.set(p.lesson_id, p));

  const lessonsWithProgress: LessonWithProgress[] = (lessons || []).map((lesson) => ({
    ...lesson,
    progress: progressMap.get(lesson.id) || null,
  }));

  const totalLessons = lessonsWithProgress.length;
  const completedLessons = lessonsWithProgress.filter((l) => l.progress?.completed).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    error: null,
    hasAccess: true,
    class: {
      ...courseClass,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      progress_percentage: progressPercentage,
      lessons: lessonsWithProgress,
    },
  };
}

/**
 * Fetch lesson details with navigation and progress
 */
export async function getLessonWithNavigation(
  classSlug: string,
  lessonId: string,
  userId: string,
  isAdmin: boolean
) {
  const classResult = await getClassBySlug(classSlug, userId, isAdmin);

  if (!classResult.hasAccess || !classResult.class) {
    return {
      error: classResult.error || 'Access unavailable',
      hasAccess: false,
      lesson: null,
      class: null,
      previousLesson: null,
      nextLesson: null,
      allLessons: [],
    };
  }

  const lessons = classResult.class.lessons as LessonWithProgress[];
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);

  if (currentIndex === -1) {
    return {
      error: 'Lesson not found in this class',
      hasAccess: true,
      lesson: null,
      class: classResult.class,
      previousLesson: null,
      nextLesson: null,
      allLessons: lessons,
    };
  }

  const currentLesson = lessons[currentIndex];
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return {
    error: null,
    hasAccess: true,
    lesson: currentLesson,
    class: classResult.class,
    previousLesson,
    nextLesson,
    allLessons: lessons,
  };
}
