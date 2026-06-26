import WeeklyFocusLog from './WeeklyFocusLog';
import MatrixManager from './MatrixManager';
import PomodoroHub from './PomodoroHub';
import AntiProcrastination from './AntiProcrastination';

export default function FocusSection() {
  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gradient-primary mb-1">Focus & Productivity</h1>
        <p className="text-sm text-text-secondary">Track weekly focus metrics, manage priorities, and maintain deep work sessions.</p>
      </div>
      <WeeklyFocusLog />
      <div className="divider" />
      <MatrixManager />
      <div className="divider" />
      <PomodoroHub />
      <div className="divider" />
      <AntiProcrastination />
    </div>
  );
}
