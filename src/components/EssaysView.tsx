import { useState } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import type { Essay, Status } from '../data';
import { uid, useStore } from '../store';
import { STATUS_DOT } from '../lib/status';

// Essays only meaningfully move through these three states.
const ESSAY_STATUSES: Status[] = ['Not started', 'In progress', 'Submitted'];

const COLUMN_ACCENT: Record<string, string> = {
  'Not started': 'border-t-slate-300',
  'In progress': 'border-t-blue-400',
  Submitted: 'border-t-indigo-500',
};

export function EssaysView() {
  const { data, mutate } = useStore();
  const [adding, setAdding] = useState(false);

  const byStatus = (s: Status) =>
    data.essays.filter((e) => (ESSAY_STATUSES.includes(e.status) ? e.status === s : s === 'Not started'));

  const setStatus = (id: string, status: Status) =>
    mutate((d) => {
      const e = d.essays.find((x) => x.id === id);
      if (e) e.status = status;
    });

  const remove = (id: string) =>
    mutate((d) => {
      d.essays = d.essays.filter((x) => x.id !== id);
    });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Themes recur across apps — draft once, reuse everywhere.
        </p>
        <button onClick={() => setAdding((v) => !v)} className="btn-ghost">
          <Plus className="h-4 w-4" /> Add essay
        </button>
      </div>

      {adding && <AddEssayForm onClose={() => setAdding(false)} />}

      <div className="grid gap-4 md:grid-cols-3">
        {ESSAY_STATUSES.map((col) => {
          const items = byStatus(col);
          return (
            <div key={col} className={`card border-t-4 p-4 ${COLUMN_ACCENT[col]}`}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[col]}`} />
                  {col}
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.length === 0 && <p className="py-4 text-center text-xs text-slate-300">Empty</p>}
                {items.map((e) => (
                  <EssayCard key={e.id} essay={e} onMove={(s) => setStatus(e.id, s)} onDelete={() => remove(e.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EssayCard({
  essay,
  onMove,
  onDelete,
}: {
  essay: Essay;
  onMove: (s: Status) => void;
  onDelete: () => void;
}) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-800/60">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{essay.title}</p>
            <p className="text-xs text-slate-400">{essay.forWhom}</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          aria-label="Delete essay"
          className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-rose-950/40"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {essay.wordLimit ? (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            ≤ {essay.wordLimit} words
          </span>
        ) : (
          <span />
        )}
        <select
          aria-label="Move essay"
          value={essay.status}
          onChange={(e) => onMove(e.target.value as Status)}
          className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {ESSAY_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function AddEssayForm({ onClose }: { onClose: () => void }) {
  const { mutate } = useStore();
  const [title, setTitle] = useState('');
  const [forWhom, setForWhom] = useState('');
  const [wordLimit, setWordLimit] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutate((d) => {
      d.essays.push({
        id: uid('ess'),
        title: title.trim(),
        forWhom: forWhom.trim() || 'General',
        wordLimit: wordLimit ? Number(wordLimit) : undefined,
        status: 'Not started',
      });
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="card flex flex-wrap items-end gap-3 p-4 animate-fade-in">
      <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
        Title
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="Essay title" />
      </label>
      <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
        For whom
        <input className="input" value={forWhom} onChange={(e) => setForWhom(e.target.value)} placeholder="School / scholarship" />
      </label>
      <label className="flex w-28 flex-col gap-1 text-xs font-medium text-slate-500">
        Word limit
        <input className="input" type="number" min="0" value={wordLimit} onChange={(e) => setWordLimit(e.target.value)} placeholder="500" />
      </label>
      <button type="submit" className="btn-primary">Add</button>
      <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
    </form>
  );
}
