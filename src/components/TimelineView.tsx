import { useMemo, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import type { Milestone, MilestoneCategory } from '../data';
import { daysUntil, formatDate, formatMonthYear, parseDate, urgencyFor, URGENCY_DOT } from '../lib/dates';
import { uid, useStore } from '../store';
import { Badge } from './ui/Badge';
import { CountdownPill, VerifyFlag } from './ui/Bits';

const CATEGORIES: MilestoneCategory[] = ['Chevening', 'GMAT', 'School', 'Loan-scholarship', 'Personal'];

const CAT_BADGE: Record<MilestoneCategory, string> = {
  Chevening: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  GMAT: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  School: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  'Loan-scholarship': 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
  Personal: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export function TimelineView() {
  const { data, mutate } = useStore();
  const [filter, setFilter] = useState<'All' | MilestoneCategory>('All');
  const [adding, setAdding] = useState(false);

  const sorted = useMemo(
    () =>
      [...data.milestones].sort(
        (a, b) => (parseDate(a.date)?.getTime() ?? 0) - (parseDate(b.date)?.getTime() ?? 0),
      ),
    [data.milestones],
  );

  const visible = sorted.filter((m) => filter === 'All' || m.category === filter);

  // Group by "Mon YYYY".
  const groups: { key: string; items: Milestone[] }[] = [];
  for (const m of visible) {
    const key = formatMonthYear(m.date);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(m);
    else groups.push({ key, items: [m] });
  }

  const toggle = (id: string) =>
    mutate((d) => {
      const m = d.milestones.find((x) => x.id === id);
      if (m) m.done = !m.done;
    });

  const remove = (id: string) =>
    mutate((d) => {
      d.milestones = d.milestones.filter((x) => x.id !== id);
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['All', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button onClick={() => setAdding((v) => !v)} className="btn-ghost">
          <Plus className="h-4 w-4" /> Add milestone
        </button>
      </div>

      {adding && <AddMilestoneForm onClose={() => setAdding(false)} />}

      <div className="card p-5">
        {visible.length === 0 ? (
          <p className="text-sm text-slate-400">No milestones in this category.</p>
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.key}>
                <h3 className="sticky top-0 z-[1] -mx-1 mb-3 bg-white/80 px-1 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 backdrop-blur dark:bg-slate-900/80">
                  {g.key}
                </h3>
                <ol className="relative space-y-1 border-l border-slate-200 pl-5 dark:border-slate-700">
                  {g.items.map((m) => {
                    const overdue = !m.done && (daysUntil(m.date) ?? 0) < 0;
                    const u = urgencyFor(m.date);
                    return (
                      <li key={m.id} className="group relative -ml-[1.45rem] flex items-start gap-3 pl-1">
                        {/* Node / checkbox */}
                        <button
                          onClick={() => toggle(m.id)}
                          aria-label={m.done ? 'Mark not done' : 'Mark done'}
                          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
                            m.done
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : `border-white bg-white shadow ring-1 ring-slate-200 hover:ring-indigo-400 dark:border-slate-900 dark:bg-slate-800 dark:ring-slate-600 ${
                                  overdue ? 'ring-rose-300 dark:ring-rose-700' : ''
                                }`
                          }`}
                        >
                          {m.done ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <span className={`h-2 w-2 rounded-full ${u ? URGENCY_DOT[u] : 'bg-slate-400'}`} />
                          )}
                        </button>

                        {/* Content */}
                        <div
                          className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2 py-1.5 ${
                            overdue ? 'bg-rose-50/70 dark:bg-rose-950/20' : ''
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              m.done
                                ? 'text-slate-400 line-through'
                                : 'text-slate-800 dark:text-slate-100'
                            }`}
                          >
                            {m.label}
                          </span>
                          {m.approx && <VerifyFlag />}
                          <Badge className={CAT_BADGE[m.category]}>{m.category}</Badge>
                          <span className="text-xs tabular-nums text-slate-400">{formatDate(m.date)}</span>
                          {!m.done && <CountdownPill iso={m.date} />}
                          <button
                            onClick={() => remove(m.id)}
                            aria-label="Delete milestone"
                            className="ml-auto rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddMilestoneForm({ onClose }: { onClose: () => void }) {
  const { mutate } = useStore();
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<MilestoneCategory>('Personal');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !date) return;
    mutate((d) => {
      d.milestones.push({ id: uid('mil'), label: label.trim(), date, category, done: false });
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="card flex flex-wrap items-end gap-3 p-4 animate-fade-in">
      <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
        Label
        <input
          className="input"
          placeholder="e.g. Book GMAT slot"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        Date
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        Category
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value as MilestoneCategory)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary">
        Add
      </button>
      <button type="button" onClick={onClose} className="btn-ghost">
        Cancel
      </button>
    </form>
  );
}
