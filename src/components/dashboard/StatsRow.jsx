import React from 'react';
import { useLearning } from '../../context/LearningContext';

export const StatsRow = () => {
  const { stats } = useLearning();

  const formattedLessons = String(stats.lessonsCompleted).padStart(2, '0');
  const formattedClasses = String(stats.coursesEnrolled).padStart(2, '0');

  return (
    <div className="editorial-stats-row">
      <div className="editorial-stat-item">
        <span className="editorial-stat-num">{formattedClasses}</span>
        <span className="editorial-stat-label">Classes</span>
      </div>

      <div className="editorial-stat-divider" />

      <div className="editorial-stat-item">
        <span className="editorial-stat-num">{formattedLessons}</span>
        <span className="editorial-stat-label">Lessons completed</span>
      </div>

      <div className="editorial-stat-divider" />

      <div className="editorial-stat-item">
        <span className="editorial-stat-num">{stats.learningProgress}%</span>
        <span className="editorial-stat-label">Overall progress</span>
      </div>

      <div className="editorial-stat-divider" />

      <div className="editorial-stat-item">
        <span className="editorial-stat-num">{stats.hoursWatched}h</span>
        <span className="editorial-stat-label">Practice duration</span>
      </div>
    </div>
  );
};
