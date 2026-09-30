import { createClient } from '@/lib/supabase/server';
import ProgressOverviewClient from '@/components/admin/ProgressOverviewClient';

export const dynamic = 'force-dynamic';

export default async function AdminProgressPage() {
  const supabase = await createClient();

  // Fetch all students
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('role', 'student')
    .order('full_name', { ascending: true });

  // Fetch all classes
  const { data: classes } = await supabase
    .from('classes')
    .select('id, title, slug')
    .order('display_order', { ascending: true });

  // Fetch all lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, class_id');

  // Fetch all enrollments
  const { data: enrollments } = await supabase
    .from('student_classes')
    .select('student_id, class_id, status')
    .eq('status', 'active');

  // Fetch all progress records
  const { data: allProgress } = await supabase
    .from('lesson_progress')
    .select('student_id, lesson_id, completed, progress_percentage');

  const progressByStudentLesson = new Map<string, any>();
  (allProgress || []).forEach((p) => {
    progressByStudentLesson.set(`${p.student_id}_${p.lesson_id}`, p);
  });

  const studentsProgressData = (students || []).map((student) => {
    const studentActiveClasses = (enrollments || [])
      .filter((e) => e.student_id === student.id)
      .map((e) => {
        const cls = (classes || []).find((c) => c.id === e.class_id);
        const classLessons = (lessons || []).filter((l) => l.class_id === e.class_id);
        const total = classLessons.length;

        let completed = 0;
        classLessons.forEach((l) => {
          const prog = progressByStudentLesson.get(`${student.id}_${l.id}`);
          if (prog?.completed) completed++;
        });

        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          class_id: e.class_id,
          class_title: cls?.title || 'Unknown Class',
          total_lessons: total,
          completed_lessons: completed,
          progress_percentage: pct,
        };
      });

    return {
      student,
      enrollments: studentActiveClasses,
    };
  });

  return <ProgressOverviewClient studentsProgressData={studentsProgressData} />;
}
