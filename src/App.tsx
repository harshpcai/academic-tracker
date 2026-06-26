import { useActiveSection } from './context/AcademicContext';
import AcademicsSection from './components/academics/AcademicsSection';
import AudioEngine from './components/audio/AudioEngine';
import ExamSection from './components/exam/ExamSection';
import FocusSection from './components/focus/FocusSection';
import BibliotherapySystem from './components/biblio/BibliotherapySystem';
import {
  GraduationCap,
  Waves,
  Brain,
  Target,
  BookOpen,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { id: 'academics', label: 'Academics', icon: GraduationCap, description: 'Performance & grades' },
  { id: 'audio', label: 'Cognitive Audio', icon: Waves, description: 'Binaural & ambient' },
  { id: 'exam', label: 'Exam Prep', icon: Brain, description: 'Spaced repetition & flashcards' },
  { id: 'focus', label: 'Focus', icon: Target, description: 'Analytics & productivity' },
  { id: 'biblio', label: 'Bibliotherapy', icon: BookOpen, description: 'Adaptive reading' },
];

function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const { activeSection, setActiveSection } = useActiveSection();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 glass-strong border-r border-border z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-text-primary tracking-tight">Cortex</h1>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Academic Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary-glow border border-primary/20'
                    : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary-glow' : 'text-text-tertiary'} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block">{item.label}</span>
                  <span className="text-[10px] text-text-tertiary block truncate">{item.description}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-glow" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="glass rounded-lg p-3 border border-border">
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-text-secondary">All systems operational</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Content() {
  const { activeSection } = useActiveSection();

  return (
    <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {activeSection === 'academics' && <AcademicsSection />}
      {activeSection === 'audio' && <AudioEngine />}
      {activeSection === 'exam' && <ExamSection />}
      {activeSection === 'focus' && <FocusSection />}
      {activeSection === 'biblio' && <BibliotherapySystem />}
    </main>
  );
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-void flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden glass-strong border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-indigo-700 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-text-primary">Cortex</span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-text-tertiary transition-colors"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>
        <Content />
      </div>
    </div>
  );
}
