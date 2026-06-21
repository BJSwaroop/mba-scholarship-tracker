import {
  AlertTriangle,
  CalendarClock,
  GraduationCap,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Status } from '../data';
import { countdownLabel, formatDate, urgencyFor, URGENCY_DOT } from '../lib/dates';
import { STATUS_HEX } from '../lib/status';
import {
  computeProgress,
  dueThisMonth,
  nearestSchoolDeadline,
  separateApplicationCount,
  upcomingMilestones,
} from '../lib/selectors';
import { useStore } from '../store';
import { CountdownPill, VerifyFlag } from './ui/Bits';
import { ProgressBar } from './ui/ProgressBar';
import { StatusSelect } from './ui/StatusControl';

const CATEGORY_BAR: Record<string, string> = {
  Applications: 'bg-sky-500',
  Essays: 'bg-violet-500',
  Tasks: 'bg-emerald-500',
  Milestones: 'bg-amber-500',
};

export function Dashboard({ goView }: { goView: (id: string) => void }) {
  const { data, mutate } = useStore();
  const { overall, parts } = computeProgress(data);
  const upcoming = upcomingMilestones(data);
  const next3 = upcoming.slice(0, 3);
  const month = dueThisMonth(data);
  const separateCount = separateApplicationCount(data);
  const nearest = next3[0];

  // School status distribution for the donut.
  const dist = new Map<Status, number>();
  for (const s of data.schools) dist.set(s.status, (dist.get(s.status) ?? 0) + 1);
  const donut = [...dist.entries()].map(([status, value]) => ({ status, value }));

  return (
    <div className="space-y-6">
      {/* Mission strip */}
      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {data.meta.candidate}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{data.meta.goal}</p>
          </div>
          <GraduationCap className="h-9 w-9 shrink-0 text-indigo-500" />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900/60">
            <span className="font-semibold">Constraint:</span> {data.meta.constraint}
          </p>
          <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-900/60">
            <span className="font-semibold">Note:</span> {data.meta.cheveningCap}
          </p>
        </div>
      </section>

      {/* Metric cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          tone="indigo"
          label="Overall progress"
          value={`${overall.pct}%`}
          sub={`${overall.done} of ${overall.total} items done`}
        >
          <ProgressBar value={overall.pct} className="mt-3" />
        </MetricCard>

        <MetricCard
          icon={<GraduationCap className="h-5 w-5" />}
          tone="sky"
          label="Schools tracked"
          value={String(data.schools.length)}
          sub="Chevening, India & reach"
          onClick={() => goView('schools')}
        />

        <MetricCard
          icon={<AlertTriangle className="h-5 w-5" />}
          tone="rose"
          label="Separate applications"
          value={String(separateCount)}
          sub="Scholarships you must not miss"
          onClick={() => goView('scholarships')}
        />

        <MetricCard
          icon={<CalendarClock className="h-5 w-5" />}
          tone="amber"
          label="Nearest deadline"
          value={nearest ? countdownLabel(nearest.date) : '—'}
          sub={nearest ? nearest.label : 'Nothing upcoming'}
          onClick={() => goView('timeline')}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Next 3 deadlines */}
        <section className="card p-5 lg:col-span-2">
          <SectionTitle icon={<CalendarClock className="h-4 w-4" />} title="Next 3 deadlines" />
          {next3.length === 0 ? (
            <Empty>No upcoming deadlines — everything ahead is marked done.</Empty>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {next3.map((m) => {
                const u = urgencyFor(m.date);
                return (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${u ? URGENCY_DOT[u] : 'bg-slate-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {m.label}
                        {m.approx && <VerifyFlag className="ml-1" />}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(m.date)} · {m.category}
                      </p>
                    </div>
                    <CountdownPill iso={m.date} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Progress breakdown */}
        <section className="card p-5">
          <SectionTitle icon={<TrendingUp className="h-4 w-4" />} title="Progress breakdown" />
          <div className="mt-4 space-y-3.5">
            {parts.map((p) => (
              <div key={p.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{p.label}</span>
                  <span className="tabular-nums text-slate-400">
                    {p.done}/{p.total}
                  </span>
                </div>
                <ProgressBar value={p.pct} barClassName={CATEGORY_BAR[p.label] ?? 'bg-indigo-500'} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* School status summary */}
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <SectionTitle icon={<GraduationCap className="h-4 w-4" />} title="Schools at a glance" />
            <button onClick={() => goView('schools')} className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              View all →
            </button>
          </div>
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {data.schools.map((s, i) => {
              const dl = nearestSchoolDeadline(s);
              return (
                <div key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {s.name}
                  </span>
                  <span className="hidden text-xs text-slate-400 sm:block">{s.type}</span>
                  {dl && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarClock className="h-3 w-3" />
                      {formatDate(dl)}
                    </span>
                  )}
                  <StatusSelect
                    value={s.status}
                    ariaLabel={`${s.name} status`}
                    onChange={(next) =>
                      mutate((d) => {
                        d.schools[i].status = next;
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Due this month + donut */}
        <div className="space-y-6">
          <section className="card p-5">
            <SectionTitle icon={<CalendarClock className="h-4 w-4" />} title="Due this month" />
            {month.length === 0 ? (
              <Empty>Nothing due this month.</Empty>
            ) : (
              <ul className="mt-3 space-y-2">
                {month.map((it) => (
                  <li key={it.id} className="flex items-center gap-2 text-sm">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${URGENCY_DOT[urgencyFor(it.date) ?? 'green']}`} />
                    <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">{it.label}</span>
                    <span className="shrink-0 text-xs tabular-nums text-slate-400">{formatDate(it.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {donut.length > 0 && (
            <section className="card p-5">
              <SectionTitle icon={<Target className="h-4 w-4" />} title="Application status" />
              <div className="mt-2 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donut} dataKey="value" nameKey="status" innerRadius={42} outerRadius={66} paddingAngle={2}>
                      {donut.map((d) => (
                        <Cell key={d.status} fill={STATUS_HEX[d.status]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,.15)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                {donut.map((d) => (
                  <span key={d.status} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_HEX[d.status] }} />
                    {d.status} ({d.value})
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// --- small local helpers ---------------------------------------------------

const TONE: Record<string, string> = {
  indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300',
  sky: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:text-sky-300',
  rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300',
  amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300',
};

function MetricCard({
  icon,
  tone,
  label,
  value,
  sub,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  tone: keyof typeof TONE;
  label: string;
  value: string;
  sub: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`card p-4 text-left ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${TONE[tone]}`}>{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{sub}</p>
      {children}
    </Tag>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
      <span className="text-indigo-500">{icon}</span>
      {title}
    </h2>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-sm text-slate-400">{children}</p>;
}
