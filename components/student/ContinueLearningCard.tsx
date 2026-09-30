import Link from 'next/link';
import Image from 'next/image';
import { Play, ArrowRight } from 'lucide-react';
import { ClassWithProgress } from '@/types/database';

interface ContinueLearningCardProps {
  courseClass: ClassWithProgress;
  lesson: {
    id: string;
    title: string;
    display_order: number;
    duration_seconds: number;
    progress_percentage: number;
  };
}

export default function ContinueLearningCard({
  courseClass,
  lesson,
}: ContinueLearningCardProps) {
  const lessonNumberFormatted = lesson.display_order.toString().padStart(2, '0');
  const classNumberFormatted = courseClass.display_order.toString().padStart(2, '0');

  return (
    <div className="relative overflow-hidden rounded-sm border border-[#E7E2D8] bg-[#FFFFFF] shadow-subtle p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Column: Context & Titles */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#78716C]">
            <span>Continue Learning</span>
            <span>·</span>
            <span className="font-mono">{classNumberFormatted} / {courseClass.title}</span>
          </div>

          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#141413] tracking-tight font-medium">
              {lessonNumberFormatted} / {lesson.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6E6B65] line-clamp-2">
              {courseClass.short_description}
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs text-[#78716C]">
              <span>Lesson Progress</span>
              <span className="font-medium text-[#141413]">{lesson.progress_percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F3EFEA] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#141413] rounded-full transition-all duration-300"
                style={{ width: `${Math.max(4, lesson.progress_percentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: CTA */}
        <div className="flex items-center shrink-0">
          <Link
            href={`/classes/${courseClass.slug}/lessons/${lesson.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-all group"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
