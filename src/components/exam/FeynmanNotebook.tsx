import { useState } from 'react';
import { PenTool, Sparkles, Trash2 } from 'lucide-react';
import { useFeynmanNotes } from '../../context/AcademicContext';
import { evaluateFeynmanText, formatDate } from '../../utils/helpers';

export default function FeynmanNotebook() {
  const { notes, addNote, deleteNote } = useFeynmanNotes();
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleEvaluate = () => {
    if (!concept.trim() || !explanation.trim()) return;
    setEvaluating(true);
    setTimeout(() => {
      const evaluation = evaluateFeynmanText(explanation);
      setResult(evaluation);
      addNote({
        concept: concept.trim(),
        explanation: explanation.trim(),
        evaluation: evaluation.feedback,
        score: evaluation.score,
      });
      setEvaluating(false);
    }, 800);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#14b8a6';
    if (score >= 50) return '#f59e0b';
    return '#f43f5e';
  };

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool size={18} className="text-primary-glow" />
          <h2 className="text-lg font-semibold text-text-primary">Feynman Technique Notebook</h2>
        </div>
        {notes.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="btn-ghost text-xs"
          >
            {showHistory ? 'Hide History' : `History (${notes.length})`}
          </button>
        )}
      </div>

      <div className="glass rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Concept to Explain</label>
            <input
              type="text"
              value={concept}
              onChange={e => setConcept(e.target.value)}
              className="input-field"
              placeholder="e.g., Quantum Entanglement"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">
              Explain it like you are teaching a 10-year-old
            </label>
            <textarea
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              className="input-field min-h-[160px] resize-none"
              placeholder="Write your simplified explanation here... Use everyday examples and avoid jargon."
            />
          </div>
          <button
            onClick={handleEvaluate}
            disabled={!concept.trim() || !explanation.trim() || evaluating}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={16} />
            {evaluating ? 'Analyzing...' : 'Evaluate Explanation'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-xl border animate-enter" style={{ borderColor: `${getScoreColor(result.score)}30`, background: `${getScoreColor(result.score)}08` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: `${getScoreColor(result.score)}15`, color: getScoreColor(result.score) }}>
                {result.score}
              </div>
              <div>
                <span className="text-sm font-semibold text-text-primary">Clarity Score</span>
                <span className="text-xs text-text-tertiary block">{result.score >= 90 ? 'Excellent' : result.score >= 70 ? 'Good' : result.score >= 50 ? 'Fair' : 'Needs Work'}</span>
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{result.feedback}</p>
          </div>
        )}
      </div>

      {showHistory && notes.length > 0 && (
        <div className="space-y-3 animate-enter">
          <h3 className="text-sm font-semibold text-text-primary">Previous Notes</h3>
          {notes.slice().reverse().map(note => (
            <div key={note.id} className="glass rounded-xl p-4 border border-border">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-text-primary">{note.concept}</h4>
                  <span className="text-xs text-text-tertiary">{formatDate(note.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {note.score !== null && (
                    <span className="badge text-xs" style={{ background: `${getScoreColor(note.score)}15`, color: getScoreColor(note.score), border: `1px solid ${getScoreColor(note.score)}30` }}>
                      {note.score}
                    </span>
                  )}
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1.5 rounded-md hover:bg-rose-500/10 text-text-tertiary hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2 mb-2">{note.explanation}</p>
              {note.evaluation && (
                <p className="text-xs text-text-tertiary italic">{note.evaluation}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
