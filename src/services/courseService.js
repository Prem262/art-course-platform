import { mockCourses } from '../data/courses';
import { authService } from './authService';

const ENROLLMENT_STORAGE_KEY = "enrolledCourses";

export const DEFAULT_ENROLLMENTS = {
  "student-001": ["course-1", "course-2"],
  "student-002": ["course-1", "course-2", "course-3"],
  "student-003": ["course-1"],
  "student-004": ["course-1", "course-2", "course-3", "course-4"],
  "admin-001": ["course-1", "course-2", "course-3", "course-4"]
};

const getEnrollmentsMap = () => {
  try {
    const stored = localStorage.getItem(ENROLLMENT_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(DEFAULT_ENROLLMENTS));
      return { ...DEFAULT_ENROLLMENTS };
    }
    const parsed = JSON.parse(stored);
    return parsed;
  } catch (e) {
    console.error("Error reading enrollments from localStorage", e);
    return { ...DEFAULT_ENROLLMENTS };
  }
};

const saveEnrollmentsMap = (map) => {
  try {
    localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Error saving enrollments to localStorage", e);
  }
};

export const courseService = {
  // Reset all enrollments back to standard demo defaults
  resetEnrollmentsToDefault: () => {
    saveEnrollmentsMap(DEFAULT_ENROLLMENTS);
    return { ...DEFAULT_ENROLLMENTS };
  },

  // Returns all courses in platform catalog (for buying/exploring)
  getAllCatalogCourses: () => {
    return mockCourses;
  },

  // Returns all courses (legacy alias)
  getCourses: (studentId = null) => {
    return courseService.getEnrolledCourses(studentId);
  },

  // Returns the array of enrolled course IDs for a student
  getEnrolledCourseIds: (studentId = null) => {
    const targetId = studentId || authService.getCurrentUser()?.id || "student-001";
    const map = getEnrollmentsMap();

    // Default to course-1 and course-2 for student-001 if undefined
    if (!map[targetId]) {
      return targetId === "student-001" ? ["course-1", "course-2"] : ["course-1"];
    }

    return map[targetId];
  },

  // Returns only the courses enrolled (owned) by the specified student
  getEnrolledCourses: (studentId = null) => {
    const enrolledIds = courseService.getEnrolledCourseIds(studentId);
    return mockCourses.filter(c => enrolledIds.includes(c.id));
  },

  // Check if a course is owned/enrolled
  isCourseEnrolled: (courseId, studentId = null) => {
    const enrolledIds = courseService.getEnrolledCourseIds(studentId);
    return enrolledIds.includes(courseId);
  },

  // Purchases / enrolls in a course for a student
  enrollCourse: (courseId, studentId = null) => {
    const targetId = studentId || authService.getCurrentUser()?.id || "student-001";
    const map = getEnrollmentsMap();
    if (!map[targetId]) {
      map[targetId] = ["course-1", "course-2"];
    }

    if (!map[targetId].includes(courseId)) {
      map[targetId].push(courseId);
      saveEnrollmentsMap(map);
    }

    return map[targetId];
  },

  // Admin feature: Removes course access (unenrolls) from a student
  unenrollCourse: (courseId, studentId = null) => {
    const targetId = studentId || authService.getCurrentUser()?.id || "student-001";
    const map = getEnrollmentsMap();
    if (!map[targetId]) {
      map[targetId] = [];
    }

    map[targetId] = map[targetId].filter(id => id !== courseId);
    saveEnrollmentsMap(map);

    return map[targetId];
  },

  getCourseById: (courseId) => {
    if (!courseId) return null;
    return mockCourses.find(c => c.id === courseId) || null;
  },

  getLessonById: (courseId, lessonId) => {
    const course = courseService.getCourseById(courseId);
    if (!course || !course.lessons) return null;
    const lesson = course.lessons.find(l => l.id === lessonId);
    return lesson ? { course, lesson } : null;
  },

  getNextLesson: (courseId, currentLessonId) => {
    const course = courseService.getCourseById(courseId);
    if (!course || !course.lessons) return null;
    const currentIndex = course.lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex === -1 || currentIndex === course.lessons.length - 1) {
      return null;
    }
    return course.lessons[currentIndex + 1];
  },

  getPreviousLesson: (courseId, currentLessonId) => {
    const course = courseService.getCourseById(courseId);
    if (!course || !course.lessons) return null;
    const currentIndex = course.lessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex <= 0) {
      return null;
    }
    return course.lessons[currentIndex - 1];
  }
};
