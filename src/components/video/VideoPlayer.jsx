import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const formatTime = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const VideoPlayer = ({
  videoUrl,
  lessonId,
  courseId,
  savedTime = 0,
  initialProgress = 0,
  onProgressUpdate,
  onComplete
}) => {
  const videoRef = useRef(null);
  const lastSavedTimeRef = useRef(0);
  const hasSeekedToSavedTimeRef = useRef(false);

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [resumedAtTime, setResumedAtTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(initialProgress >= 100);
  const [currentPlaybackPct, setCurrentPlaybackPct] = useState(initialProgress);

  // Reset state when lesson changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage("");
    setShowResumeBanner(false);
    hasSeekedToSavedTimeRef.current = false;
    lastSavedTimeRef.current = 0;
    setIsCompleted(initialProgress >= 100);
    setCurrentPlaybackPct(initialProgress);
  }, [lessonId, initialProgress]);

  // Handle video metadata loaded (duration available)
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if we have saved progress to resume from
    if (!hasSeekedToSavedTimeRef.current && savedTime > 2) {
      // Don't seek past the duration of the video
      const targetTime = savedTime >= video.duration ? 0 : savedTime;
      if (targetTime > 0) {
        try {
          video.currentTime = targetTime;
          hasSeekedToSavedTimeRef.current = true;
          setResumedAtTime(targetTime);
          setShowResumeBanner(true);
        } catch (e) {
          console.warn("Could not set currentTime on video", e);
        }
      }
    }
  }, [savedTime]);

  // Throttled time update during playback (every 2.5 seconds)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration || isNaN(video.duration)) return;

    const currentTime = video.currentTime;
    const duration = video.duration;
    const rawPct = (currentTime / duration) * 100;
    const clampedPct = Math.min(100, Math.max(0, Math.round(rawPct)));

    setCurrentPlaybackPct(clampedPct);

    // Throttle localStorage updates: every 2.5 seconds or on major milestone
    const timeSinceLastSave = Math.abs(currentTime - lastSavedTimeRef.current);
    const reachedThreshold = clampedPct >= 90;

    if (timeSinceLastSave >= 2.5 || reachedThreshold) {
      lastSavedTimeRef.current = currentTime;

      if (onProgressUpdate) {
        onProgressUpdate(rawPct, currentTime);
      }

      // Completion logic: >= 90%
      if (reachedThreshold && !isCompleted) {
        setIsCompleted(true);
        if (onComplete) {
          onComplete();
        }
      }
    }
  }, [isCompleted, onComplete, onProgressUpdate]);

  // Handle video ending
  const handleEnded = useCallback(() => {
    setIsCompleted(true);
    if (onComplete) {
      onComplete();
    }
    if (onProgressUpdate && videoRef.current) {
      onProgressUpdate(100, videoRef.current.duration);
    }
  }, [onComplete, onProgressUpdate]);

  // Error handling
  const handleError = () => {
    setHasError(true);
    setErrorMessage("Unable to load this lesson video. Please try again.");
  };

  const handleRetry = () => {
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleRestartFromBeginning = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setShowResumeBanner(false);
      lastSavedTimeRef.current = 0;
      if (onProgressUpdate) {
        onProgressUpdate(0, 0);
      }
    }
  };

  return (
    <div className="video-wrapper">
      {/* Resume playback banner */}
      {showResumeBanner && (
        <div className="resume-floating-pill" role="status">
          <Clock size={15} />
          <span>Resumed from {formatTime(resumedAtTime)}</span>
          <button
            onClick={handleRestartFromBeginning}
            className="btn-resume-action"
            title="Start from beginning"
          >
            Restart
          </button>
          <button
            onClick={() => setShowResumeBanner(false)}
            className="btn-close-resume"
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      )}

      {/* Completion indicator */}
      {isCompleted && (
        <div className="video-completed-badge" role="status">
          <CheckCircle2 size={16} />
          <span>Lesson Completed</span>
        </div>
      )}

      {/* Error state */}
      {hasError ? (
        <div className="video-error-overlay">
          <AlertTriangle size={36} color="var(--warning)" />
          <p>{errorMessage}</p>
          <button onClick={handleRetry} className="btn btn-primary">
            <RotateCcw size={16} />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <video
          key={videoUrl}
          ref={videoRef}
          className="video-element"
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleError}
        >
          <source src={videoUrl} type="video/mp4" />
          {/* Fallback to local sample video */}
          <source src="/videos/sample-dev.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>
      )}
    </div>
  );
};
