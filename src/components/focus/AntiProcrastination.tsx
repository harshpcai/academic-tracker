import { useState, useEffect, useRef } from 'react';
import { Zap, Clock, AlertTriangle } from 'lucide-react';

export default function AntiProcrastination() {
  const [fiveMinuteTime, setFiveMinuteTime] = useState(300);
  const [fiveMinuteRunning, setFiveMinuteRunning] = useState(false);
  const [contextSwitches, setContextSwitches] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (fiveMinuteRunning && fiveMinuteTime > 0) {
      intervalRef.current = setInterval(() => {
        setFiveMinuteTime(prev => {
          if (prev <= 1) {
            setFiveMinuteRunning(false);
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fiveMinuteRunning, fiveMinuteTime]);

  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const penaltyPercent = Math.min(100, contextSwitches * 12);

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-accent-amber" />
        <h2 className="text-lg font-semibold text-text-primary">Anti-Procrastination Toolkit</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5 border border-accent-amber/20">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-accent-amber" />
            <h3 className="text-sm font-semibold text-text-primary">5-Minute Rule</h3>
          </div>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            Commit to working for just 5 minutes. If you want to stop then, you can. 95% of brains continue.
          </p>
          <div className="text-center mb-4">
            <span className="text-3xl font-bold font-mono text-accent-amber">{formatTime(fiveMinuteTime)}</span>
          </div>
          <div className="flex gap-2">
            {!fiveMinuteRunning ? (
              <button
                onClick={() => setFiveMinuteRunning(true)}
                className="flex-1 btn-primary text-sm py-2"
              >
                Start 5 Minutes
              </button>
            ) : (
              <button
                onClick={() => setFiveMinuteRunning(false)}
                className="flex-1 btn-ghost text-sm py-2"
              >
                Pause
              </button>
            )}
            <button
              onClick={() => { setFiveMinuteRunning(false); setFiveMinuteTime(300); }}
              className="btn-ghost text-sm py-2 px-4"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="glass rounded-xl p-5 border border-rose-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-rose-400" />
            <h3 className="text-sm font-semibold text-text-primary">Context Switching Penalty</h3>
          </div>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            Every time you switch tabs or tasks, your brain loses focus momentum. Track your switches.
          </p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-secondary">Switches today</span>
            <span className="text-2xl font-bold text-rose-400">{contextSwitches}</span>
          </div>
          <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${penaltyPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-tertiary">Brainpower loss</span>
            <span className="text-rose-400 font-semibold">{penaltyPercent}%</span>
          </div>
          <button
            onClick={() => setContextSwitches(prev => prev + 1)}
            className="w-full mt-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors border border-rose-500/20"
          >
            + Log Context Switch
          </button>
        </div>
      </div>
    </div>
  );
}
