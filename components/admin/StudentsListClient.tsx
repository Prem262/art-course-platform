'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, GraduationCap, ChevronRight, Mail, Calendar } from 'lucide-react';
import StudentFormModal from './StudentFormModal';

interface StudentsListClientProps {
  initialStudents: any[];
  availableClasses: { id: string; title: string }[];
}

export default function StudentsListClient({
  initialStudents,
  availableClasses,
}: StudentsListClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredStudents = initialStudents.filter((student) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = student.full_name?.toLowerCase().includes(term);
    const emailMatch = student.email?.toLowerCase().includes(term);
    return nameMatch || emailMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2D8] pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#78716C]">
            Directory
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#141413] tracking-tight mt-1">
            Student Management
          </h1>
          <p className="text-xs text-[#6E6B65] mt-1">
            Create student records, manage course enrollments, and inspect learning progress.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search students by name or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] placeholder-[#A6A29A] focus:outline-none focus:border-[#141413]"
        />
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#A6A29A]" />
      </div>

      {/* Students Table */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm shadow-subtle overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C] space-y-2">
            <p className="font-serif text-base text-[#141413]">No students found</p>
            <p>Try adjusting your search criteria or register a new student above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E2D8] bg-[#FAF8F5] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 sm:px-6">Student</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Classes</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE5]">
                {filteredStudents.map((student) => {
                  const activeClasses = (student.student_classes || []).filter(
                    (sc: any) => sc.status === 'active'
                  );

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-[#FAF8F5]/80 transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6 font-medium text-[#141413]">
                        {student.full_name || 'Unnamed Student'}
                      </td>
                      <td className="py-4 px-4 text-[#6E6B65]">
                        <div className="flex items-center space-x-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#A6A29A]" />
                          <span>{student.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {activeClasses.length === 0 ? (
                            <span className="text-[#A6A29A] italic text-[11px]">
                              No classes
                            </span>
                          ) : (
                            activeClasses.map((sc: any) => (
                              <span
                                key={sc.id}
                                className="inline-block px-2 py-0.5 bg-[#F3EFEA] border border-[#E7E2D8] text-[#141413] rounded text-[11px]"
                              >
                                {sc.classes?.title || 'Class'}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#78716C] font-mono text-[11px]">
                        {new Date(student.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-[#141413] hover:text-[#2A4E39]"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      <StudentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        availableClasses={availableClasses}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
