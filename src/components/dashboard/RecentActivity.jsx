import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';

export const RecentActivity = () => {
  const { activity, resetAllProgress } = useLearning();
  const navigate = useNavigate();

  const handleItemClick = (act) => {
    if (act.courseId && act.lessonId) {
      navigate(`/course/${act.courseId}/lesson/${act.lessonId}`);
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all studio practice and progress back to initial demo state?")) {
      resetAllProgress();
    }
  };

  return (
    <div className="bottom-practice-grid">
      {/* Recent Practice History */}
      <div className="practice-history-card">
        <div style={{ marginBottom: 16 }}>
          <span className="editorial-eyebrow">
            RECENT PRACTICE
          </span>
        </div>

        {(!activity || activity.length === 0) ? (
          <p className="text-secondary" style={{ fontSize: 13, fontStyle: 'italic', padding: '12px 0' }}>
            No recent practice recorded yet. Select a class above to begin.
          </p>
        ) : (
          <div className="practice-history-list">
            {activity.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="practice-history-item"
                onClick={() => handleItemClick(item)}
                style={{ cursor: item.lessonId ? 'pointer' : 'default' }}
                title={item.lessonId ? "Resume this practice" : undefined}
              >
                <div className="practice-item-left">
                  <span className="practice-item-icon">
                    {item.type === 'completed' ? '✓' : '▶'}
                  </span>
                  <div>
                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                      {item.type === 'completed' ? 'Completed ' : 'Continued '}
                      {item.lessonTitle}
                    </span>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {item.courseTitle}
                    </div>
                  </div>
                </div>

                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {item.timeAgoText || "Recently"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo Studio Control Card */}
      <div className="studio-demo-card">
        <div>
          <span className="editorial-eyebrow" style={{ display: 'block', marginBottom: 8 }}>
            STUDIO STORAGE
          </span>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your practice progress is saved locally in this browser. You can reset the demo state at any time.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '10px 14px', fontSize: 12, marginTop: 20 }}
          title="Reset back to starting state"
        >
          <RotateCcw size={13} />
          <span>Reset Demo Progress</span>
        </button>
      </div>
    </div>
  );
};
