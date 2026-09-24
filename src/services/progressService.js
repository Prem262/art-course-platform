import { mockCourses } from '../data/courses';
import { initialProgressData, initialStudentsProgress } from '../data/initialProgress';
import { mockStudents } from '../data/users';
import { authService } from './authService';
import { courseService } from './courseService';

const KEYS = {
  COURSE_PROGRESS: "courseProgress",
  ALL_STUDENTS_PROGRESS: "allStudentsProgress",
  SAVED_TIME: "savedTimeSeconds",
  LAST_WATCHED: "lastWatchedLesson",
  ACTIVITY: "recentActivity"
};

// Safe JSON parse with fallback
const safeGet = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error parsing localStorage key "${key}", using fallback:`, err);
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving localStorage key "${key}":`, err);
  }
};

// Helper to get active student ID
const getActiveStudentId = () => {
  const user = authService.getCurrentUser();
  if (user && user.role === 'student') {
    return user.id;
  }
  return "student-001";
};

export const progressService = {
  // Initialize storage if empty or corrupt
  initStorage: () => {
    if (!localStorage.getItem(KEYS.ALL_STUDENTS_PROGRESS)) {
      safeSet(KEYS.ALL_STUDENTS_PROGRESS, initialStudentsProgress);
    }
    if (!localStorage.getItem(KEYS.COURSE_PROGRESS)) {
      safeSet(KEYS.COURSE_PROGRESS, initialProgressData.courseProgress);
    }
    if (!localStorage.getItem(KEYS.SAVED_TIME)) {
      safeSet(KEYS.SAVED_TIME, initialProgressData.savedTimeSeconds);
    }
    if (!localStorage.getItem(KEYS.LAST_WATCHED)) {
      safeSet(KEYS.LAST_WATCHED, initialProgressData.lastWatchedLesson);
    }
    if (!localStorage.getItem(KEYS.ACTIVITY)) {
      safeSet(KEYS.ACTIVITY, initialProgressData.recentActivity);
    }
  },

  // Reset progress back to initial mock values
  resetProgressToDefault: () => {
    courseService.resetEnrollmentsToDefault();
    safeSet(KEYS.ALL_STUDENTS_PROGRESS, initialStudentsProgress);
    safeSet(KEYS.COURSE_PROGRESS, initialProgressData.courseProgress);
    safeSet(KEYS.SAVED_TIME, initialProgressData.savedTimeSeconds);
    safeSet(KEYS.LAST_WATCHED, initialProgressData.lastWatchedLesson);
    safeSet(KEYS.ACTIVITY, initialProgressData.recentActivity);
    return progressService.getAllProgress();
  },

  // Get progress for the currently active student
  getAllProgress: (studentId = null) => {
    progressService.initStorage();
    const targetId = studentId || getActiveStudentId();
    const allStudentsMap = safeGet(KEYS.ALL_STUDENTS_PROGRESS, initialStudentsProgress);

    if (allStudentsMap[targetId]) {
      return allStudentsMap[targetId];
    }

    // Fallback to legacy key
    return safeGet(KEYS.COURSE_PROGRESS, initialProgressData.courseProgress);
  },

  // Save progress for a student
  saveStudentProgressMap: (studentId, studentProgress) => {
    const allStudentsMap = safeGet(KEYS.ALL_STUDENTS_PROGRESS, initialStudentsProgress);
    allStudentsMap[studentId] = studentProgress;
    safeSet(KEYS.ALL_STUDENTS_PROGRESS, allStudentsMap);

    // Keep legacy key in sync if student is student-001
    if (studentId === "student-001") {
      safeSet(KEYS.COURSE_PROGRESS, studentProgress);
    }
  },

  getLessonProgress: (courseId, lessonId, studentId = null) => {
    const progress = progressService.getAllProgress(studentId);
    if (progress[courseId] && typeof progress[courseId][lessonId] === 'number') {
      return progress[courseId][lessonId];
    }
    return 0;
  },

  getSavedTime: (courseId, lessonId) => {
    const savedTimes = safeGet(KEYS.SAVED_TIME, initialProgressData.savedTimeSeconds);
    if (savedTimes[courseId] && typeof savedTimes[courseId][lessonId] === 'number') {
      return savedTimes[courseId][lessonId];
    }
    return 0;
  },

  getLastWatchedLessonId: (courseId) => {
    const lastWatched = safeGet(KEYS.LAST_WATCHED, initialProgressData.lastWatchedLesson);
    return lastWatched[courseId] || null;
  },

  // Save lesson progress during playback (throttled)
  saveLessonProgress: (courseId, lessonId, rawPercentage, currentTime) => {
    const activeStudentId = getActiveStudentId();
    const studentProgress = progressService.getAllProgress(activeStudentId);
    const savedTimes = safeGet(KEYS.SAVED_TIME, initialProgressData.savedTimeSeconds);
    const lastWatched = safeGet(KEYS.LAST_WATCHED, initialProgressData.lastWatchedLesson);

    if (!studentProgress[courseId]) {
      studentProgress[courseId] = {};
    }
    if (!savedTimes[courseId]) {
      savedTimes[courseId] = {};
    }

    const previousProgress = studentProgress[courseId][lessonId] || 0;

    // Automatic 90%+ completion rule
    let finalPercentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));
    const reachedCompletion = finalPercentage >= 90;
    if (reachedCompletion) {
      finalPercentage = 100;
    }

    const savedPercentage = Math.max(previousProgress, finalPercentage);
    studentProgress[courseId][lessonId] = savedPercentage;
    savedTimes[courseId][lessonId] = Math.round(currentTime || 0);
    lastWatched[courseId] = lessonId;

    progressService.saveStudentProgressMap(activeStudentId, studentProgress);
    safeSet(KEYS.SAVED_TIME, savedTimes);
    safeSet(KEYS.LAST_WATCHED, lastWatched);

    // Record activity if newly completed
    if (previousProgress < 100 && savedPercentage === 100) {
      progressService.recordActivity({
        type: "completed",
        courseId,
        lessonId
      });
    }

    return {
      progress: savedPercentage,
      isCompleted: savedPercentage === 100
    };
  },

  // Explicitly mark lesson as completed
  markLessonComplete: (courseId, lessonId) => {
    const activeStudentId = getActiveStudentId();
    const studentProgress = progressService.getAllProgress(activeStudentId);
    const lastWatched = safeGet(KEYS.LAST_WATCHED, initialProgressData.lastWatchedLesson);

    if (!studentProgress[courseId]) {
      studentProgress[courseId] = {};
    }

    const previousProgress = studentProgress[courseId][lessonId] || 0;
    studentProgress[courseId][lessonId] = 100;
    lastWatched[courseId] = lessonId;

    progressService.saveStudentProgressMap(activeStudentId, studentProgress);
    safeSet(KEYS.LAST_WATCHED, lastWatched);

    if (previousProgress < 100) {
      progressService.recordActivity({
        type: "completed",
        courseId,
        lessonId
      });
    }

    return 100;
  },

  // Calculate dynamic course progress percentage (average of lesson percentages)
  getCourseProgress: (courseId, studentId = null) => {
    const course = mockCourses.find(c => c.id === courseId);
    if (!course || !course.lessons || course.lessons.length === 0) return 0;

    const studentProgress = progressService.getAllProgress(studentId);
    const courseProg = studentProgress[courseId] || {};

    let totalPercentage = 0;
    course.lessons.forEach(lesson => {
      const lessonPct = courseProg[lesson.id] || 0;
      totalPercentage += lessonPct;
    });

    const average = Math.round(totalPercentage / course.lessons.length);
    return Math.min(100, Math.max(0, average));
  },

  // Determine the next incomplete lesson to resume
  getResumeLesson: (courseId, studentId = null) => {
    const course = mockCourses.find(c => c.id === courseId);
    if (!course || !course.lessons || course.lessons.length === 0) return null;

    const studentProgress = progressService.getAllProgress(studentId);
    const courseProg = studentProgress[courseId] || {};
    const lastWatchedId = progressService.getLastWatchedLessonId(courseId);

    // If last watched lesson is incomplete, prioritize it
    if (lastWatchedId) {
      const lastWatchedLesson = course.lessons.find(l => l.id === lastWatchedId);
      const lastPct = courseProg[lastWatchedId] || 0;
      if (lastWatchedLesson && lastPct < 100) {
        return lastWatchedLesson;
      }
    }

    // Otherwise find first lesson that has progress < 100
    const firstIncomplete = course.lessons.find(lesson => {
      const pct = courseProg[lesson.id] || 0;
      return pct < 100;
    });

    return firstIncomplete || course.lessons[0];
  },

  // Calculate high-level student statistics for current student
  calculateStats: (studentId = null) => {
    const studentProgress = progressService.getAllProgress(studentId);
    let totalCompletedLessons = 0;
    let totalProgressSum = 0;
    let totalWatchedSeconds = 0;

    const enrolledCourses = courseService.getEnrolledCourses(studentId);

    enrolledCourses.forEach(course => {
      const courseProg = studentProgress[course.id] || {};
      let courseSum = 0;

      course.lessons.forEach(lesson => {
        const pct = courseProg[lesson.id] || 0;
        courseSum += pct;

        if (pct >= 100) {
          totalCompletedLessons += 1;
        }

        const lessonDuration = lesson.durationSeconds || 1800;
        totalWatchedSeconds += lessonDuration * (pct / 100);
      });

      const courseAverage = course.lessons.length > 0 ? courseSum / course.lessons.length : 0;
      totalProgressSum += courseAverage;
    });

    const overallAverage = enrolledCourses.length > 0
      ? Math.round(totalProgressSum / enrolledCourses.length)
      : 0;

    const hoursWatched = (totalWatchedSeconds / 3600).toFixed(1);

    return {
      coursesEnrolled: enrolledCourses.length,
      lessonsCompleted: totalCompletedLessons,
      learningProgress: overallAverage,
      hoursWatched: Number(hoursWatched)
    };
  },

  getRecentActivity: () => {
    progressService.initStorage();
    return safeGet(KEYS.ACTIVITY, initialProgressData.recentActivity);
  },

  recordActivity: ({ type, courseId, lessonId }) => {
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) return;
    const lesson = course.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    const existingActivities = safeGet(KEYS.ACTIVITY, initialProgressData.recentActivity);

    const newActivity = {
      id: "act-" + Date.now(),
      type,
      courseId,
      courseTitle: course.title,
      lessonId,
      lessonTitle: lesson.title,
      timestamp: Date.now(),
      timeAgoText: "Just now"
    };

    const filtered = existingActivities.filter(a => !(a.lessonId === lessonId && a.type === type));
    const updated = [newActivity, ...filtered].slice(0, 8);

    safeSet(KEYS.ACTIVITY, updated);
  },

  // ==========================================
  // ADMIN MAINTENANCE METHODS
  // ==========================================

  // Returns all students with calculated metrics across all courses
  getAllStudentsWithDetails: () => {
    progressService.initStorage();
    const allStudentsMap = safeGet(KEYS.ALL_STUDENTS_PROGRESS, initialStudentsProgress);

    return mockStudents.map(student => {
      const studentProgress = allStudentsMap[student.id] || {};
      const enrolledIds = courseService.getEnrolledCourseIds(student.id);

      let totalLessonsCompleted = 0;
      let totalLessonsCurriculum = 0;
      let coursesProgressList = [];
      let totalProgressSum = 0;

      mockCourses.forEach(course => {
        const isEnrolled = enrolledIds.includes(course.id);
        const courseProg = studentProgress[course.id] || {};
        let courseSum = 0;

        course.lessons.forEach(l => {
          const pct = courseProg[l.id] || 0;
          courseSum += pct;
          if (isEnrolled) {
            totalLessonsCurriculum += 1;
            if (pct >= 100) {
              totalLessonsCompleted += 1;
            }
          }
        });

        const courseAverage = course.lessons.length > 0
          ? Math.round(courseSum / course.lessons.length)
          : 0;

        if (isEnrolled) {
          totalProgressSum += courseAverage;
        }

        coursesProgressList.push({
          courseId: course.id,
          courseTitle: course.title,
          progress: courseAverage,
          isEnrolled
        });
      });

      const enrolledCount = enrolledIds.length;
      const overallProgress = enrolledCount > 0
        ? Math.round(totalProgressSum / enrolledCount)
        : 0;

      return {
        ...student,
        enrolledCourseIds: enrolledIds,
        enrolledCoursesCount: enrolledCount,
        overallProgress,
        totalLessonsCompleted,
        totalLessonsCurriculum,
        coursesProgress: coursesProgressList
      };
    });
  },

  // Admin updates a student's specific lesson progress
  adminUpdateLessonProgress: (studentId, courseId, lessonId, percentage) => {
    progressService.initStorage();
    const allStudentsMap = safeGet(KEYS.ALL_STUDENTS_PROGRESS, initialStudentsProgress);

    if (!allStudentsMap[studentId]) {
      allStudentsMap[studentId] = {};
    }
    if (!allStudentsMap[studentId][courseId]) {
      allStudentsMap[studentId][courseId] = {};
    }

    const clamped = Math.min(100, Math.max(0, Math.round(percentage)));
    allStudentsMap[studentId][courseId][lessonId] = clamped;

    safeSet(KEYS.ALL_STUDENTS_PROGRESS, allStudentsMap);

    // Sync legacy if student-001
    if (studentId === "student-001") {
      safeSet(KEYS.COURSE_PROGRESS, allStudentsMap[studentId]);
    }

    return clamped;
  },

  // Admin marks entire course as completed (100%) for a student
  adminSetCourseComplete: (studentId, courseId) => {
    progressService.initStorage();
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) return;

    const allStudentsMap = safeGet(KEYS.ALL_STUDENTS_PROGRESS, initialStudentsProgress);
    if (!allStudentsMap[studentId]) {
      allStudentsMap[studentId] = {};
    }
    if (!allStudentsMap[studentId][courseId]) {
      allStudentsMap[studentId][courseId] = {};
    }

    course.lessons.forEach(l => {
      allStudentsMap[studentId][courseId][l.id] = 100;
    });

    safeSet(KEYS.ALL_STUDENTS_PROGRESS, allStudentsMap);

    if (studentId === "student-001") {
      safeSet(KEYS.COURSE_PROGRESS, allStudentsMap[studentId]);
    }
  },

  // Admin resets a student's progress for a specific course to 0%
  adminResetCourseProgress: (studentId, courseId) => {
    progressService.initStorage();
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) return;

    const allStudentsMap = safeGet(KEYS.ALL_STUDENTS_PROGRESS, initialStudentsProgress);
    if (!allStudentsMap[studentId]) {
      allStudentsMap[studentId] = {};
    }
    allStudentsMap[studentId][courseId] = {};

    course.lessons.forEach(l => {
      allStudentsMap[studentId][courseId][l.id] = 0;
    });

    safeSet(KEYS.ALL_STUDENTS_PROGRESS, allStudentsMap);

    if (studentId === "student-001") {
      safeSet(KEYS.COURSE_PROGRESS, allStudentsMap[studentId]);
    }
  },

  // Admin resets all courses progress for a student
  adminResetAllProgressForStudent: (studentId) => {
    progressService.initStorage();
    const allStudentsMap = safeGet(KEYS.ALL_STUDENTS_PROGRESS, initialStudentsProgress);
    allStudentsMap[studentId] = {};

    mockCourses.forEach(course => {
      allStudentsMap[studentId][course.id] = {};
      course.lessons.forEach(l => {
        allStudentsMap[studentId][course.id][l.id] = 0;
      });
    });

    safeSet(KEYS.ALL_STUDENTS_PROGRESS, allStudentsMap);

    if (studentId === "student-001") {
      safeSet(KEYS.COURSE_PROGRESS, allStudentsMap[studentId]);
    }
  },

  // Platform statistics for Admin Dashboard
  getAdminPlatformStats: () => {
    const studentsDetails = progressService.getAllStudentsWithDetails();
    const totalStudents = studentsDetails.length;

    let overallSum = 0;
    let completedCount = 0;
    let activeCount = 0;

    studentsDetails.forEach(s => {
      overallSum += s.overallProgress;
      if (s.overallProgress === 100) {
        completedCount += 1;
      }
      if (s.overallProgress > 0) {
        activeCount += 1;
      }
    });

    const averageProgress = totalStudents > 0 ? Math.round(overallSum / totalStudents) : 0;

    return {
      totalStudents,
      activeStudents: activeCount,
      completedStudents: completedCount,
      averageProgress,
      totalCourses: mockCourses.length
    };
  }
};
