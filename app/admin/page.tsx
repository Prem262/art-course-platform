import { getAdminOverviewStats } from '@/services/adminService';
import Link from 'next/link';
import { Users, GraduationCap, Video, CheckCircle2, UserPlus, PlusCircle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const stats = await getAdminOverviewStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2D8] pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#78716C]">
            Overview
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#141413] tracking-tight mt-1">
            Platform Dashboard
          </h1>
          <p className="text-xs text-[#6E6B65] mt-1">
            Operational snapshot of registered students, active courses, and video lessons.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/students"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </Link>

          <Link
            href="/admin/classes"
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-[#FFFFFF] border border-[#E7E2D8] text-[#141413] text-xs uppercase tracking-wider font-medium rounded hover:bg-[#F3EFEA] transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Classes</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-xs uppercase tracking-wider font-medium">Students</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-medium text-[#141413]">
            {stats.totalStudents}
          </p>
          <div className="pt-2 border-t border-[#F0ECE5]">
            <Link
              href="/admin/students"
              className="text-[11px] text-[#78716C] hover:text-[#141413] flex items-center justify-between"
            >
              <span>Manage directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Classes */}
        <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-xs uppercase tracking-wider font-medium">Classes</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-medium text-[#141413]">
            {stats.totalClasses}
          </p>
          <div className="pt-2 border-t border-[#F0ECE5]">
            <Link
              href="/admin/classes"
              className="text-[11px] text-[#78716C] hover:text-[#141413] flex items-center justify-between"
            >
              <span>View curriculum</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Total Lessons */}
        <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-xs uppercase tracking-wider font-medium">Lessons</span>
            <Video className="w-4 h-4" />
          </div>
          <p className="font-serif text-3xl font-medium text-[#141413]">
            {stats.totalLessons}
          </p>
          <div className="pt-2 border-t border-[#F0ECE5]">
            <Link
              href="/admin/lessons"
              className="text-[11px] text-[#78716C] hover:text-[#141413] flex items-center justify-between"
            >
              <span>Edit video links</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Active Enrollments */}
        <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-[#78716C]">
            <span className="text-xs uppercase tracking-wider font-medium">Enrollments</span>
            <CheckCircle2 className="w-4 h-4 text-[#2A4E39]" />
          </div>
          <p className="font-serif text-3xl font-medium text-[#2A4E39]">
            {stats.activeEnrollments}
          </p>
          <div className="pt-2 border-t border-[#F0ECE5]">
            <Link
              href="/admin/progress"
              className="text-[11px] text-[#78716C] hover:text-[#141413] flex items-center justify-between"
            >
              <span>Check completion</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Enrollments Table */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-[#E7E2D8] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-medium text-[#141413]">
              Recent Student Enrollments
            </h3>
            <p className="text-xs text-[#78716C]">
              Latest class access granted by studio administrators
            </p>
          </div>

          <Link
            href="/admin/students"
            className="text-xs text-[#78716C] hover:text-[#141413] underline underline-offset-4"
          >
            All Students
          </Link>
        </div>

        {stats.recentEnrollments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#78716C]">
            No student enrollments recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-[#F0ECE5]">
            {stats.recentEnrollments.map((enr: any) => (
              <div
                key={enr.id}
                className="p-4 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-[#141413]">
                    {enr.profiles?.full_name || 'Student'}
                  </p>
                  <p className="text-xs text-[#78716C]">{enr.profiles?.email}</p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 text-xs bg-[#F3EFEA] text-[#141413] rounded font-medium">
                    {enr.classes?.title || 'Class'}
                  </span>
                  <p className="text-[10px] text-[#A6A29A] mt-0.5 font-mono">
                    {new Date(enr.assigned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
