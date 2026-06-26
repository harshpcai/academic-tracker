import { useState } from 'react';
import { Brain, Plus, X, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { useSRTopics } from '../../context/AcademicContext';
import { getToday, addDays, isToday, formatDate, calculateNextReview, getLeitnerIntervals, requestNotificationPermission } from '../../utils/helpers';
import type { SpacedRepetitionTopic } from '../../types';

export default function SpacedRepetition() {
  const { topics, addTopic, updateTopic, deleteTopic } = useSRTopics();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ topic: '', examDate: '' });
  const [reviewingTopic, setReviewingTopic] = useState<SpacedRepetitionTopic | null>(null);

  const handleAdd = () => {
    if (!form.topic.trim() || !form.examDate) return;
    const intervals = getLeitnerIntervals();
    const newTopic: Omit<SpacedRepetitionTopic, 'id' | 'createdAt'> = {
      topic: form.topic.trim(),
      examDate: form.examDate,
      intervals,
      currentIntervalIndex: 0,
      lastReviewed: null,
      nextReview: addDays(getToday(), intervals[0]),
      performance: null,
    };
    addTopic(newTopic);
    setForm({ topic: '', examDate: '' });
    setDrawerOpen(false);
    requestNotificationPermission();
  };

  const handleReview = (performance: 'again' | 'hard' | 'good' | 'easy') => {
    if (!reviewingTopic) return;
    const nextReview = calculateNextReview(reviewingTopic, performance);
    updateTopic({
      ...reviewingTopic,
      lastReviewed: getToday(),
      nextReview,
      currentIntervalIndex: Math.min(
        getLeitnerIntervals().length - 1,
        reviewingTopic.currentIntervalIndex + (performance === 'again' ? 0 : performance === 'easy' ? 2 : 1)
      ),
      performance,
    });
    setReviewingTopic(null);
  };

  const todayReviews = topics.filter(t => isToday(t.nextReview) || t.nextReview < getToday());
  const upcomingReviews = topics.filter(t => t.nextReview > getToday()).sort((a, b) => a.nextReview.localeCompare(b.nextReview));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-primary-glow" />
          <h2 className="text-lg font-semibold text-text-primary">Spaced Repetition Engine</h2>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          Add Topic
        </button>
      </div>

      {todayReviews.length > 0 && (
        <div className="glass rounded-xl p-5 border border-accent-amber/20 glow-amber">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-accent-amber" />
            <h3 className="text-sm font-semibold text-accent-amber">Review Today</h3>
            <span className="badge bg-accent-amber/10 text-accent-amber border border-accent-amber/20">{todayReviews.length} due</span>
          </div>
          <div className="space-y-3">
            {todayReviews.map(topic => (
              <div key={topic.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50 border border-border">
                <div>
                  <span className="text-sm font-medium text-text-primary">{topic.topic}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-tertiary flex items-center gap-1">
                      <Calendar size={12} />
                      Exam: {formatDate(topic.examDate)}
                    </span>
                    <span className="text-xs text-accent-amber">Due now</span>
                  </div>
                </div>
                <button
                  onClick={() => setReviewingTopic(topic)}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Upcoming Reviews</h3>
        </div>
        {topics.length === 0 ? (
          <div className="px-5 py-8 text-center text-text-tertiary text-sm">
            No topics added yet. Add your first exam topic to start the Leitner system.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {upcomingReviews.map(topic => (
              <div key={topic.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div>
                  <span className="text-sm font-medium text-text-primary">{topic.topic}</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-tertiary flex items-center gap-1">
                      <Calendar size={12} />
                      Next: {formatDate(topic.nextReview)}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      Interval: {getLeitnerIntervals()[Math.min(topic.currentIntervalIndex, getLeitnerIntervals().length - 1)]} days
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isToday(topic.nextReview) && (
                    <span className="badge bg-accent-amber/10 text-accent-amber border border-accent-amber/20 text-xs">Today</span>
                  )}
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="p-1.5 rounded-md hover:bg-rose-500/10 text-text-tertiary hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {upcomingReviews.length === 0 && todayReviews.length === 0 && (
              <div className="px-5 py-8 text-center text-text-tertiary text-sm">All caught up! No upcoming reviews.</div>
            )}
          </div>
        )}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:w-[440px] animate-enter">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">New Study Topic</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-md hover:bg-white/5 text-text-tertiary">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Topic Name</label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={e => setForm(prev => ({ ...prev, topic: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Quantum Mechanics"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Exam Date</label>
                <input
                  type="date"
                  value={form.examDate}
                  onChange={e => setForm(prev => ({ ...prev, examDate: e.target.value }))}
                  className="input-field"
                  min={getToday()}
                />
              </div>
              <button onClick={handleAdd} className="btn-primary w-full flex items-center justify-center gap-2">
                <Plus size={16} />
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setReviewingTopic(null)} />
          <div className="relative glass-strong rounded-2xl w-full max-w-md mx-4 p-6 animate-enter">
            <h3 className="text-lg font-semibold text-text-primary mb-2">How well did you know this?</h3>
            <p className="text-sm text-text-secondary mb-6">{reviewingTopic.topic}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleReview('again')}
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors"
              >
                Again
                <span className="block text-xs text-rose-400/70 mt-1">&lt; 1 min</span>
              </button>
              <button
                onClick={() => handleReview('hard')}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
              >
                Hard
                <span className="block text-xs text-amber-400/70 mt-1">~ 2.5 min</span>
              </button>
              <button
                onClick={() => handleReview('good')}
                className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary-glow text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                Good
                <span className="block text-xs text-primary-glow/70 mt-1">~ 5 min</span>
              </button>
              <button
                onClick={() => handleReview('easy')}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                Easy
                <span className="block text-xs text-emerald-400/70 mt-1">~ 8 min</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
