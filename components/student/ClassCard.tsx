import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ClassWithProgress } from '@/types/database';

interface ClassCardProps {
  courseClass: ClassWithProgress;
}

export default function ClassCard({ courseClass }: ClassCardProps) {
  const classNumberFormatted = courseClass.display_order.toString().padStart(2, '0');
  const isCompleted = courseClass.progress_percentage === 100;
  const isStarted = courseClass.progress_percentage > 0;

  // Destination link: If student has a next_lesson, take them directly to it or to class syllabus
  const targetHref = courseClass.next_lesson
    ? `/classes/${courseClass.slug}/lessons/${courseClass.next_lesson.id}`
    : `/classes/${courseClass.slug}`;

  return (
    <div className="group flex flex-col bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm overflow-hidden shadow-subtle hover:border-[#D9D4CA] transition-all duration-200">
      {/* Cover Artwork */}
      <Link href={`/classes/${courseClass.slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-[#F3EFEA] block">
        {courseClass.cover_image_url ? (
          <Image
            src={courseClass.cover_image_url}
            alt={courseClass.title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-serif text-3xl text-[#78716C]">
            {classNumberFormatted}
          </div>
        )}

        {/* Editorial class number badge */}
        <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-mono text-[#141413] rounded border border-[#E7E2D8]/60">
          {classNumberFormatted} /
        </div>

        {isCompleted && (
          <div className="absolute top-3 right-3 bg-[#2A4E39]/90 text-white backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase rounded flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Complete</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between space-y-4">
        <div className="space-y-2">
          <Link href={`/classes/${courseClass.slug}`}>
            <h3 className="font-serif text-xl sm:text-2xl text-[#141413] font-medium hover:text-[#2A4E39] transition-colors">
              {courseClass.title}
            </h3>
          </Link>
          <p className="text-xs text-[#6E6B65] line-clamp-2 leading-relaxed">
            {courseClass.short_description}
          </p>
        </div>

        {/* Footer Area: Meta, Progress, CTA */}
        <div className="pt-3 border-t border-[#F0ECE5] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#78716C]">
            <span>{courseClass.total_lessons} lessons</span>
            <span className="font-medium text-[#141413]">
              Progress · {courseClass.progress_percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-[#F3EFEA] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-[#2A4E39]' : 'bg-[#141413]'
              }`}
              style={{ width: `${courseClass.progress_percentage}%` }}
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              href={`/classes/${courseClass.slug}`}
              className="text-xs text-[#78716C] hover:text-[#141413] underline underline-offset-4"
            >
              Class Syllabus
            </Link>

            <Link
              href={targetHref}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#141413] group-hover:text-[#2A4E39] transition-colors"
            >
              <span>{isCompleted ? 'Review' : isStarted ? 'Continue' : 'Start'}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
