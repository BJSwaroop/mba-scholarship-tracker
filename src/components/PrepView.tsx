import { useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarClock,
  Check,
  ExternalLink,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PrepRoute, ResourceKind, ResourceStatus, TestType } from '../data';
import { daysUntil, formatDate, urgencyFor, URGENCY_DOT } from '../lib/dates';
import { uid, useStore } from '../store';
import { Badge } from './ui/Badge';
import { CountdownPill, VerifyFlag } from './ui/Bits';
import { ProgressBar } from './ui/ProgressBar';

const ROUTES: PrepRoute[] = ['Undecided', 'Waiver-first', 'GMAT', 'GRE'];

const ROUTE_BADGE: Record<PrepRoute, string> = {
  Undecided: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  'Waiver-first': 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
  GMAT: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  GRE: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
};

const KIND_BADGE: Record<ResourceKind, string> = {
  Official: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  Course: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  Books: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  'Practice tests': 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300',
  Free: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
};

const RES_STATUS: ResourceStatus[] = ['To explore', 'Using', 'Done'];

const TEST_DOMAIN: Record<TestType, [number, number]> = {
  GMAT: [205, 805],
  GRE: [260, 340],
};

function confidenceBar(c: number): string {
  if (c < 34) return 'bg-rose-500';
  if (c < 67) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export function PrepView() {
  const { data, mutate } = useStore();
  const tp = data.testPrep;
  const [activeTest, setActiveTest] = useState<TestType>(tp.route === 'GRE' ? 'GRE' : 'GMAT');

  const sections = tp.sections.filter((s) => s.test === activeTest);
  const target = activeTest === 'GMAT' ? tp.targets.gmat : tp.targets.gre;

  const planDone = tp.plan.filter((s) => s.done).length;

  // Group plan steps by phase, preserving seed order.
  const phases = useMemo(() => {
    const out: { phase: string; steps: typeof tp.plan }[] = [];
    for (const s of tp.plan) {
      const last = out[out.length - 1];
      if (last && last.phase === s.phase) last.steps.push(s);
      else out.push({ phase: s.phase, steps: [s] });
    }
    return out;
  }, [tp.plan]);

  return (
    <div className="space-y-6">
      {/* Header: route + targets + key dates */}
      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <BookOpen className="h-5 w-5 text-indigo-500" /> GMAT &amp; GRE preparation
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">
              Chase the <span className="font-medium text-teal-600 dark:text-teal-400">waivers first</span> (Warwick Test
              + Imperial waiver) given your 8.5 CGPA — but keep this plan running as a parallel backup so a test score is
              ready if a waiver falls through.
            </p>
          </div>
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-400">
            Chosen route
            <select
              value={tp.route}
              onChange={(e) => mutate((d) => { d.testPrep.route = e.target.value as PrepRoute; })}
              className={`appearance-none rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 ${ROUTE_BADGE[tp.route]}`}
            >
              {ROUTES.map((r) => (
                <option key={r} value={r} className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TargetCard label="GMAT Focus target" value={tp.targets.gmat.display} sub={`Range ${tp.targets.gmat.range}`} />
          <TargetCard label="GRE target" value={tp.targets.gre.display} sub={`Range ${tp.targets.gre.range}`} />
          <DateCard label="Decide route by" iso={tp.decideBy} />
          <DateCard label="Target test day" iso={tp.targetTestDate} />
        </div>
      </section>

      {/* Test toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Showing:</span>
        {(['GMAT', 'GRE'] as TestType[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTest(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeTest === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section readiness */}
        <section className="card p-5">
          <SectionTitle icon={<Target className="h-4 w-4" />} title={`${activeTest} section readiness`} />
          <p className="mt-1 text-xs text-slate-400">Self-rate your confidence — drag to update.</p>
          <div className="mt-4 space-y-4">
            {sections.map((s) => {
              const idx = tp.sections.indexOf(s);
              return (
                <div key={s.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{s.name}</span>
                    <span className="flex items-center gap-2 text-xs text-slate-400">
                      <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                        target {s.target}
                      </Badge>
                      <span className="tabular-nums">{s.confidence}%</span>
                    </span>
                  </div>
                  <ProgressBar value={s.confidence} barClassName={confidenceBar(s.confidence)} />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={s.confidence}
                    aria-label={`${s.name} confidence`}
                    onChange={(e) =>
                      mutate((d) => { d.testPrep.sections[idx].confidence = Number(e.target.value); })
                    }
                    className="mt-1.5 w-full accent-indigo-600"
                  />
                  <p className="text-[11px] text-slate-400">Scoring range {s.range}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mock tests */}
        <MockPanel activeTest={activeTest} targetScore={target.score} />
      </div>

      {/* Study plan */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <SectionTitle icon={<CalendarClock className="h-4 w-4" />} title="Study plan" />
          <span className="text-xs text-slate-400">
            {planDone}/{tp.plan.length} done
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          A ~10-week schedule (activate if you go the test route). Dates flagged <VerifyFlag /> are approximate.
        </p>
        <div className="mt-4 space-y-5">
          {phases.map((p) => (
            <div key={p.phase}>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
                {p.phase}
              </h4>
              <ol className="space-y-1.5">
                {p.steps.map((s) => {
                  const overdue = !s.done && (daysUntil(s.date) ?? 0) < 0;
                  const u = urgencyFor(s.date);
                  return (
                    <li key={s.id} className="group flex items-start gap-3">
                      <button
                        onClick={() => mutate((d) => { const x = d.testPrep.plan.find((y) => y.id === s.id); if (x) x.done = !x.done; })}
                        aria-label={s.done ? 'Mark not done' : 'Mark done'}
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition ${
                          s.done
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 bg-white hover:border-indigo-400 dark:border-slate-600 dark:bg-slate-800'
                        }`}
                      >
                        {s.done && <Check className="h-3 w-3" />}
                      </button>
                      <div
                        className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2 py-1 ${
                          overdue ? 'bg-rose-50/70 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <span
                          className={`text-sm ${s.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}
                        >
                          {s.label}
                        </span>
                        {s.approx && <VerifyFlag />}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <span className={`h-1.5 w-1.5 rounded-full ${u ? URGENCY_DOT[u] : 'bg-slate-400'}`} />
                          {formatDate(s.date)}
                        </span>
                        {!s.done && <CountdownPill iso={s.date} />}
                        <button
                          onClick={() => mutate((d) => { d.testPrep.plan = d.testPrep.plan.filter((y) => y.id !== s.id); })}
                          aria-label="Delete step"
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
        <AddStepForm />
      </section>

      {/* Resources */}
      <ResourcesPanel />
    </div>
  );
}

// --- Mock tests -------------------------------------------------------------

function MockPanel({ activeTest, targetScore }: { activeTest: TestType; targetScore: number }) {
  const { data, mutate } = useStore();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [score, setScore] = useState('');

  const mocks = data.testPrep.mocks
    .filter((m) => m.test === activeTest && typeof m.score === 'number')
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));

  const chartData = mocks.map((m, i) => ({ name: m.label || `#${i + 1}`, score: m.score as number }));
  const [lo, hi] = TEST_DOMAIN[activeTest];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(score);
    if (!label.trim() || !score || Number.isNaN(n)) return;
    mutate((d) => {
      d.testPrep.mocks.push({ id: uid('mock'), test: activeTest, label: label.trim(), date: date || undefined, score: n });
    });
    setLabel('');
    setDate('');
    setScore('');
    setAdding(false);
  };

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <SectionTitle icon={<TrendingUp className="h-4 w-4" />} title={`${activeTest} mock scores`} />
        <button onClick={() => setAdding((v) => !v)} className="btn-ghost px-2.5 py-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Log mock
        </button>
      </div>

      {chartData.length > 0 ? (
        <div className="mt-3 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[lo, hi]} tick={{ fontSize: 10, fill: '#94a3b8' }} width={42} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,.15)' }} />
              <ReferenceLine y={targetScore} stroke="#6366f1" strokeDasharray="4 4" label={{ value: `target ${targetScore}`, fontSize: 10, fill: '#6366f1', position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-400 dark:bg-slate-800/50">
          No {activeTest} mocks logged yet. Take a free official practice exam and log the score to start your trend.
        </p>
      )}

      {adding && (
        <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <label className="flex flex-1 flex-col gap-1 text-[11px] font-medium text-slate-500">
            Mock
            <input className="input py-1.5" placeholder="Official Practice 1" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus />
          </label>
          <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-500">
            Date
            <input className="input py-1.5" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="flex w-24 flex-col gap-1 text-[11px] font-medium text-slate-500">
            Score
            <input className="input py-1.5" type="number" placeholder={String(targetScore)} value={score} onChange={(e) => setScore(e.target.value)} />
          </label>
          <button type="submit" className="btn-primary py-1.5">Save</button>
        </form>
      )}

      {mocks.length > 0 && (
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
          {mocks.map((m) => (
            <li key={m.id} className="group flex items-center gap-3 py-2 text-sm">
              <span className="font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">{m.score}</span>
              <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">{m.label}</span>
              {m.date && <span className="text-xs text-slate-400">{formatDate(m.date)}</span>}
              <button
                onClick={() => mutate((d) => { d.testPrep.mocks = d.testPrep.mocks.filter((x) => x.id !== m.id); })}
                aria-label="Delete mock"
                className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// --- Resources --------------------------------------------------------------

function ResourcesPanel() {
  const { data, mutate } = useStore();
  const groups: { key: string; test: 'GMAT' | 'GRE' | 'Both' }[] = [
    { key: 'GMAT resources', test: 'GMAT' },
    { key: 'GRE resources', test: 'GRE' },
    { key: 'Both', test: 'Both' },
  ];

  return (
    <section className="card p-5">
      <SectionTitle icon={<BookOpen className="h-4 w-4" />} title="Resources" />
      <div className="mt-4 space-y-5">
        {groups.map((g) => {
          const items = data.testPrep.resources.filter((r) => r.test === g.test);
          if (items.length === 0) return null;
          return (
            <div key={g.key}>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{g.key}</h4>
              <div className="grid gap-2.5 md:grid-cols-2">
                {items.map((r) => {
                  const idx = data.testPrep.resources.indexOf(r);
                  return (
                    <div key={r.id} className="group rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r.name}</span>
                          <Badge className={KIND_BADGE[r.kind]}>{r.kind}</Badge>
                        </div>
                        <button
                          onClick={() => mutate((d) => { d.testPrep.resources = d.testPrep.resources.filter((x) => x.id !== r.id); })}
                          aria-label="Delete resource"
                          className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {r.notes && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{r.notes}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {r.cost && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                            {r.cost}
                          </span>
                        )}
                        {r.link && (
                          <a
                            href={r.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            Open <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <select
                          value={r.status}
                          aria-label={`${r.name} status`}
                          onChange={(e) => mutate((d) => { d.testPrep.resources[idx].status = e.target.value as ResourceStatus; })}
                          className="ml-auto rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-600 outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {RES_STATUS.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <AddResourceForm />
    </section>
  );
}

function AddResourceForm() {
  const { mutate } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [test, setTest] = useState<'GMAT' | 'GRE' | 'Both'>('GMAT');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate((d) => {
      d.testPrep.resources.push({ id: uid('pres'), name: name.trim(), test, kind: 'Free', link: link.trim() || undefined, status: 'To explore' });
    });
    setName('');
    setLink('');
    setOpen(false);
  };

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost mt-4">
        <Plus className="h-4 w-4" /> Add resource
      </button>
    );

  return (
    <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
      <label className="flex flex-1 flex-col gap-1 text-[11px] font-medium text-slate-500">
        Name
        <input className="input py-1.5" value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="Resource name" />
      </label>
      <label className="flex flex-1 flex-col gap-1 text-[11px] font-medium text-slate-500">
        Link
        <input className="input py-1.5" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" />
      </label>
      <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-500">
        Test
        <select className="input py-1.5" value={test} onChange={(e) => setTest(e.target.value as 'GMAT' | 'GRE' | 'Both')}>
          <option>GMAT</option>
          <option>GRE</option>
          <option>Both</option>
        </select>
      </label>
      <button type="submit" className="btn-primary py-1.5">Add</button>
      <button type="button" onClick={() => setOpen(false)} className="btn-ghost py-1.5">Cancel</button>
    </form>
  );
}

// --- Add study-plan step ----------------------------------------------------

function AddStepForm() {
  const { data, mutate } = useStore();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [phase, setPhase] = useState('');

  const phaseOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const s of data.testPrep.plan) seen.add(s.phase);
    return [...seen];
  }, [data.testPrep.plan]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !date) return;
    mutate((d) => {
      d.testPrep.plan.push({ id: uid('pstep'), phase: phase || phaseOptions[0] || 'Custom', date, label: label.trim(), done: false });
    });
    setLabel('');
    setDate('');
    setOpen(false);
  };

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost mt-4">
        <Plus className="h-4 w-4" /> Add step
      </button>
    );

  return (
    <form onSubmit={submit} className="mt-4 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
      <label className="flex flex-1 flex-col gap-1 text-[11px] font-medium text-slate-500">
        Step
        <input className="input py-1.5" value={label} onChange={(e) => setLabel(e.target.value)} autoFocus placeholder="e.g. Redo Quant error log" />
      </label>
      <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-500">
        Date
        <input className="input py-1.5" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-500">
        Phase
        <select className="input py-1.5" value={phase} onChange={(e) => setPhase(e.target.value)}>
          {phaseOptions.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-primary py-1.5">Add</button>
      <button type="button" onClick={() => setOpen(false)} className="btn-ghost py-1.5">Cancel</button>
    </form>
  );
}

// --- small shared bits ------------------------------------------------------

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      <span className="text-indigo-500">{icon}</span>
      {title}
    </h3>
  );
}

function TargetCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/40">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

function DateCard({ label, iso }: { label: string; iso: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/40">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">
        {formatDate(iso)}
        <VerifyFlag />
      </p>
      <div className="mt-1">
        <CountdownPill iso={iso} />
      </div>
    </div>
  );
}
