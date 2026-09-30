'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface VideoPlayerProps {
  lessonId: string;
  initialWatchedSeconds?: number;
  isInitiallyCompleted?: boolean;
  onCompleted?: () => void;
}

export default function VideoPlayer({
  lessonId,
  initialWatchedSeconds = 0,
  isInitiallyCompleted = false,
  onCompleted,
}: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [authData, setAuthData] = useState<{
    playbackUrl?: string;
    embedUrl?: string;
    isDevelopmentPlaceholder?: boolean;
    message?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(isInitiallyCompleted);
  const [showResumeBanner, setShowResumeBanner] = useState(
    initialWatchedSeconds > 10 && !isInitiallyCompleted
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastSavedTimeRef = useRef<number>(initialWatchedSeconds);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to format seconds as MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Fetch authorized playback configuration from server
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchAuth() {
      try {
        const res = await fetch(`/api/video/auth?lessonId=${lessonId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to authorize video playback');
        }

        if (isMounted) {
          setAuthData(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Video access unavailable');
          setLoading(false);
        }
      }
    }

    fetchAuth();

    return () => {
      isMounted = false;
    };
  }, [lessonId]);

  // 2. Throttled progress save function
  const saveProgress = useCallback(
    async (seconds: number, markComplete = false) => {
      if (!seconds && !markComplete) return;

      try {
        const effectiveDuration = duration || (videoRef.current ? videoRef.current.duration : 0);
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            watchedSeconds: Math.round(seconds),
            durationSeconds: Math.round(effectiveDuration),
            markComplete,
          }),
        });

        lastSavedTimeRef.current = seconds;

        // If >= 90% or markComplete
        if (effectiveDuration > 0 && (seconds / effectiveDuration >= 0.9 || markComplete)) {
          if (!isCompleted) {
            setIsCompleted(true);
            if (onCompleted) onCompleted();
          }
        }
      } catch (err) {
        console.error('Failed to save video progress:', err);
      }
    },
    [lessonId, duration, isCompleted, onCompleted]
  );

  // 3. Periodic progress save timer during playback
  useEffect(() => {
    if (isPlaying) {
      saveIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          const current = videoRef.current.currentTime;
          // Save every 6 seconds of progress
          if (Math.abs(current - lastSavedTimeRef.current) >= 6) {
            saveProgress(current);
          }
        }
      }, 5000);
    } else {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [isPlaying, saveProgress]);

  // 4. Save progress on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoRef.current && videoRef.current.currentTime > 0) {
        const data = JSON.stringify({
          lessonId,
          watchedSeconds: Math.round(videoRef.current.currentTime),
          durationSeconds: Math.round(videoRef.current.duration || 0),
        });
        navigator.sendBeacon('/api/progress', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [lessonId]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setShowResumeBanner(false);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      saveProgress(videoRef.current.currentTime);
    }
  };

  // Handle Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  // Handle Resume
  const handleResume = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = initialWatchedSeconds;
      videoRef.current.play();
      setIsPlaying(true);
      setShowResumeBanner(false);
    }
  };

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Auto complete check at 90%
      if (
        !isCompleted &&
        duration > 0 &&
        videoRef.current.currentTime / duration >= 0.9
      ) {
        setIsCompleted(true);
        saveProgress(videoRef.current.currentTime, true);
        if (onCompleted) onCompleted();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsCompleted(true);
    if (videoRef.current) {
      saveProgress(videoRef.current.duration, true);
    }
    if (onCompleted) onCompleted();
  };

  // ----------------------------------------------------------------------------
  // Render States: Loading, Error, Player
  // ----------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="relative w-full aspect-video bg-[#1C1917] rounded-sm flex flex-col items-center justify-center text-[#78716C]">
        <div className="w-8 h-8 border-2 border-[#FAF8F5]/20 border-t-[#FAF8F5] rounded-full animate-spin mb-3" />
        <p className="font-serif text-sm text-[#E7E2D8] tracking-wide">
          Verifying authorization...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-[#FAF8F5] border border-[#E7E2D8] rounded-sm flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#FAF0F0] border border-[#EAD0D0] flex items-center justify-center text-[#8F2D2D] mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-medium text-[#141413] mb-2">
          Access Unavailable
        </h3>
        <p className="text-xs text-[#78716C] max-w-md mb-6 leading-relaxed">
          {error}
        </p>
        <a
          href="/dashboard"
          className="px-4 py-2 text-xs uppercase tracking-wider font-medium bg-[#141413] text-white rounded hover:bg-black transition-colors"
        >
          Return to My Classes
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Dev fallback notice if Bunny credentials not set */}
      {authData?.isDevelopmentPlaceholder && (
        <div className="flex items-center justify-between px-3 py-2 text-xs bg-[#FAF5EA] border border-[#E8DEC8] text-[#8B6D36] rounded">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Development Preview Stream: Bunny.net credentials not configured in environment.</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-[#8B6D36]/10 rounded">
            Dev Mode
          </span>
        </div>
      )}

      {/* Main Video Container */}
      <div
        ref={containerRef}
        className="relative group w-full aspect-video bg-black rounded-sm overflow-hidden shadow-subtle select-none"
      >
        {/* HTML5 Video element */}
        <video
          ref={videoRef}
          src={authData?.playbackUrl || '/videos/sample-dev.mp4'}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          playsInline
        />

        {/* Big Center Play Button when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-transform hover:scale-105 backdrop-blur-sm border border-white/20"
            aria-label="Play video"
          >
            <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-white" />
          </button>
        )}

        {/* Subtle "Resume Watching" prompt */}
        {showResumeBanner && initialWatchedSeconds > 0 && (
          <div className="absolute top-4 left-4 z-20 bg-black/85 text-white backdrop-blur-md px-3 py-2 rounded border border-white/20 flex items-center space-x-3 text-xs shadow-lg animate-fade-in">
            <RotateCcw className="w-4 h-4 text-[#FAF8F5]" />
            <span>
              Resume from <strong>{formatTime(initialWatchedSeconds)}</strong>?
            </span>
            <button
              onClick={handleResume}
              className="px-2 py-1 bg-white text-black font-semibold rounded text-[11px] hover:bg-[#FAF8F5] transition-colors"
            >
              Resume
            </button>
            <button
              onClick={() => setShowResumeBanner(false)}
              className="text-white/60 hover:text-white text-xs ml-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Completed Indicator Top Right */}
        {isCompleted && (
          <div className="absolute top-4 right-4 z-20 bg-[#2A4E39]/90 text-white text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded backdrop-blur-sm border border-[#CEE0D4]/30 flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Seek Bar */}
          <div className="mb-2">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="hover:text-white/80 p-1"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="hover:text-white/80 p-1"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="font-mono text-[11px] text-white/80 tracking-wider">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleFullscreen}
                className="hover:text-white/80 p-1"
                aria-label="Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
