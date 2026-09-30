import { getAdminClasses } from '@/services/adminService';
import ClassesListClient from '@/components/admin/ClassesListClient';

export const dynamic = 'force-dynamic';

export default async function AdminClassesPage() {
  const classes = await getAdminClasses();

  return <ClassesListClient initialClasses={classes} />;
}
