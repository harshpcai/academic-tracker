import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, Flame } from 'lucide-react';
import { usePomodoro, useStudyStreak } from '../../context/AcademicContext';

export default function PomodoroHub() {
  const { pomodoro, setPomodoro } = usePomodoro();
  const streak = useStudyStreak();
  const [displayTime, setDisplayTime] = useState('25:00');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Audio ref removed - not used in current implementation

  const formatTime = useCallback((minutes: number, seconds: number) => {
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  useEffect(() => {
    setDisplayTime(formatTime(pomodoro.minutes, pomodoro.seconds));
  }, [pomodoro.minutes, pomodoro.seconds, formatTime]);

  useEffect(() => {
    if (pomodoro.isRunning) {
      intervalRef.current = setInterval(() => {
        setPomodoro((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          }
          if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          }
          // Timer complete
          const newSessions = prev.sessionsCompleted + 1;
          const isBreak = !prev.isBreak;
          return {
            minutes: isBreak ? 5 : 25,
            seconds: 0,
            isRunning: false,
            isBreak,
            sessionsCompleted: newSessions,
          };
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pomodoro.isRunning, setPomodoro]);

  const handleStart = () => {
    setPomodoro({ ...pomodoro, isRunning: true });
  };

  const handlePause = () => {
    setPomodoro({ ...pomodoro, isRunning: false });
  };

  const handleReset = () => {
    setPomodoro({ minutes: 25, seconds: 0, isRunning: false, isBreak: false, sessionsCompleted: pomodoro.sessionsCompleted });
  };

  const progress = pomodoro.isBreak
    ? ((5 - pomodoro.minutes - pomodoro.seconds / 60) / 5) * 100
    : ((25 - pomodoro.minutes - pomodoro.seconds / 60) / 25) * 100;

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer size={18} className="text-primary-glow" />
          <h2 className="text-lg font-semibold text-text-primary">Focus Timer</h2>
        </div>
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-accent-amber" />
          <span className="text-sm text-text-secondary">{streak.currentStreak} day streak</span>
        </div>
      </div>

      <div className="glass rounded-xl p-8 flex flex-col items-center">
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={pomodoro.isBreak ? '#14b8a6' : '#6366f1'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-text-primary font-mono">{displayTime}</span>
            <span className="text-xs text-text-tertiary mt-1">{pomodoro.isBreak ? 'Break Time' : 'Focus Session'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!pomodoro.isRunning ? (
            <button onClick={handleStart} className="btn-primary flex items-center gap-2 px-6">
              <Play size={18} />
              Start
            </button>
          ) : (
            <button onClick={handlePause} className="btn-ghost flex items-center gap-2 px-6">
              <Pause size={18} />
              Pause
            </button>
          )}
          <button onClick={handleReset} className="btn-ghost flex items-center gap-2">
            <RotateCcw size={18} />
            Reset
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs text-text-tertiary">
          <span>Sessions: {pomodoro.sessionsCompleted}</span>
          <span className="w-1 h-1 rounded-full bg-text-tertiary" />
          <span>Longest streak: {streak.longestStreak} days</span>
        </div>
      </div>
    </div>
  );
}
