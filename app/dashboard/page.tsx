import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStudentAssignedClasses, getContinueLearning } from '@/services/courseService';
import ContinueLearningCard from '@/components/student/ContinueLearningCard';
import ClassCard from '@/components/student/ClassCard';
import { BookOpen, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch student profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single();

  const studentName = profile?.full_name || user.email?.split('@')[0] || 'Student';

  // Fetch assigned classes and continue learning
  const assignedClasses = await getStudentAssignedClasses(user.id);
  const continueLearningData = await getContinueLearning(user.id);

  // Calculate summary stats
  const totalClasses = assignedClasses.length;
  const completedClasses = assignedClasses.filter((c) => c.progress_percentage === 100).length;
  const totalLessons = assignedClasses.reduce((acc, c) => acc + c.total_lessons, 0);
  const completedLessons = assignedClasses.reduce((acc, c) => acc + c.completed_lessons, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. Header & Welcome */}
      <div className="border-b border-[#E7E2D8] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#78716C]">
            <Sparkles className="w-3.5 h-3.5 text-[#8B6D36]" />
            <span>Studio Workspace</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#141413] font-medium tracking-tight">
            Welcome back, {studentName}
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6B65] max-w-xl">
            Continue where you left off or explore your assigned lessons below.
          </p>
        </div>

        {/* Practice overview pill */}
        {totalClasses > 0 && (
          <div className="flex items-center space-x-4 bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm px-4 py-3 text-xs shadow-subtle shrink-0">
            <div className="text-center px-2">
              <span className="block font-serif text-lg font-semibold text-[#141413]">
                {completedLessons}/{totalLessons}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#78716C]">
                Lessons Complete
              </span>
            </div>
            <div className="h-8 w-px bg-[#E7E2D8]" />
            <div className="text-center px-2">
              <span className="block font-serif text-lg font-semibold text-[#2A4E39]">
                {completedClasses}/{totalClasses}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#78716C]">
                Classes Finished
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Priority: CONTINUE LEARNING */}
      {continueLearningData && continueLearningData.lesson && (
        <section aria-labelledby="continue-learning-title">
          <ContinueLearningCard
            courseClass={continueLearningData.class}
            lesson={continueLearningData.lesson}
          />
        </section>
      )}

      {/* 3. MY CLASSES */}
      <section id="my-classes" aria-labelledby="my-classes-title" className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-[#E7E2D8] pb-3">
          <div>
            <h2 id="my-classes-title" className="font-serif text-2xl sm:text-3xl text-[#141413] font-medium tracking-tight">
              My Classes
            </h2>
            <p className="text-xs text-[#78716C] mt-1">
              Active structured courses assigned to your studio account
            </p>
          </div>
          <span className="text-xs font-mono text-[#78716C]">
            {assignedClasses.length} {assignedClasses.length === 1 ? 'Class' : 'Classes'}
          </span>
        </div>

        {assignedClasses.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#F3EFEA] border border-[#E7E2D8] flex items-center justify-center text-[#78716C] mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#141413]">
              No classes assigned yet.
            </h3>
            <p className="text-xs sm:text-sm text-[#6E6B65] max-w-md mx-auto leading-relaxed">
              Your studio instructor has not yet assigned any classes to this account. Once assigned, your course materials and video lessons will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
            {assignedClasses.map((cls) => (
              <ClassCard key={cls.id} courseClass={cls} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
