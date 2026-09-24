import React from 'react';

export const ProgressBar = ({
  progress = 0,
  showLabel = true,
  label = "Progress",
  size = "md",
  color = "primary"
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const isComplete = clampedProgress === 100;
  const trackClass = size === "sm" ? "progress-track-sm" : "";
  const fillClass = (color === "success" || isComplete) ? "progress-fill-success" : "";

  return (
    <div className="progress-container">
      {showLabel && (
        <div className="progress-header">
          <span className="progress-label">{label}</span>
          <span className="progress-percentage">{clampedProgress}%</span>
        </div>
      )}
      <div className={`progress-track ${trackClass}`}>
        <div
          className={`progress-fill ${fillClass}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};
