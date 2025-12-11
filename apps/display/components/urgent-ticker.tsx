import React, { useEffect, useState, useRef } from 'react';

interface AssignmentSummary {
  task_id: string;
  user_display_name: string;
  status: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at?: string;
}

interface UrgentTickerProps {
  assignments: AssignmentSummary[];
}

const DEFAULT_ROTATION_CADENCE = 5000; // 5 seconds
const ROTATION_CADENCE = parseInt(
  typeof window !== 'undefined'
    ? (window as any).__DISPLAY_CONFIG__?.rotationCadence ||
        process.env.DISPLAY_ROTATION_CADENCE ||
        '5000'
    : process.env.DISPLAY_ROTATION_CADENCE || '5000',
  10,
);

export function UrgentTicker({ assignments }: UrgentTickerProps) {
  const urgentAssignments = assignments.filter(
    (a) => a.status === 'urgent' || a.status === 'high_priority' || a.priority === 'urgent',
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playAudibleCue = () => {
    if (!soundEnabled) return;

    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Urgent task update');
        utterance.volume = 0.3;
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    } catch (error) {
      // Ignore audio errors
    }
  };

  useEffect(() => {
    if (urgentAssignments.length === 0 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const adjustedCadence = DEFAULT_ROTATION_CADENCE / rotationSpeed;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % urgentAssignments.length);
      playAudibleCue();
    }, adjustedCadence);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [urgentAssignments.length, isPaused, rotationSpeed, soundEnabled]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % urgentAssignments.length);
    playAudibleCue();
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + urgentAssignments.length) % urgentAssignments.length);
    playAudibleCue();
  };

  if (urgentAssignments.length === 0) {
    return null;
  }

  const current = urgentAssignments[currentIndex];
  const createdTime = current.created_at ? new Date(current.created_at) : null;
  const timeAgo = createdTime ? Math.floor((Date.now() - createdTime.getTime()) / 1000 / 60) : null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
      role="alert"
      aria-live="assertive"
      aria-label={`Urgent task ${currentIndex + 1} of ${urgentAssignments.length}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white text-red-600 text-xs px-2 py-1 rounded font-bold animate-pulse">
                URGENT
              </span>
              <h3 className="font-bold text-lg">Task Alert</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="font-medium">ID:</span> {current.task_id.slice(0, 8)}...
              </div>
              <div>
                <span className="font-medium">Assigned:</span>{' '}
                {current.user_display_name || 'Unassigned'}
              </div>
              <div>
                <span className="font-medium">Status:</span> {current.status}
              </div>
            </div>
            {timeAgo !== null && (
              <div className="text-xs mt-1 opacity-90">
                Created {timeAgo} {timeAgo === 1 ? 'minute' : 'minutes'} ago
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
              {currentIndex + 1} / {urgentAssignments.length}
            </div>

            {/* Accessibility Controls */}
            <div className="flex items-center gap-2 bg-black/20 p-2 rounded">
              <button
                onClick={handlePrevious}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Previous urgent task"
              >
                ◀
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label={isPaused ? 'Resume rotation' : 'Pause rotation'}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
              <button
                onClick={handleNext}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Next urgent task"
              >
                ▶
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-1 bg-black/20 p-2 rounded">
              <span className="text-xs">Speed:</span>
              <button
                onClick={() => setRotationSpeed(Math.max(0.5, rotationSpeed - 0.5))}
                className="px-1 hover:bg-white/20 rounded text-xs"
                aria-label="Decrease rotation speed"
              >
                -
              </button>
              <span className="text-xs font-medium w-8 text-center">{rotationSpeed}x</span>
              <button
                onClick={() => setRotationSpeed(Math.min(3, rotationSpeed + 0.5))}
                className="px-1 hover:bg-white/20 rounded text-xs"
                aria-label="Increase rotation speed"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
