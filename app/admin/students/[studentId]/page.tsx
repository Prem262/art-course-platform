import { notFound } from 'next/navigation';
import { getStudentDetail } from '@/services/adminService';
import StudentDetailClient from '@/components/admin/StudentDetailClient';

export const dynamic = 'force-dynamic';

interface StudentDetailPageProps {
  params: {
    studentId: string;
  };
}

export default async function AdminStudentDetailPage({
  params,
}: StudentDetailPageProps) {
  const data = await getStudentDetail(params.studentId);

  if (!data) {
    notFound();
  }

  return (
    <StudentDetailClient
      student={data.student}
      classes={data.classes}
    />
  );
}
