import { useState, useMemo } from 'react';
import { Activity, Plus, X, TrendingUp, Smartphone, Zap } from 'lucide-react';
import { useFocusLogs } from '../../context/AcademicContext';
import { calculateFocusDensity, calculateFocusEfficiency, getCurrentWeekLogs } from '../../utils/helpers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyFocusLog() {
  const { logs, addLog, updateLog } = useFocusLogs();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ day: DAYS[0], studyMinutes: '', phoneDistractions: '', energyLevel: '3' });
  const currentWeekLogs = getCurrentWeekLogs(logs);

  const weekData = useMemo(() => {
    const data = DAYS.map(day => {
      const existing = currentWeekLogs.find(l => l.day === day);
      if (existing) {
        return {
          day: day.slice(0, 3),
          fullDay: day,
          studyMinutes: existing.studyMinutes,
          distractions: existing.phoneDistractions,
          energy: existing.energyLevel,
          density: calculateFocusDensity(existing),
          efficiency: calculateFocusEfficiency(existing),
        };
      }
      return {
        day: day.slice(0, 3),
        fullDay: day,
        studyMinutes: 0,
        distractions: 0,
        energy: 0,
        density: 0,
        efficiency: 0,
      };
    });
    return data;
  }, [currentWeekLogs]);

  const handleSubmit = () => {
    const studyMinutes = Number(form.studyMinutes);
    const phoneDistractions = Number(form.phoneDistractions);
    const energyLevel = Number(form.energyLevel);
    if (isNaN(studyMinutes) || isNaN(phoneDistractions) || isNaN(energyLevel)) return;

    const existing = currentWeekLogs.find(l => l.day === form.day);
    if (existing) {
      updateLog({ ...existing, studyMinutes, phoneDistractions, energyLevel });
    } else {
      addLog({ day: form.day, studyMinutes, phoneDistractions, energyLevel });
    }
    setForm({ day: DAYS[0], studyMinutes: '', phoneDistractions: '', energyLevel: '3' });
    setDrawerOpen(false);
  };

  const totalStudy = currentWeekLogs.reduce((s, l) => s + l.studyMinutes, 0);
  const totalDistractions = currentWeekLogs.reduce((s, l) => s + l.phoneDistractions, 0);
  const avgEnergy = currentWeekLogs.length > 0 ? (currentWeekLogs.reduce((s, l) => s + l.energyLevel, 0) / currentWeekLogs.length).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-primary-glow" />
          <h2 className="text-lg font-semibold text-text-primary">Weekly Focus Analytics</h2>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          Log Day
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs text-text-tertiary uppercase tracking-wider">Total Study</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">{Math.round(totalStudy / 60)}h {totalStudy % 60}m</span>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={14} className="text-rose-400" />
            <span className="text-xs text-text-tertiary uppercase tracking-wider">Distractions</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">{totalDistractions}</span>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-amber-400" />
            <span className="text-xs text-text-tertiary uppercase tracking-wider">Avg Energy</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">{avgEnergy}/5</span>
        </div>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Focus Density & Efficiency</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="density" name="Focus Density" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="efficiency" name="Focus Efficiency" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:w-[440px] animate-enter">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Log Focus Data</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-md hover:bg-white/5 text-text-tertiary">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Day</label>
                <select
                  value={form.day}
                  onChange={e => setForm(prev => ({ ...prev, day: e.target.value }))}
                  className="input-field"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Study Duration (minutes)</label>
                <input
                  type="number"
                  value={form.studyMinutes}
                  onChange={e => setForm(prev => ({ ...prev, studyMinutes: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., 90"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Phone Distractions</label>
                <input
                  type="number"
                  value={form.phoneDistractions}
                  onChange={e => setForm(prev => ({ ...prev, phoneDistractions: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Energy Level (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setForm(prev => ({ ...prev, energyLevel: String(level) }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        form.energyLevel === String(level)
                          ? 'bg-primary text-white'
                          : 'bg-surface-elevated text-text-tertiary hover:bg-white/5'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSubmit} className="btn-primary w-full flex items-center justify-center gap-2">
                <Plus size={16} />
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
