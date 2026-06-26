import { useState, useMemo } from 'react';
import { Target, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { useFlashcardDecks, useSRTopics } from '../../context/AcademicContext';
import { calculateERI, calculateDeckMastery, getToday } from '../../utils/helpers';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ERIModule() {
  const { decks } = useFlashcardDecks();
  const { topics } = useSRTopics();
  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.id || '');
  const [mockScore, setMockScore] = useState('');

  const selectedTopicData = topics.find(t => t.id === selectedTopic);

  const eriData = useMemo(() => {
    if (!selectedTopicData) return null;
    const deck = decks.find(d => d.name.toLowerCase().includes(selectedTopicData.topic.toLowerCase().split(' ')[0]));
    const daysRemaining = Math.max(0, Math.ceil((new Date(selectedTopicData.examDate).getTime() - new Date(getToday()).getTime()) / (1000 * 60 * 60 * 24)));
    const mastery = deck ? calculateDeckMastery(deck) : 0;
    const score = mockScore ? Number(mockScore) : 0;
    const eri = calculateERI(daysRemaining, mastery, score);
    return { daysRemaining, mastery, score, eri };
  }, [selectedTopicData, decks, mockScore]);

  const chartData = eriData
    ? [
        { name: 'Ready', value: eriData.eri, color: '#10b981' },
        { name: 'Gap', value: 100 - eriData.eri, color: 'rgba(255,255,255,0.06)' },
      ]
    : [{ name: 'Ready', value: 0, color: '#10b981' }, { name: 'Gap', value: 100, color: 'rgba(255,255,255,0.06)' }];

  const getReadinessLabel = (eri: number) => {
    if (eri >= 80) return { label: 'Excellent', color: '#10b981' };
    if (eri >= 60) return { label: 'Good', color: '#14b8a6' };
    if (eri >= 40) return { label: 'Fair', color: '#f59e0b' };
    if (eri >= 20) return { label: 'Poor', color: '#f97316' };
    return { label: 'Critical', color: '#f43f5e' };
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center gap-2">
        <Target size={18} className="text-primary-glow" />
        <h2 className="text-lg font-semibold text-text-primary">Exam Readiness Index</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Select Exam Topic</label>
              <select
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                className="input-field"
              >
                <option value="">Choose a topic...</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.topic}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Mock Test Score (%)</label>
              <input
                type="number"
                value={mockScore}
                onChange={e => setMockScore(e.target.value)}
                className="input-field"
                placeholder="0-100"
                min="0"
                max="100"
              />
            </div>
          </div>

          {eriData && selectedTopicData && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50 border border-border">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-text-tertiary" />
                  <span className="text-xs text-text-secondary">Days Remaining</span>
                </div>
                <span className="text-sm font-semibold text-text-primary">{eriData.daysRemaining}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50 border border-border">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-text-tertiary" />
                  <span className="text-xs text-text-secondary">Flashcard Mastery</span>
                </div>
                <span className="text-sm font-semibold text-emerald-400">{eriData.mastery}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50 border border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-text-tertiary" />
                  <span className="text-xs text-text-secondary">Mock Score</span>
                </div>
                <span className="text-sm font-semibold text-text-primary">{eriData.score}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6 flex flex-col items-center justify-center">
          {eriData ? (
            <>
              <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#111118',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: getReadinessLabel(eriData.eri).color }}>
                    {eriData.eri}%
                  </span>
                  <span className="text-xs text-text-tertiary mt-1">{getReadinessLabel(eriData.eri).label}</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-text-secondary">
                  Based on {eriData.daysRemaining} days remaining, {eriData.mastery}% flashcard mastery, and {eriData.score}% mock score.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center text-text-tertiary text-sm">
              Select an exam topic and enter a mock score to calculate your readiness index.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
