import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CourseClass, Lesson, Profile } from '@/types/database';

export async function getAdminOverviewStats() {
  const supabase = await createClient();

  const [
    { count: studentsCount },
    { count: classesCount },
    { count: lessonsCount },
    { count: activeEnrollmentsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase.from('student_classes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ]);

  // Recent activity / enrollments
  const { data: recentEnrollments } = await supabase
    .from('student_classes')
    .select(`
      id,
      assigned_at,
      status,
      profiles:student_id (id, full_name, email),
      classes:class_id (id, title, slug)
    `)
    .order('assigned_at', { ascending: false })
    .limit(5);

  return {
    totalStudents: studentsCount || 0,
    totalClasses: classesCount || 0,
    totalLessons: lessonsCount || 0,
    activeEnrollments: activeEnrollmentsCount || 0,
    recentEnrollments: recentEnrollments || [],
  };
}

export async function getAdminStudents(searchQuery?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      created_at,
      student_classes (
        id,
        class_id,
        status,
        classes:class_id (id, title, slug)
      )
    `)
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  if (searchQuery && searchQuery.trim() !== '') {
    const term = `%${searchQuery.trim()}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term}`);
  }

  const { data: students, error } = await query;
  if (error) {
    console.error('Error fetching admin students:', error);
    return [];
  }

  return students || [];
}

export async function getStudentDetail(studentId: string) {
  const supabase = await createClient();

  // 1. Fetch profile
  const { data: student, error: studentError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', studentId)
    .single();

  if (studentError || !student) {
    return null;
  }

  // 2. Fetch all classes
  const { data: allClasses } = await supabase
    .from('classes')
    .select('id, title, slug, is_published, display_order')
    .order('display_order', { ascending: true });

  // 3. Fetch student's assigned classes
  const { data: studentClasses } = await supabase
    .from('student_classes')
    .select('class_id, status, assigned_at')
    .eq('student_id', studentId);

  const enrollmentMap = new Map<string, { status: string; assigned_at: string }>();
  (studentClasses || []).forEach((sc) => {
    enrollmentMap.set(sc.class_id, { status: sc.status, assigned_at: sc.assigned_at });
  });

  // 4. Fetch all lessons and student's progress
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, class_id, title, display_order, duration_seconds, is_published')
    .order('display_order', { ascending: true });

  const { data: progressList } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed, progress_percentage, watched_seconds, last_watched_at')
    .eq('student_id', studentId);

  const progressMap = new Map<string, any>();
  (progressList || []).forEach((p) => progressMap.set(p.lesson_id, p));

  // Build composite class & lesson progress breakdown
  const classesBreakdown = (allClasses || []).map((cls) => {
    const enrollment = enrollmentMap.get(cls.id);
    const classLessons = (allLessons || []).filter((l) => l.class_id === cls.id);
    const totalLessons = classLessons.length;

    let completedLessons = 0;
    const lessonsDetail = classLessons.map((l) => {
      const prog = progressMap.get(l.id);
      const isCompleted = prog?.completed || false;
      if (isCompleted) completedLessons++;
      return {
        ...l,
        progress: prog || null,
      };
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      class_id: cls.id,
      title: cls.title,
      slug: cls.slug,
      is_published: cls.is_published,
      is_assigned: enrollment?.status === 'active',
      enrollment_status: enrollment?.status || 'none',
      assigned_at: enrollment?.assigned_at || null,
      total_lessons: totalLessons,
      completed_lessons: completedLessons,
      progress_percentage: progressPercentage,
      lessons: lessonsDetail,
    };
  });

  return {
    student,
    classes: classesBreakdown,
  };
}

export async function createStudentUser(params: {
  fullName: string;
  email: string;
  password?: string;
  classIds?: string[];
}) {
  const adminClient = createAdminClient();

  const generatedPassword = params.password || Math.random().toString(36).slice(-10) + 'A1!';

  // 1. Create auth user with Supabase Admin API
  const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
    email: params.email,
    password: generatedPassword,
    email_confirm: true,
    user_metadata: {
      full_name: params.fullName,
      role: 'student',
    },
  });

  if (createError || !userData?.user) {
    throw new Error(createError?.message || 'Failed to create student in Supabase Auth');
  }

  const userId = userData.user.id;

  // Profile is created automatically by the database trigger on auth.users!
  // But we make sure it's present
  await adminClient.from('profiles').upsert({
    id: userId,
    full_name: params.fullName,
    email: params.email,
    role: 'student',
  });

  // 2. Assign initial classes if specified
  if (params.classIds && params.classIds.length > 0) {
    const enrollments = params.classIds.map((classId) => ({
      student_id: userId,
      class_id: classId,
      status: 'active',
    }));

    await adminClient.from('student_classes').insert(enrollments);
  }

  return {
    id: userId,
    email: params.email,
    fullName: params.fullName,
    temporaryPassword: generatedPassword,
  };
}

export async function setStudentClassAccess(params: {
  studentId: string;
  classId: string;
  action: 'assign' | 'revoke';
}) {
  const supabase = await createClient();

  if (params.action === 'assign') {
    const { error } = await supabase.from('student_classes').upsert(
      {
        student_id: params.studentId,
        class_id: params.classId,
        status: 'active',
        assigned_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,class_id' }
    );
    if (error) throw error;
  } else {
    // Revoke
    const { error } = await supabase
      .from('student_classes')
      .update({ status: 'revoked' })
      .eq('student_id', params.studentId)
      .eq('class_id', params.classId);
    if (error) throw error;
  }

  return { success: true };
}

export async function getAdminClasses() {
  const supabase = await createClient();

  const { data: classes, error } = await supabase
    .from('classes')
    .select(`
      *,
      lessons:lessons (count)
    `)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching admin classes:', error);
    return [];
  }

  return (classes || []).map((c: any) => ({
    ...c,
    lessons_count: c.lessons?.[0]?.count || 0,
  }));
}

export async function getAdminClassLessons(classId: string) {
  const supabase = await createClient();

  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('class_id', classId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching class lessons:', error);
    return [];
  }

  return lessons || [];
}
