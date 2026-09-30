import Link from 'next/link';
import { CheckCircle2, Circle, Play } from 'lucide-react';
import { LessonWithProgress } from '@/types/database';

interface LessonListItemProps {
  lesson: LessonWithProgress;
  classSlug: string;
  isActive?: boolean;
}

export default function LessonListItem({
  lesson,
  classSlug,
  isActive = false,
}: LessonListItemProps) {
  const numberFormatted = lesson.display_order.toString().padStart(2, '0');
  const isCompleted = lesson.progress?.completed || false;
  const progressPercent = lesson.progress?.progress_percentage || 0;
  const inProgress = !isCompleted && progressPercent > 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link
      href={`/classes/${classSlug}/lessons/${lesson.id}`}
      className={`group flex items-center justify-between p-4 rounded-sm border transition-all duration-150 ${
        isActive
          ? 'bg-[#FAF8F5] border-[#141413] shadow-sm'
          : 'bg-[#FFFFFF] border-[#E7E2D8] hover:border-[#D9D4CA] hover:bg-[#FAF8F5]/50'
      }`}
    >
      <div className="flex items-center space-x-4 min-w-0 pr-4">
        {/* State Icon */}
        <div className="shrink-0">
          {isCompleted ? (
            <div className="w-6 h-6 rounded-full bg-[#F1F6F3] border border-[#CEE0D4] flex items-center justify-center text-[#2A4E39]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          ) : inProgress ? (
            <div className="w-6 h-6 rounded-full bg-[#FAF5EA] border border-[#E8DEC8] flex items-center justify-center text-[#8B6D36]">
              <div className="w-2 h-2 rounded-full bg-[#8B6D36]" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-[#D9D4CA] flex items-center justify-center text-[#78716C]">
              <Circle className="w-2.5 h-2.5 opacity-40" />
            </div>
          )}
        </div>

        {/* Lesson Number and Title */}
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[11px] text-[#78716C]">
              {numberFormatted} /
            </span>
            <h4
              className={`text-sm truncate font-medium ${
                isActive ? 'text-[#141413] font-semibold' : 'text-[#292724] group-hover:text-[#141413]'
              }`}
            >
              {lesson.title}
            </h4>
          </div>

          {lesson.description && (
            <p className="text-xs text-[#78716C] truncate mt-0.5 max-w-md hidden sm:block">
              {lesson.description}
            </p>
          )}
        </div>
      </div>

      {/* Duration and Status */}
      <div className="flex items-center space-x-3 shrink-0 text-xs">
        {inProgress && (
          <span className="hidden sm:inline-block text-[11px] text-[#8B6D36] font-medium bg-[#FAF5EA] px-2 py-0.5 rounded border border-[#E8DEC8]">
            {progressPercent}%
          </span>
        )}
        <span className="font-mono text-[11px] text-[#78716C]">
          {formatDuration(lesson.duration_seconds)}
        </span>
        <Play
          className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${
            isActive ? 'text-[#141413] fill-[#141413]' : 'text-[#A6A29A] group-hover:text-[#141413]'
          }`}
        />
      </div>
    </Link>
  );
}
