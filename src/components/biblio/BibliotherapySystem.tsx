import { useMemo } from 'react';
import { BookOpen, Lightbulb, TrendingUp, AlertTriangle, Battery, Brain } from 'lucide-react';
import { useFocusLogs, useSRTopics } from '../../context/AcademicContext';
import { getBookRecommendations, getCurrentWeekLogs } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BibliotherapySystem() {
  const { logs } = useFocusLogs();
  const { topics } = useSRTopics();
  const currentWeekLogs = getCurrentWeekLogs(logs);
  const recommendations = useMemo(() => getBookRecommendations(logs, topics), [logs, topics]);

  const totalStudy = currentWeekLogs.reduce((s, l) => s + l.studyMinutes, 0);
  const totalDistractions = currentWeekLogs.reduce((s, l) => s + l.phoneDistractions, 0);
  const avgEnergy = currentWeekLogs.length > 0
    ? currentWeekLogs.reduce((s, l) => s + l.energyLevel, 0) / currentWeekLogs.length
    : 0;
  const upcomingExams = topics.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    return t.examDate >= today && t.examDate <= twoWeeks.toISOString().split('T')[0];
  }).length;

  const metricsData = [
    { name: 'Study', value: Math.min(100, (totalStudy / 600) * 100), color: '#6366f1', icon: TrendingUp },
    { name: 'Distraction', value: Math.min(100, (totalDistractions / 30) * 100), color: '#f43f5e', icon: AlertTriangle },
    { name: 'Energy', value: (avgEnergy / 5) * 100, color: '#f59e0b', icon: Battery },
    { name: 'Exams', value: Math.min(100, upcomingExams * 25), color: '#10b981', icon: Brain },
  ];

  const getIconForTrigger = (trigger: string) => {
    if (trigger.includes('Distraction')) return AlertTriangle;
    if (trigger.includes('Study time')) return TrendingUp;
    if (trigger.includes('energy')) return Battery;
    if (trigger.includes('exams')) return Brain;
    return Lightbulb;
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gradient-primary mb-1">Adaptive Bibliotherapy</h1>
        <p className="text-sm text-text-secondary">Data-driven book recommendations based on your weekly cognitive patterns.</p>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Weekly Cognitive Metrics</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
              <Tooltip
                contentStyle={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {metricsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-text-primary">Recommended Reading</h3>
        {recommendations.map((rec, index) => {
          const Icon = getIconForTrigger(rec.trigger);
          return (
            <div
              key={`${rec.title}-${index}`}
              className="glass rounded-xl p-5 card-hover border border-border animate-enter"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-16 h-20 rounded-lg bg-gradient-to-br ${rec.coverGradient} flex items-center justify-center shrink-0`}>
                  <BookOpen size={24} className="text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-text-primary">{rec.title}</h4>
                    <span className="text-xs text-text-tertiary">by {rec.author}</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed mb-2">{rec.insight}</p>
                  <div className="flex items-center gap-2">
                    <Icon size={12} className="text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">{rec.trigger}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
