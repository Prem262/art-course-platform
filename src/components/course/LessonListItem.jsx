import React from 'react';

export const LessonListItem = ({
  lesson,
  progress = 0,
  isCurrent = false,
  onClick
}) => {
  const isCompleted = progress >= 100;
  const isStarted = progress > 0 && progress < 100;
  const orderFormatted = String(lesson.order).padStart(2, '0');

  return (
    <div
      className={`editorial-lesson-row ${isCurrent ? 'current' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Lesson ${lesson.order}: ${lesson.title}`}
    >
      <div className="editorial-lesson-left">
        <span className="lesson-row-number">{orderFormatted} /</span>
        <span className="lesson-row-title">{lesson.title}</span>
      </div>

      <div className="editorial-lesson-right">
        {isStarted && (
          <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            {progress}%
          </span>
        )}

        <span className="text-secondary" style={{ fontSize: 12 }}>
          {lesson.duration}
        </span>

        <span
          className={`lesson-status-symbol ${
            isCompleted ? 'completed' : isStarted ? 'in-progress' : 'unstarted'
          }`}
        >
          {isCompleted ? '✓' : isStarted ? '●' : '○'}
        </span>
      </div>
    </div>
  );
};
