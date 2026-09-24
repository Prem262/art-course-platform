import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../context/LearningContext';
import { courseService } from '../services/courseService';
import { StatsRow } from '../components/dashboard/StatsRow';
import { CourseCard } from '../components/dashboard/CourseCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';

export const DashboardPage = () => {
  const { student, isAdmin } = useAuth();
  const { getCourseProgress, getResumeLesson, getSavedTime, enrolledCourses, isCourseEnrolled } = useLearning();
  const navigate = useNavigate();

  // All catalog courses to present the 4 studio disciplines
  const allCourses = courseService.getAllCatalogCourses();
  const enrolledList = enrolledCourses || courseService.getCourses();

  // Primary active course ONLY from enrolled courses
  const primaryCourse = enrolledList && enrolledList.length > 0 ? enrolledList[0] : null;
  const resumeLesson = primaryCourse ? getResumeLesson(primaryCourse.id) : null;
  const primaryProgress = primaryCourse ? getCourseProgress(primaryCourse.id) : 0;
  const savedSeconds = (primaryCourse && resumeLesson) ? getSavedTime(primaryCourse.id, resumeLesson.id) : 0;

  const formatResumeTime = (sec) => {
    if (!sec) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Redirect to my course page first for continuing practice
  const handleOpenPrimaryCourse = () => {
    if (primaryCourse && isCourseEnrolled(primaryCourse.id)) {
      navigate(`/course/${primaryCourse.id}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div>
      {/* Editorial Hero with Asymmetrical Botanical Composition */}
      <section className="editorial-hero-container">
        <div className="editorial-hero-grid">
          {/* Left Asymmetrical Botanical Artwork Frame */}
          <div className="hero-art-scatter-left">
            <div className="art-floating-frame">
              <img
                src="/images/hero-flower-1.jpg"
                alt="Botanical Flower Study"
                className="art-img-hero-1"
              />
            </div>
            <div className="art-floating-frame">
              <img
                src="/images/hero-leaf.jpg"
                alt="Foliage Observation"
                className="art-img-hero-2"
              />
            </div>
          </div>

          {/* Central Editorial Copy */}
          <div className="hero-center-copy">
            <span className="editorial-eyebrow">
              CLASSES · LEARN & CREATE
            </span>

            <h1 className="hero-main-title">
              Your practice,<br />
              your pace.
            </h1>

            <p className="hero-supporting-text">
              Explore painting, botanical art, zentangle and line arts through guided creative practice.
            </p>

            {/* Direct navigation to My Practice and Explore Classes */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/courses" className="btn btn-secondary">
                <span>My Practice</span>
              </Link>

              <Link to="/explore" className="btn btn-primary">
                <span>Explore Classes</span>
              </Link>

              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary" style={{ backgroundColor: 'var(--surface-alt)' }}>
                  <span>Student Manager</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Asymmetrical Botanical Artwork Frame */}
          <div className="hero-art-scatter-right">
            <div className="art-floating-frame">
              <img
                src="/images/hero-painting.jpg"
                alt="Watercolor Study"
                className="art-img-hero-3"
              />
            </div>
            <div className="art-floating-frame">
              <img
                src="/images/hero-flower-2.jpg"
                alt="Pressed Botanical Flora"
                className="art-img-hero-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Editorial Statistics */}
      <StatsRow />

      {/* CONTINUE PRACTICE Highlight Block (Redirects to course page first) */}
      {primaryCourse && (
        <section className="continue-practice-block" onClick={handleOpenPrimaryCourse} style={{ cursor: 'pointer' }}>
          <div className="continue-practice-info">
            <span className="editorial-eyebrow" style={{ marginBottom: 4 }}>
              CONTINUE PRACTICE
            </span>

            <h2 className="continue-practice-title">
              {primaryCourse.title}
            </h2>

            <p className="continue-practice-subtitle">
              {resumeLesson ? `Next Lesson: ${resumeLesson.title}` : 'Ready to resume practice'}
              {savedSeconds > 0 && ` · Paused at ${formatResumeTime(savedSeconds)}`}
            </p>

            {/* Understated Progress Line */}
            <div style={{ maxWidth: 360, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="editorial-eyebrow" style={{ fontSize: 10 }}>
                  PROGRESS
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-main)' }}>
                  {primaryProgress}%
                </span>
              </div>
              <div style={{ width: '100%', height: 2, backgroundColor: 'var(--border)' }}>
                <div
                  style={{
                    width: `${primaryProgress}%`,
                    height: '100%',
                    backgroundColor: primaryProgress >= 100 ? 'var(--success)' : 'var(--primary)'
                  }}
                />
              </div>
            </div>

            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenPrimaryCourse();
                }}
                className="btn btn-primary"
                style={{ padding: '12px 26px', fontSize: 13 }}
              >
                <span>Open Class Page</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="continue-practice-image-wrap">
            <img
              src={primaryCourse.image || "/images/painting.jpg"}
              alt={primaryCourse.title}
              className="continue-practice-image"
            />
          </div>
        </section>
      )}

      {/* Stacked Outlined Classes Listing */}
      <section style={{ marginBottom: 48 }}>
        <div className="classes-section-header">
          <div>
            <span className="editorial-eyebrow">STUDIO CURRICULUM</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, marginTop: 4 }}>
              Studio Classes
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Link
              to="/courses"
              className="btn btn-ghost"
              style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}
            >
              <span>My Practice ({enrolledList.length})</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/explore"
              className="btn btn-ghost"
              style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}
            >
              <span>Explore Classes</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="classes-stacked-list">
          {allCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Chronological Recent Practice & Studio Controls */}
      <RecentActivity />
    </div>
  );
};
