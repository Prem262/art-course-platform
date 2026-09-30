'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toggleClassAccessAction } from '@/app/admin/actions';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlusCircle,
  MinusCircle,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StudentDetailClientProps {
  student: any;
  classes: any[];
}

export default function StudentDetailClient({
  student,
  classes,
}: StudentDetailClientProps) {
  const router = useRouter();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  async function handleToggleAccess(classId: string, currentStatus: string) {
    setTogglingId(classId);
    try {
      const action = currentStatus === 'active' ? 'revoke' : 'assign';
      await toggleClassAccessAction(student.id, classId, action);
      router.refresh();
    } catch (err) {
      console.error('Failed to change class access:', err);
    } finally {
      setTogglingId(null);
    }
  }

  const toggleExpand = (classId: string) => {
    setExpandedClassId(expandedClassId === classId ? null : classId);
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/admin/students"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-wider text-[#78716C] hover:text-[#141413] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students Directory</span>
        </Link>
      </div>

      {/* Student Identity Card */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-[#78716C]">
            Student Account
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#141413] tracking-tight">
            {student.full_name || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6B65]">
            {student.email} · Registered {new Date(student.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono bg-[#FAF8F5] border border-[#E7E2D8] px-4 py-3 rounded">
          <div>
            <span className="block text-base font-serif font-bold text-[#141413]">
              {classes.filter((c) => c.is_assigned).length}/{classes.length}
            </span>
            <span className="text-[10px] uppercase text-[#78716C]">
              Enrolled Classes
            </span>
          </div>
        </div>
      </div>

      {/* Class Access & Progress Management */}
      <div className="space-y-4">
        <div className="border-b border-[#E7E2D8] pb-3">
          <h2 className="font-serif text-2xl font-medium text-[#141413] tracking-tight">
            Assigned Classes & Detailed Progress
          </h2>
          <p className="text-xs text-[#78716C] mt-1">
            Toggle enrollment access and review lesson completion timestamps.
          </p>
        </div>

        <div className="space-y-4">
          {classes.map((cls) => {
            const isAssigned = cls.is_assigned;
            const isExpanded = expandedClassId === cls.class_id;

            return (
              <div
                key={cls.class_id}
                className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm shadow-subtle overflow-hidden"
              >
                {/* Header row */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <button
                      onClick={() => toggleExpand(cls.class_id)}
                      className="p-1 hover:bg-[#FAF8F5] rounded text-[#78716C]"
                      title="Toggle lesson details"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#141413]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#141413]" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif text-lg font-medium text-[#141413]">
                          {cls.title}
                        </h3>
                        {isAssigned ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-[#F1F6F3] text-[#2A4E39] border border-[#CEE0D4] rounded text-[10px] uppercase tracking-wider font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active Access</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#A6A29A] border border-[#E7E2D8] rounded text-[10px] uppercase tracking-wider">
                            No Access
                          </span>
                        )}
                      </div>

                      {isAssigned && (
                        <p className="text-xs text-[#78716C] mt-0.5">
                          Progress: {cls.completed_lessons} of {cls.total_lessons} lessons completed ({cls.progress_percentage}%)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Progress Bar */}
                  <div className="flex items-center space-x-4">
                    {isAssigned && (
                      <div className="w-32 hidden sm:block">
                        <div className="w-full h-1.5 bg-[#F3EFEA] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#141413] rounded-full"
                            style={{ width: `${cls.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        handleToggleAccess(cls.class_id, cls.enrollment_status)
                      }
                      disabled={togglingId === cls.class_id}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded transition-colors ${
                        isAssigned
                          ? 'border border-[#EAD0D0] text-[#8F2D2D] bg-[#FAF0F0] hover:bg-[#F5E2E2]'
                          : 'bg-[#141413] text-white hover:bg-black'
                      }`}
                    >
                      {isAssigned ? (
                        <>
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>
                            {togglingId === cls.class_id ? 'Revoking...' : 'Revoke Access'}
                          </span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>
                            {togglingId === cls.class_id ? 'Assigning...' : 'Assign Class'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible lesson breakdown */}
                {isExpanded && (
                  <div className="border-t border-[#F0ECE5] bg-[#FAF8F5]/60 p-4 sm:p-5">
                    <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#78716C] mb-3">
                      Lesson Completion Breakdown ({cls.lessons.length} Lessons)
                    </h4>

                    <div className="divide-y divide-[#E7E2D8] bg-white rounded border border-[#E7E2D8]">
                      {cls.lessons.map((lesson: any) => {
                        const isDone = lesson.progress?.completed || false;
                        const pct = lesson.progress?.progress_percentage || 0;

                        return (
                          <div
                            key={lesson.id}
                            className="p-3 flex items-center justify-between text-xs hover:bg-[#FAF8F5]"
                          >
                            <div className="flex items-center space-x-3">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-[#2A4E39]" />
                              ) : pct > 0 ? (
                                <div className="w-4 h-4 rounded-full border border-[#8B6D36] flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#8B6D36]" />
                                </div>
                              ) : (
                                <Circle className="w-4 h-4 text-[#A6A29A]" />
                              )}

                              <div>
                                <span className="font-mono text-[10px] text-[#78716C] mr-2">
                                  {lesson.display_order.toString().padStart(2, '0')} /
                                </span>
                                <span className="font-medium text-[#141413]">
                                  {lesson.title}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 text-xs font-mono text-[#78716C]">
                              <span>{pct}% watched</span>
                              {lesson.progress?.last_watched_at && (
                                <span className="text-[10px] text-[#A6A29A] hidden sm:inline">
                                  Last: {new Date(lesson.progress.last_watched_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
