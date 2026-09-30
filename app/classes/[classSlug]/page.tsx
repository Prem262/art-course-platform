import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getClassBySlug } from '@/services/courseService';
import LessonListItem from '@/components/student/LessonListItem';
import { LessonWithProgress } from '@/types/database';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ClassDetailPageProps {
  params: {
    classSlug: string;
  };
}

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/classes/${params.classSlug}`);
  }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // Fetch class details and check access server-side
  const result = await getClassBySlug(params.classSlug, user.id, isAdmin);

  // If class doesn't exist at all
  if (!result.class && result.error === 'Class not found') {
    notFound();
  }

  // If student does NOT have access (Section 26 enforcement)
  if (!result.hasAccess || !result.class) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-[#FAF0F0] border border-[#EAD0D0] flex items-center justify-center text-[#8F2D2D] mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-medium text-[#141413]">
            Access Unavailable
          </h1>
          <p className="text-sm text-[#6E6B65] max-w-md mx-auto leading-relaxed">
            You don't currently have active access to this class. Please contact your studio instructor or return to your assigned classes.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to My Classes</span>
          </Link>
        </div>
      </div>
    );
  }

  const courseClass = result.class;
  const lessons: LessonWithProgress[] = courseClass.lessons as LessonWithProgress[];
  const classNumberFormatted = courseClass.display_order.toString().padStart(2, '0');

  // Determine continue lesson
  const firstIncompleteLesson =
    lessons.find((l: LessonWithProgress) => l.progress && !l.progress.completed && l.progress.watched_seconds > 0) ||
    lessons.find((l: LessonWithProgress) => !l.progress || !l.progress.completed) ||
    lessons[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-[#78716C] hover:text-[#141413] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Class Hero Header */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-6 sm:p-8 shadow-subtle">
        {/* Cover Artwork */}
        <div className="md:col-span-5 relative aspect-[4/3] rounded-sm overflow-hidden bg-[#F3EFEA] border border-[#E7E2D8]">
          {courseClass.cover_image_url ? (
            <Image
              src={courseClass.cover_image_url}
              alt={courseClass.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-serif text-4xl text-[#78716C]">
              {classNumberFormatted}
            </div>
          )}
          <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-sm px-2.5 py-1 text-xs font-mono text-[#141413] rounded border border-[#E7E2D8]/60">
            {classNumberFormatted} /
          </div>
        </div>

        {/* Course Details */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#78716C]">
              <span>Studio Course</span>
              <span>·</span>
              <span>{courseClass.total_lessons} Lessons</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-[#141413] font-medium tracking-tight">
              {courseClass.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#6E6B65] leading-relaxed">
              {courseClass.description || courseClass.short_description}
            </p>
          </div>

          {/* Progress summary & Action */}
          <div className="pt-4 border-t border-[#F0ECE5] space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#78716C]">Course Progress</span>
                <span className="font-medium text-[#141413]">
                  {courseClass.completed_lessons} of {courseClass.total_lessons} complete ({courseClass.progress_percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[#F3EFEA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#141413] rounded-full transition-all duration-300"
                  style={{ width: `${courseClass.progress_percentage}%` }}
                />
              </div>
            </div>

            {firstIncompleteLesson && (
              <div>
                <Link
                  href={`/classes/${courseClass.slug}/lessons/${firstIncompleteLesson.id}`}
                  className="inline-flex items-center space-x-2.5 px-6 py-3 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>
                    {courseClass.progress_percentage === 100
                      ? 'Review Course'
                      : courseClass.progress_percentage > 0
                      ? 'Continue Learning'
                      : 'Start First Lesson'}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Syllabus List */}
      <section className="space-y-6">
        <div className="border-b border-[#E7E2D8] pb-3">
          <h2 className="font-serif text-2xl text-[#141413] font-medium tracking-tight">
            Class Curriculum
          </h2>
          <p className="text-xs text-[#78716C] mt-1">
            Complete each lesson sequentially to build deliberate artistic technique
          </p>
        </div>

        {lessons.length === 0 ? (
          <div className="p-8 bg-[#FFFFFF] border border-[#E7E2D8] text-center text-xs text-[#78716C] rounded-sm">
            No lessons have been added yet to this class.
          </div>
        ) : (
          <div className="space-y-2.5">
            {lessons.map((lesson) => (
              <LessonListItem
                key={lesson.id}
                lesson={lesson}
                classSlug={courseClass.slug}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
