import { createClient } from '@/lib/supabase/server';
import { getAdminClasses } from '@/services/adminService';
import LessonsListClient from '@/components/admin/LessonsListClient';

export const dynamic = 'force-dynamic';

interface AdminLessonsPageProps {
  searchParams: {
    classId?: string;
  };
}

import { Suspense } from 'react';

export default async function AdminLessonsPage({ searchParams }: AdminLessonsPageProps) {
  const supabase = await createClient();

  const [classes, { data: allLessons }] = await Promise.all([
    getAdminClasses(),
    supabase.from('lessons').select('*').order('display_order', { ascending: true }),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#78716C]">Loading lessons...</div>}>
      <LessonsListClient
        initialClasses={classes}
        allLessons={allLessons || []}
        defaultClassId={searchParams.classId}
      />
    </Suspense>
  );
}
