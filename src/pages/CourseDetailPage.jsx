import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Play, AlertCircle } from 'lucide-react';
import { courseService } from '../services/courseService';
import { useLearning } from '../context/LearningContext';
import { LessonListItem } from '../components/course/LessonListItem';

export const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getCourseProgress, getLessonProgress, getLastWatchedLessonId, getResumeLesson, isCourseEnrolled } = useLearning();

  const course = courseService.getCourseById(courseId);
  const hasAccess = course ? isCourseEnrolled(course.id) : true;

  // Redirect to explore classes page if user does not have access to this class
  React.useEffect(() => {
    if (course && !hasAccess) {
      navigate('/explore', { replace: true });
    }
  }, [course, hasAccess, navigate]);

  if (course && !hasAccess) {
    return null;
  }

  // Error state for invalid course ID
  if (!course) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <AlertCircle size={32} color="var(--error)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, marginBottom: 8 }}>Class not found</h2>
        <p className="text-secondary" style={{ marginBottom: 24 }}>
          The class you are looking for does not exist or may have been archived.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Back to Studio
        </button>
      </div>
    );
  }

  const overallProgress = getCourseProgress(course.id);
  const lastWatchedId = getLastWatchedLessonId(course.id);
  const resumeLesson = getResumeLesson(course.id);

  const handleLessonClick = (lessonId) => {
    navigate(`/course/${course.id}/lesson/${lessonId}`);
  };

  const handleStartOrResume = () => {
    if (resumeLesson) {
      navigate(`/course/${course.id}/lesson/${resumeLesson.id}`);
    } else if (course.lessons && course.lessons.length > 0) {
      navigate(`/course/${course.id}/lesson/${course.lessons[0].id}`);
    }
  };

  const courseNum = `${course.number || '01'} / ${course.title.toUpperCase()}`;

  return (
    <div className="course-detail-container">
      {/* Back Navigation */}
      <Link to="/courses" className="btn-back-nav">
        <ArrowLeft size={14} />
        <span>Back to My Practice</span>
      </Link>

      {/* Header Block with Artwork Beside Information */}
      <div className="course-detail-header-block">
        <div>
          <span className="editorial-eyebrow">
            {courseNum}
          </span>

          <h1 className="course-detail-title">
            {course.title}
          </h1>

          <p className="course-detail-desc">
            {course.longDescription || course.description}
          </p>

          <div style={{ display: 'flex', gap: 20, marginBottom: 28, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>Instructor: <strong style={{ color: 'var(--text-main)' }}>{course.instructor}</strong></span>
            <span>·</span>
            <span>{course.totalLessons} Lessons</span>
            <span>·</span>
            <span>{course.duration}</span>
          </div>

          {/* Understated Progress Line & Start/Resume Button */}
          <div style={{ maxWidth: 380, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="editorial-eyebrow" style={{ fontSize: 10 }}>
                PROGRESS
              </span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-main)' }}>
                {overallProgress}% complete
              </span>
            </div>
            <div style={{ width: '100%', height: 2, backgroundColor: 'var(--border)' }}>
              <div
                style={{
                  width: `${overallProgress}%`,
                  height: '100%',
                  backgroundColor: overallProgress >= 100 ? 'var(--success)' : 'var(--primary)'
                }}
              />
            </div>
          </div>

          <button
            onClick={handleStartOrResume}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: 13 }}
          >
            <span>{overallProgress > 0 ? 'Continue Practice' : 'Begin Class'}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Large Botanical / Art Image */}
        <div className="course-detail-art-frame">
          <img
            src={course.image || "/images/painting.jpg"}
            alt={course.title}
            className="course-detail-art-img"
          />
        </div>
      </div>

      {/* Numbered Editorial Lesson List Section */}
      <section style={{ marginTop: 40, marginBottom: 56 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div>
            <span className="editorial-eyebrow">CURRICULUM</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginTop: 4 }}>
              Lessons
            </h2>
          </div>
          <span className="text-secondary" style={{ fontSize: 13 }}>
            {course.lessons.length} guided practices
          </span>
        </div>

        <div className="editorial-lesson-list">
          {course.lessons.map((lesson) => {
            const lessonProg = getLessonProgress(course.id, lesson.id);
            const isCurrent = lastWatchedId === lesson.id;

            return (
              <LessonListItem
                key={lesson.id}
                lesson={lesson}
                progress={lessonProg}
                isCurrent={isCurrent}
                onClick={() => handleLessonClick(lesson.id)}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};
