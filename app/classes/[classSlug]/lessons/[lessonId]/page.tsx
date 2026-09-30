import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLessonWithNavigation } from '@/services/courseService';
import VideoPlayer from '@/components/video/VideoPlayer';
import LessonListItem from '@/components/student/LessonListItem';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, BookOpen, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface LessonPageProps {
  params: {
    classSlug: string;
    lessonId: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/classes/${params.classSlug}/lessons/${params.lessonId}`);
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // Fetch lesson with navigation
  const result = await getLessonWithNavigation(
    params.classSlug,
    params.lessonId,
    user.id,
    isAdmin
  );

  // If not authorized (Section 26)
  if (!result.hasAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="font-serif text-3xl font-medium text-[#141413]">
          Access Unavailable
        </h1>
        <p className="text-sm text-[#6E6B65] max-w-md mx-auto">
          You don't currently have access to this class.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black"
        >
          Return to My Classes
        </Link>
      </div>
    );
  }

  if (!result.lesson || !result.class) {
    notFound();
  }

  const { lesson, class: courseClass, previousLesson, nextLesson, allLessons } = result;
  const lessonNumberFormatted = lesson.display_order.toString().padStart(2, '0');
  const classNumberFormatted = courseClass.display_order.toString().padStart(2, '0');
  const isLessonCompleted = lesson.progress?.completed || false;
  const initialWatchedSeconds = lesson.progress?.watched_seconds || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs uppercase tracking-wider text-[#78716C]">
        <Link href="/dashboard" className="hover:text-[#141413] transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <Link
          href={`/classes/${courseClass.slug}`}
          className="hover:text-[#141413] transition-colors"
        >
          {classNumberFormatted} · {courseClass.title}
        </Link>
        <span>/</span>
        <span className="text-[#141413] font-medium font-mono">
          Lesson {lessonNumberFormatted}
        </span>
      </div>

      {/* Main Grid: Video + Syllabus Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column: Video Player & Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Video Player */}
          <div className="rounded-sm overflow-hidden bg-black border border-[#141413]/10">
            <VideoPlayer
              lessonId={lesson.id}
              initialWatchedSeconds={initialWatchedSeconds}
              isInitiallyCompleted={isLessonCompleted}
            />
          </div>

          {/* Lesson Metadata Header */}
          <div className="space-y-4 bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-6 sm:p-8 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0ECE5] pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#78716C] block">
                  {classNumberFormatted} / {courseClass.title.toUpperCase()}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#141413] font-medium tracking-tight mt-1">
                  {lessonNumberFormatted} / {lesson.title}
                </h1>
              </div>

              {isLessonCompleted && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#F1F6F3] text-[#2A4E39] border border-[#CEE0D4] rounded text-xs font-medium shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed</span>
                </div>
              )}
            </div>

            {/* Lesson Description */}
            <div className="text-xs sm:text-sm text-[#6E6B65] leading-relaxed space-y-3">
              <p>{lesson.description}</p>
            </div>

            {/* Previous & Next Navigation Controls */}
            <div className="pt-6 border-t border-[#F0ECE5] flex items-center justify-between gap-4">
              {previousLesson ? (
                <Link
                  href={`/classes/${courseClass.slug}/lessons/${previousLesson.id}`}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 border border-[#E7E2D8] bg-[#FAF8F5] text-xs uppercase tracking-wider font-medium text-[#141413] rounded hover:bg-[#F3EFEA] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Previous:</span>
                  <span className="truncate max-w-[140px]">{previousLesson.title}</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center space-x-2 px-4 py-2.5 border border-[#E7E2D8]/50 text-xs uppercase tracking-wider font-medium text-[#A6A29A] rounded cursor-not-allowed bg-[#FAF8F5]/50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>First Lesson</span>
                </button>
              )}

              {nextLesson ? (
                <Link
                  href={`/classes/${courseClass.slug}/lessons/${nextLesson.id}`}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors"
                >
                  <span className="hidden sm:inline">Next:</span>
                  <span className="truncate max-w-[140px]">{nextLesson.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href={`/classes/${courseClass.slug}`}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#2A4E39] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-[#1E3A2A] transition-colors"
                >
                  <span>Class Completed</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right / Secondary Column: Course Curriculum Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-5 shadow-subtle space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE5]">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#78716C]" />
                <h3 className="font-serif text-lg font-medium text-[#141413]">
                  Course Content
                </h3>
              </div>
              <span className="text-xs font-mono text-[#78716C]">
                {allLessons.filter((l) => l.progress?.completed).length}/{allLessons.length}
              </span>
            </div>

            {/* List of lessons */}
            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {allLessons.map((l) => (
                <LessonListItem
                  key={l.id}
                  lesson={l}
                  classSlug={courseClass.slug}
                  isActive={l.id === lesson.id}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
