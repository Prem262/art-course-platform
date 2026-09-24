import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { progressService } from '../services/progressService';
import { courseService } from '../services/courseService';
import { useAuth } from './AuthContext';

const LearningContext = createContext(null);

export const LearningProvider = ({ children }) => {
  const { user } = useAuth();

  const getActiveId = useCallback(() => {
    return user?.role === 'student' ? user.id : 'student-001';
  }, [user?.id, user?.role]);

  const [progressState, setProgressState] = useState(() => progressService.getAllProgress(getActiveId()));
  const [stats, setStats] = useState(() => progressService.calculateStats(getActiveId()));
  const [activity, setActivity] = useState(() => progressService.getRecentActivity());
  const [adminStudentsList, setAdminStudentsList] = useState(() => progressService.getAllStudentsWithDetails());
  const [adminPlatformStats, setAdminPlatformStats] = useState(() => progressService.getAdminPlatformStats());
  const [enrolledCourses, setEnrolledCourses] = useState(() => courseService.getEnrolledCourses(getActiveId()));

  // Refresh reactive state across both student and admin views
  const refreshState = useCallback(() => {
    const activeStudentId = getActiveId();
    setProgressState(progressService.getAllProgress(activeStudentId));
    setStats(progressService.calculateStats(activeStudentId));
    setActivity(progressService.getRecentActivity());
    setAdminStudentsList(progressService.getAllStudentsWithDetails());
    setAdminPlatformStats(progressService.getAdminPlatformStats());
    setEnrolledCourses(courseService.getEnrolledCourses(activeStudentId));
  }, [getActiveId]);

  // Re-sync whenever logged in user changes
  useEffect(() => {
    refreshState();
  }, [user?.id, user?.role, refreshState]);

  const buyCourse = useCallback((courseId, studentId = null) => {
    const targetId = studentId || getActiveId();
    const updated = courseService.enrollCourse(courseId, targetId);
    refreshState();
    return updated;
  }, [getActiveId, refreshState]);

  // Admin feature: remove course access from a user
  const removeCourseAccess = useCallback((courseId, studentId) => {
    const updated = courseService.unenrollCourse(courseId, studentId);
    refreshState();
    return updated;
  }, [refreshState]);

  // Admin feature: grant course access to a user
  const grantCourseAccess = useCallback((courseId, studentId) => {
    const updated = courseService.enrollCourse(courseId, studentId);
    refreshState();
    return updated;
  }, [refreshState]);

  const isCourseEnrolled = useCallback((courseId, studentId = null) => {
    const targetId = studentId || getActiveId();
    return courseService.isCourseEnrolled(courseId, targetId);
  }, [getActiveId]);

  const updateLessonProgress = useCallback((courseId, lessonId, percentage, currentTime) => {
    const result = progressService.saveLessonProgress(courseId, lessonId, percentage, currentTime);
    refreshState();
    return result;
  }, [refreshState]);

  const markLessonComplete = useCallback((courseId, lessonId) => {
    const result = progressService.markLessonComplete(courseId, lessonId);
    refreshState();
    return result;
  }, [refreshState]);

  const resetAllProgress = useCallback(() => {
    progressService.resetProgressToDefault();
    refreshState();
  }, [refreshState]);

  const getCourseProgress = useCallback((courseId, studentId = null) => {
    return progressService.getCourseProgress(courseId, studentId || getActiveId());
  }, [getActiveId]);

  const getLessonProgress = useCallback((courseId, lessonId, studentId = null) => {
    return progressService.getLessonProgress(courseId, lessonId, studentId || getActiveId());
  }, [getActiveId]);

  const getSavedTime = useCallback((courseId, lessonId) => {
    return progressService.getSavedTime(courseId, lessonId);
  }, []);

  const getResumeLesson = useCallback((courseId, studentId = null) => {
    return progressService.getResumeLesson(courseId, studentId || getActiveId());
  }, [getActiveId]);

  const getLastWatchedLessonId = useCallback((courseId) => {
    return progressService.getLastWatchedLessonId(courseId);
  }, []);

  // Admin maintenance methods
  const adminUpdateLesson = useCallback((studentId, courseId, lessonId, percentage) => {
    const result = progressService.adminUpdateLessonProgress(studentId, courseId, lessonId, percentage);
    refreshState();
    return result;
  }, [refreshState]);

  const adminCompleteCourse = useCallback((studentId, courseId) => {
    progressService.adminSetCourseComplete(studentId, courseId);
    refreshState();
  }, [refreshState]);

  const adminResetCourse = useCallback((studentId, courseId) => {
    progressService.adminResetCourseProgress(studentId, courseId);
    refreshState();
  }, [refreshState]);

  const adminResetStudent = useCallback((studentId) => {
    progressService.adminResetAllProgressForStudent(studentId);
    refreshState();
  }, [refreshState]);

  return (
    <LearningContext.Provider
      value={{
        progressState,
        stats,
        activity,
        adminStudentsList,
        adminPlatformStats,
        enrolledCourses,
        allCatalogCourses: courseService.getAllCatalogCourses(),
        isCourseEnrolled,
        buyCourse,
        removeCourseAccess,
        grantCourseAccess,
        updateLessonProgress,
        markLessonComplete,
        resetAllProgress,
        getCourseProgress,
        getLessonProgress,
        getSavedTime,
        getResumeLesson,
        getLastWatchedLessonId,
        adminUpdateLesson,
        adminCompleteCourse,
        adminResetCourse,
        adminResetStudent,
        refreshState
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used within a LearningProvider");
  }
  return context;
};
