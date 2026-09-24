import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearning } from '../../context/LearningContext';

export const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { getCourseProgress, isCourseEnrolled } = useLearning();

  const hasAccess = isCourseEnrolled(course.id);
  const currentProgress = hasAccess ? getCourseProgress(course.id) : 0;

  const handleCardClick = () => {
    if (hasAccess) {
      // If user has access, redirect to the course page first
      navigate(`/course/${course.id}`);
    } else {
      // If user does not have access, redirect to explore lessons page
      navigate('/explore');
    }
  };

  const formattedNumber = `${course.number || '01'} /`;

  return (
    <div
      className="class-editorial-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`${course.title} — ${hasAccess ? 'Open Class Page' : 'Explore and Enroll'}`}
    >
      {/* Number Column */}
      <div className="card-num-col">
        <span>{formattedNumber}</span>
      </div>

      {/* Title & Description Column */}
      <div className="card-content-col">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h3>{course.title}</h3>
          {!hasAccess && (
            <span
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                padding: '2px 8px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--surface-alt)'
              }}
            >
              Available to Enroll
            </span>
          )}
        </div>
        <p>{course.description}</p>
      </div>

      {/* Mode & Access/Progress Column */}
      <div className="card-meta-col">
        <span className="card-meta-mode">
          {course.mode || "Online · Offline"}
        </span>

        {hasAccess ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)' }}>
                Progress
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 500 }}>
                {currentProgress}%
              </span>
            </div>
            <div style={{ width: '100%', height: 2, backgroundColor: 'var(--border)', position: 'relative' }}>
              <div
                style={{
                  width: `${currentProgress}%`,
                  height: '100%',
                  backgroundColor: currentProgress >= 100 ? 'var(--success)' : 'var(--primary)'
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              Tuition: <strong style={{ color: 'var(--text-main)' }}>{course.priceFormatted}</strong>
            </span>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {course.totalLessons} guided practices
            </div>
          </div>
        )}
      </div>

      {/* Action Column */}
      <div className="card-action-col">
        <button
          onClick={handleCardClick}
          className={`btn ${hasAccess ? 'btn-secondary' : 'btn-primary'}`}
          style={{ padding: '8px 16px', fontSize: 12 }}
        >
          <span>{hasAccess ? 'Open Class' : 'Explore Class'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
