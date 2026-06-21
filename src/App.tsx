import { useRef, useState } from 'react';
import {
  Banknote,
  BookOpenCheck,
  CalendarClock,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Moon,
  RotateCcw,
  Sun,
  Upload,
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { EssaysView } from './components/EssaysView';
import { PrepView } from './components/PrepView';
import { ScholarshipsView } from './components/ScholarshipsView';
import { SchoolsView } from './components/SchoolsView';
import { TasksView } from './components/TasksView';
import { TimelineView } from './components/TimelineView';
import { useTheme } from './lib/theme';
import { useStore } from './store';

type ViewId = 'dashboard' | 'schools' | 'scholarships' | 'timeline' | 'prep' | 'essays' | 'tasks';

const NAV: { id: ViewId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'schools', label: 'Schools', icon: <GraduationCap className="h-4 w-4" /> },
  { id: 'scholarships', label: 'Scholarships', icon: <Banknote className="h-4 w-4" /> },
  { id: 'timeline', label: 'Timeline', icon: <CalendarClock className="h-4 w-4" /> },
  { id: 'prep', label: 'Test Prep', icon: <BookOpenCheck className="h-4 w-4" /> },
  { id: 'essays', label: 'Essays', icon: <FileText className="h-4 w-4" /> },
  { id: 'tasks', label: 'Tasks', icon: <ListChecks className="h-4 w-4" /> },
];

export default function App() {
  const [view, setView] = useState<ViewId>('dashboard');
  const [theme, toggleTheme] = useTheme();
  const { exportJson, importJson, resetToSeed } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importJson(file);
      setView('dashboard');
    } catch {
      alert('Could not read that file — make sure it is a tracker export (.json).');
    } finally {
      e.target.value = '';
    }
  };

  const onReset = () => {
    if (window.confirm('Reset everything to the original seed data? Your current edits will be lost.')) {
      resetToSeed();
      setView('dashboard');
    }
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">MBA &amp; Scholarship Tracker</h1>
              <p className="text-[11px] text-slate-400">2027 intake · Chevening + India loan-scholarships</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImport} className="hidden" />
            <HeaderButton onClick={exportJson} title="Export your data as JSON">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </HeaderButton>
            <HeaderButton onClick={() => fileRef.current?.click()} title="Import a JSON backup">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Import</span>
            </HeaderButton>
            <HeaderButton onClick={onReset} title="Reset to seed data">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </HeaderButton>
            <button
              onClick={toggleTheme}
              title="Toggle light / dark"
              aria-label="Toggle theme"
              className="btn-ghost px-2"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="mx-auto max-w-6xl px-2">
          <div className="flex gap-1 overflow-x-auto pb-2 pt-0.5">
            {NAV.map((n) => {
              const active = view === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {n.icon}
                  {n.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div key={view} className="animate-fade-in">
          {view === 'dashboard' && <Dashboard goView={(id) => setView(id as ViewId)} />}
          {view === 'schools' && <SchoolsView />}
          {view === 'scholarships' && <ScholarshipsView />}
          {view === 'timeline' && <TimelineView />}
          {view === 'prep' && <PrepView />}
          {view === 'essays' && <EssaysView />}
          {view === 'tasks' && <TasksView />}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-center text-xs text-slate-400">
        Personal tracker · all data stays in your browser (localStorage) · export regularly to back up.
      </footer>
    </div>
  );
}

function HeaderButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} title={title} className="btn-ghost px-2.5">
      {children}
    </button>
  );
}
