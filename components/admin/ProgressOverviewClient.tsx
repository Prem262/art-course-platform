'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, CheckCircle2, User, BookOpen } from 'lucide-react';

interface ProgressOverviewClientProps {
  studentsProgressData: any[];
}

export default function ProgressOverviewClient({
  studentsProgressData,
}: ProgressOverviewClientProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = studentsProgressData.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.student.full_name?.toLowerCase().includes(term) ||
      item.student.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2D8] pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#78716C]">
            Monitoring
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#141413] tracking-tight mt-1">
            Student Progress Matrix
          </h1>
          <p className="text-xs text-[#6E6B65] mt-1">
            Track student lesson completions and progress percentages across all enrolled classes.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter students by name or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] placeholder-[#A6A29A] focus:outline-none focus:border-[#141413]"
        />
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#A6A29A]" />
      </div>

      {/* Progress Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C] bg-white border border-[#E7E2D8] rounded-sm">
            No students found matching your search.
          </div>
        ) : (
          filtered.map(({ student, enrollments }) => (
            <div
              key={student.id}
              className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-5 sm:p-6 shadow-subtle space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0ECE5] pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[#F3EFEA] border border-[#E7E2D8] flex items-center justify-center text-[#141413] font-serif font-bold text-sm">
                    {student.full_name?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#141413]">
                      {student.full_name}
                    </h3>
                    <p className="text-xs text-[#78716C]">{student.email}</p>
                  </div>
                </div>

                <Link
                  href={`/admin/students/${student.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-[#141413] hover:text-[#2A4E39]"
                >
                  <span>Inspect Account</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <p className="text-xs text-[#A6A29A] italic">
                  No active class enrollments for this student.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {enrollments.map((enr: any) => (
                    <div
                      key={enr.class_id}
                      className="p-3.5 bg-[#FAF8F5] border border-[#E7E2D8] rounded space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-medium text-sm text-[#141413] truncate">
                          {enr.class_title}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#141413]">
                          {enr.progress_percentage}%
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-[#E7E2D8] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            enr.progress_percentage === 100
                              ? 'bg-[#2A4E39]'
                              : 'bg-[#141413]'
                          }`}
                          style={{ width: `${enr.progress_percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                        <span>{enr.completed_lessons} of {enr.total_lessons} done</span>
                        {enr.progress_percentage === 100 && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2A4E39]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
