import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStudentAssignedClasses } from '@/services/courseService';
import ProfileClient from '@/components/student/ProfileClient';
import { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/profile');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  const assignedClasses = await getStudentAssignedClasses(user.id);

  return (
    <ProfileClient
      initialProfile={profile as Profile}
      assignedClasses={assignedClasses}
    />
  );
}
