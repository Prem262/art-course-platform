export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourseClass {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  cover_image_url?: string | null;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  class_id: string;
  title: string;
  description?: string | null;
  display_order: number;
  video_id?: string | null;
  video_provider: 'bunny' | 'local';
  duration_seconds: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentClass {
  id: string;
  student_id: string;
  class_id: string;
  assigned_at: string;
  assigned_by?: string | null;
  status: 'active' | 'revoked';
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  progress_percentage: number;
  watched_seconds: number;
  completed: boolean;
  last_watched_at: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// UI / Composite types
export interface ClassWithProgress extends CourseClass {
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  next_lesson?: {
    id: string;
    title: string;
    display_order: number;
    duration_seconds: number;
    progress_percentage: number;
  } | null;
}

export interface LessonWithProgress extends Lesson {
  progress?: LessonProgress | null;
}

export interface StudentDetail extends Profile {
  classes: {
    class_id: string;
    class_title: string;
    class_slug: string;
    status: 'active' | 'revoked';
    assigned_at: string;
    total_lessons: number;
    completed_lessons: number;
    progress_percentage: number;
  }[];
}
