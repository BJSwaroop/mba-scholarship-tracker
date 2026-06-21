import { useMemo, useState } from 'react';
import { Plus, Trash2, UserCheck } from 'lucide-react';
import { formatDate, parseDate } from '../lib/dates';
import { uid, useStore } from '../store';
import { Badge } from './ui/Badge';
import { CountdownPill } from './ui/Bits';
import { StatusSelect } from './ui/StatusControl';

export function TasksView() {
  const { data, mutate } = useStore();
  const [adding, setAdding] = useState(false);

  const tasks = useMemo(() => {
    return [...data.tasks].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1; // undone first
      const da = parseDate(a.due)?.getTime() ?? Infinity;
      const db = parseDate(b.due)?.getTime() ?? Infinity;
      return da - db;
    });
  }, [data.tasks]);

  const doneCount = data.tasks.filter((t) => t.done).length;

  const toggle = (id: string) =>
    mutate((d) => {
      const t = d.tasks.find((x) => x.id === id);
      if (t) t.done = !t.done;
    });
  const removeTask = (id: string) =>
    mutate((d) => {
      d.tasks = d.tasks.filter((x) => x.id !== id);
    });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Tasks */}
      <section className="lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Tasks <span className="text-slate-400">· {doneCount}/{data.tasks.length} done</span>
          </h2>
          <button onClick={() => setAdding((v) => !v)} className="btn-ghost">
            <Plus className="h-4 w-4" /> Add task
          </button>
        </div>

        {adding && <AddTaskForm onClose={() => setAdding(false)} />}

        <div className="card mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.length === 0 && <p className="p-5 text-sm text-slate-400">No tasks yet.</p>}
          {tasks.map((t) => (
            <div key={t.id} className="group flex items-center gap-3 px-4 py-3">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggle(t.id)}
                aria-label={t.title}
                className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${t.done ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                  {t.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t.category}</Badge>
                  {t.due && <span className="text-xs text-slate-400">{formatDate(t.due)}</span>}
                  {!t.done && t.due && <CountdownPill iso={t.due} />}
                </div>
              </div>
              <button
                onClick={() => removeTask(t.id)}
                aria-label="Delete task"
                className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Recommenders */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <UserCheck className="h-4 w-4 text-indigo-500" /> Recommenders
          </h2>
        </div>
        <div className="space-y-3">
          {data.recommenders.map((r, ri) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.relationship}</p>
                </div>
                <StatusSelect
                  value={r.status}
                  ariaLabel={`${r.name} status`}
                  onChange={(next) => mutate((d) => { d.recommenders[ri].status = next; })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AddTaskForm({ onClose }: { onClose: () => void }) {
  const { mutate } = useStore();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [category, setCategory] = useState('General');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutate((d) => {
      d.tasks.push({ id: uid('tsk'), title: title.trim(), due: due || undefined, category: category.trim() || 'General', done: false });
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="card flex flex-wrap items-end gap-3 p-4 animate-fade-in">
      <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-500">
        Task
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="What needs doing?" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
        Due
        <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      </label>
      <label className="flex w-36 flex-col gap-1 text-xs font-medium text-slate-500">
        Category
        <input className="input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
      </label>
      <button type="submit" className="btn-primary">Add</button>
      <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
    </form>
  );
}
