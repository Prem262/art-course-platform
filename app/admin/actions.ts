'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createStudentUser, setStudentClassAccess } from '@/services/adminService';

// Ensure user performing action is an admin
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return { supabase, user };
}

// ------------------------------------------------------------------------------
// STUDENT ACTIONS
// ------------------------------------------------------------------------------

export async function createStudentAction(data: {
  fullName: string;
  email: string;
  password?: string;
  classIds?: string[];
}) {
  await verifyAdmin();
  const result = await createStudentUser(data);
  revalidatePath('/admin/students');
  revalidatePath('/admin');
  return result;
}

export async function toggleClassAccessAction(
  studentId: string,
  classId: string,
  action: 'assign' | 'revoke'
) {
  await verifyAdmin();
  await setStudentClassAccess({ studentId, classId, action });
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath('/admin/students');
  revalidatePath('/admin/progress');
  return { success: true };
}

// ------------------------------------------------------------------------------
// CLASS ACTIONS
// ------------------------------------------------------------------------------

export async function saveClassAction(data: {
  id?: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  cover_image_url?: string;
  display_order: number;
  is_published: boolean;
}) {
  const { supabase } = await verifyAdmin();

  if (data.id) {
    // Update
    const { error } = await supabase
      .from('classes')
      .update({
        title: data.title,
        slug: data.slug,
        description: data.description,
        short_description: data.short_description,
        cover_image_url: data.cover_image_url || null,
        display_order: data.display_order,
        is_published: data.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    if (error) throw error;
  } else {
    // Insert
    const { error } = await supabase.from('classes').insert({
      title: data.title,
      slug: data.slug,
      description: data.description,
      short_description: data.short_description,
      cover_image_url: data.cover_image_url || null,
      display_order: data.display_order,
      is_published: data.is_published,
    });

    if (error) throw error;
  }

  revalidatePath('/admin/classes');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteClassAction(classId: string) {
  const { supabase } = await verifyAdmin();

  const { error } = await supabase.from('classes').delete().eq('id', classId);
  if (error) throw error;

  revalidatePath('/admin/classes');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function togglePublishClassAction(classId: string, isPublished: boolean) {
  const { supabase } = await verifyAdmin();

  const { error } = await supabase
    .from('classes')
    .update({ is_published: isPublished })
    .eq('id', classId);

  if (error) throw error;

  revalidatePath('/admin/classes');
  revalidatePath('/dashboard');
  return { success: true };
}

// ------------------------------------------------------------------------------
// LESSON ACTIONS
// ------------------------------------------------------------------------------

export async function saveLessonAction(data: {
  id?: string;
  class_id: string;
  title: string;
  description?: string;
  display_order: number;
  video_id?: string;
  video_provider?: string;
  duration_seconds: number;
  is_published: boolean;
}) {
  const { supabase } = await verifyAdmin();

  if (data.id) {
    const { error } = await supabase
      .from('lessons')
      .update({
        class_id: data.class_id,
        title: data.title,
        description: data.description || null,
        display_order: data.display_order,
        video_id: data.video_id || null,
        video_provider: data.video_provider || 'bunny',
        duration_seconds: data.duration_seconds,
        is_published: data.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    if (error) throw error;
  } else {
    const { error } = await supabase.from('lessons').insert({
      class_id: data.class_id,
      title: data.title,
      description: data.description || null,
      display_order: data.display_order,
      video_id: data.video_id || null,
      video_provider: data.video_provider || 'bunny',
      duration_seconds: data.duration_seconds,
      is_published: data.is_published,
    });

    if (error) throw error;
  }

  revalidatePath('/admin/lessons');
  revalidatePath('/admin/classes');
  revalidatePath('/classes');
  return { success: true };
}

export async function deleteLessonAction(lessonId: string) {
  const { supabase } = await verifyAdmin();

  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) throw error;

  revalidatePath('/admin/lessons');
  revalidatePath('/classes');
  return { success: true };
}

export async function togglePublishLessonAction(lessonId: string, isPublished: boolean) {
  const { supabase } = await verifyAdmin();

  const { error } = await supabase
    .from('lessons')
    .update({ is_published: isPublished })
    .eq('id', lessonId);

  if (error) throw error;

  revalidatePath('/admin/lessons');
  return { success: true };
}
