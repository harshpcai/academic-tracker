import { useState } from 'react';
import { Grid3X3, Plus, X, Trash2, CheckSquare, Square } from 'lucide-react';
import { useMatrixTasks } from '../../context/AcademicContext';
import type { MatrixTask } from '../../types';

const QUADRANTS: { key: MatrixTask['quadrant']; label: string; color: string; borderColor: string }[] = [
  { key: 'urgent-important', label: 'Do First', color: 'text-rose-400', borderColor: 'border-rose-500/20' },
  { key: 'not-urgent-important', label: 'Schedule', color: 'text-primary-glow', borderColor: 'border-primary/20' },
  { key: 'urgent-not-important', label: 'Delegate', color: 'text-amber-400', borderColor: 'border-amber-500/20' },
  { key: 'not-urgent-not-important', label: 'Eliminate', color: 'text-text-tertiary', borderColor: 'border-border' },
];

export default function MatrixManager() {
  const { tasks, addTask, updateTask, deleteTask } = useMatrixTasks();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState({ title: '', quadrant: 'urgent-important' as MatrixTask['quadrant'] });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask({ title: form.title.trim(), quadrant: form.quadrant, completed: false });
    setForm({ title: '', quadrant: 'urgent-important' });
    setDrawerOpen(false);
  };

  const toggleComplete = (task: MatrixTask) => {
    updateTask({ ...task, completed: !task.completed });
  };

  const getQuadrantTasks = (quadrant: MatrixTask['quadrant']) =>
    tasks.filter(t => t.quadrant === quadrant).sort((a, b) => Number(a.completed) - Number(b.completed));

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 size={18} className="text-primary-glow" />
          <h2 className="text-lg font-semibold text-text-primary">Priority Matrix</h2>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUADRANTS.map(q => {
          const quadrantTasks = getQuadrantTasks(q.key);
          return (
            <div key={q.key} className={`glass rounded-xl p-4 border ${q.borderColor}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wider ${q.color}`}>{q.label}</span>
                <span className="text-xs text-text-tertiary">{quadrantTasks.filter(t => !t.completed).length} active</span>
              </div>
              <div className="space-y-2 min-h-[80px]">
                {quadrantTasks.length === 0 ? (
                  <span className="text-xs text-text-tertiary italic">No tasks in this quadrant</span>
                ) : (
                  quadrantTasks.map(task => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                        task.completed ? 'opacity-50' : 'bg-white/[0.02]'
                      }`}
                    >
                      <button
                        onClick={() => toggleComplete(task)}
                        className="text-text-tertiary hover:text-primary-glow transition-colors"
                      >
                        {task.completed ? <CheckSquare size={16} className="text-emerald-400" /> : <Square size={16} />}
                      </button>
                      <span className={`text-sm flex-1 ${task.completed ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                        {task.title}
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 rounded hover:bg-rose-500/10 text-text-tertiary hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative glass-strong rounded-2xl w-full max-w-sm mx-4 p-6 animate-enter">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">New Task</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-md hover:bg-white/5 text-text-tertiary">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-tertiary mb-1.5 uppercase tracking-wider">Quadrant</label>
                <select
                  value={form.quadrant}
                  onChange={e => setForm(prev => ({ ...prev, quadrant: e.target.value as MatrixTask['quadrant'] }))}
                  className="input-field"
                >
                  {QUADRANTS.map(q => (
                    <option key={q.key} value={q.key}>{q.label}</option>
                  ))}
                </select>
              </div>
              <button onClick={handleAdd} className="btn-primary w-full flex items-center justify-center gap-2">
                <Plus size={16} />
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
