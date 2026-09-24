import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { courseService } from '../services/courseService';
import { useLearning } from '../context/LearningContext';
import { VideoPlayer } from '../components/video/VideoPlayer';

export const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const {
    getLessonProgress,
    getSavedTime,
    updateLessonProgress,
    markLessonComplete,
    isCourseEnrolled
  } = useLearning();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Check enrollment access
  const hasAccess = isCourseEnrolled(courseId);

  // Redirect to explore classes page if user does not have access
  React.useEffect(() => {
    if (!hasAccess) {
      navigate('/explore', { replace: true });
    }
  }, [hasAccess, navigate]);

  if (!hasAccess) {
    return null;
  }

  // Retrieve course and lesson
  const courseData = courseService.getLessonById(courseId, lessonId);

  // Error state for invalid course or lesson
  if (!courseData) {
    const courseExists = courseService.getCourseById(courseId);
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <AlertCircle size={32} color="var(--error)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginBottom: 8 }}>Lesson not found</h2>
        <p className="text-secondary" style={{ marginBottom: 24 }}>
          The requested practice lesson does not exist in this curriculum.
        </p>
        <button
          onClick={() => {
            if (courseExists) {
              navigate(`/course/${courseId}`);
            } else {
              navigate('/dashboard');
            }
          }}
          className="btn btn-primary"
        >
          {courseExists ? 'Back to Class' : 'Back to Studio'}
        </button>
      </div>
    );
  }

  const { course, lesson } = courseData;

  // Retrieve previous & next lessons
  const nextLesson = courseService.getNextLesson(courseId, lessonId);
  const prevLesson = courseService.getPreviousLesson(courseId, lessonId);

  // Saved progress and time
  const currentProgress = getLessonProgress(course.id, lesson.id);
  const savedTime = getSavedTime(course.id, lesson.id);
  const isCompleted = currentProgress >= 100;

  const handleProgressUpdate = (percentage, currentTime) => {
    updateLessonProgress(course.id, lesson.id, percentage, currentTime);
  };

  const handleLessonComplete = () => {
    markLessonComplete(course.id, lesson.id);
  };

  const handleManualMarkComplete = () => {
    markLessonComplete(course.id, lesson.id);
  };

  const handleNavigateLesson = (targetLessonId) => {
    navigate(`/course/${course.id}/lesson/${targetLessonId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const topEyebrow = `${course.number || '01'} / ${course.title.toUpperCase()}`;

  return (
    <div className="lesson-page-container">
      {/* Back Navigation & Course Eyebrow */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link to={`/course/${course.id}`} className="btn-back-nav" style={{ marginBottom: 0 }}>
          <ArrowLeft size={14} />
          <span>Back to {course.title}</span>
        </Link>

        <span className="editorial-eyebrow">
          Lesson {String(lesson.order).padStart(2, '0')} of {course.lessons.length}
        </span>
      </div>

      {/* Lesson Header Title */}
      <div className="lesson-header-meta">
        <span className="editorial-eyebrow" style={{ color: 'var(--text-secondary)' }}>
          {topEyebrow}
        </span>
        <h1 className="lesson-page-title">
          {lesson.title}
        </h1>
      </div>

      {/* Main Two-Column Studio Layout */}
      <div className="lesson-two-column">
        {/* Left Video Pane */}
        <div>
          {/* Simple Rectangular Video Frame */}
          <VideoPlayer
            key={lesson.id}
            videoUrl={lesson.videoUrl}
            lessonId={lesson.id}
            courseId={course.id}
            savedTime={savedTime}
            initialProgress={currentProgress}
            onProgressUpdate={handleProgressUpdate}
            onComplete={handleLessonComplete}
          />

          {/* Metadata Under Video */}
          <div className="lesson-meta-under-video">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 4 }}>
                  {lesson.title}
                </h3>
                <span className="text-secondary" style={{ fontSize: 13 }}>
                  Estimated practice length: {lesson.duration}
                </span>
              </div>

              {isCompleted ? (
                <span className="badge badge-success">
                  <span>✓ Completed</span>
                </span>
              ) : (
                <button
                  onClick={handleManualMarkComplete}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                >
                  <span>Mark Complete</span>
                </button>
              )}
            </div>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              {lesson.description}
            </p>

            {/* Understated Progress Line */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="editorial-eyebrow" style={{ fontSize: 10 }}>
                  PROGRESS · {currentProgress}%
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {isCompleted ? 'Finished' : `${currentProgress}% complete`}
                </span>
              </div>
              <div style={{ width: '100%', height: 2, backgroundColor: 'var(--border)' }}>
                <div
                  style={{
                    width: `${currentProgress}%`,
                    height: '100%',
                    backgroundColor: isCompleted ? 'var(--success)' : 'var(--primary)'
                  }}
                />
              </div>
            </div>

            {/* Previous / Next Navigation Buttons */}
            <div className="lesson-nav-buttons-row">
              <button
                onClick={() => prevLesson && handleNavigateLesson(prevLesson.id)}
                disabled={!prevLesson}
                className="btn btn-secondary"
                style={{ opacity: !prevLesson ? 0.4 : 1 }}
              >
                <ArrowLeft size={14} />
                <span>Previous Practice</span>
              </button>

              <button
                onClick={() => nextLesson && handleNavigateLesson(nextLesson.id)}
                disabled={!nextLesson}
                className="btn btn-primary"
                style={{ opacity: !nextLesson ? 0.4 : 1 }}
              >
                <span>Next Practice</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Instructor Practice Notes */}
          {lesson.notes && (
            <div className="studio-notes-card">
              <div className="studio-notes-title">
                <FileText size={13} />
                <span>Instructor Studio Notes & Technique</span>
              </div>
              <p className="studio-notes-text">
                "{lesson.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Right Light Editorial Lesson Sidebar */}
        <aside className="lesson-sidebar-box">
          <div className="lesson-sidebar-heading">
            <span>{course.title} Lessons</span>
          </div>

          <div className="lesson-sidebar-items-list">
            {course.lessons.map((item) => {
              const itemProg = getLessonProgress(course.id, item.id);
              const isCurrent = item.id === lesson.id;
              const itemCompleted = itemProg >= 100;
              const itemStarted = itemProg > 0 && itemProg < 100;

              return (
                <div
                  key={item.id}
                  onClick={() => handleNavigateLesson(item.id)}
                  className={`sidebar-lesson-entry ${isCurrent ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      {String(item.order).padStart(2, '0')} /
                    </span>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: isCurrent ? 'var(--text-main)' : 'var(--text-secondary)'
                    }}>
                      {item.title}
                    </span>
                  </div>

                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: itemCompleted ? 'var(--primary)' : itemStarted ? 'var(--text-secondary)' : 'var(--border)'
                  }}>
                    {itemCompleted ? '✓' : itemStarted ? `${itemProg}%` : '○'}
                  </span>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
