import { getAdminStudents, getAdminClasses } from '@/services/adminService';
import StudentsListClient from '@/components/admin/StudentsListClient';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const [students, classes] = await Promise.all([
    getAdminStudents(),
    getAdminClasses(),
  ]);

  const availableClasses = classes.map((c) => ({
    id: c.id,
    title: c.title,
  }));

  return (
    <StudentsListClient
      initialStudents={students}
      availableClasses={availableClasses}
    />
  );
}
