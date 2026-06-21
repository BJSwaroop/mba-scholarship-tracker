import { useState } from 'react';
import { CalendarDays, Clock, ExternalLink, Layers, PoundSterling, ScrollText } from 'lucide-react';
import type { SchoolType } from '../data';
import { formatDate, urgencyFor, URGENCY_DOT } from '../lib/dates';
import { useStore } from '../store';
import { ApplyBadge, CountdownPill, SchoolTypeBadge, VerifyFlag } from './ui/Bits';
import { StatusSelect } from './ui/StatusControl';

const FILTERS: { label: string; value: 'All' | SchoolType }[] = [
  { label: 'All', value: 'All' },
  { label: 'Chevening core', value: 'Chevening core' },
  { label: 'India backup', value: 'India backup' },
  { label: 'Reach', value: 'Scholarship-or-nothing reach' },
];

export function SchoolsView() {
  const { data, mutate } = useStore();
  const [filter, setFilter] = useState<'All' | SchoolType>('All');

  const schools = data.schools.filter((s) => filter === 'All' || s.type === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {schools.map((s) => {
          const si = data.schools.indexOf(s);
          return (
            <article key={s.id} className="card flex flex-col p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.name}</h3>
                    <SchoolTypeBadge type={s.type} />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{s.program}</p>
                </div>
                <StatusSelect
                  value={s.status}
                  ariaLabel={`${s.name} status`}
                  onChange={(next) => mutate((d) => { d.schools[si].status = next; })}
                />
              </div>

              {/* Facts grid */}
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Fact icon={<Clock className="h-3.5 w-3.5" />} label="Duration">
                  {s.durationMonths} months
                </Fact>
                <Fact icon={<PoundSterling className="h-3.5 w-3.5" />} label="Tuition">
                  {s.tuition}
                </Fact>
                {s.cheveningGap && (
                  <Fact icon={<Layers className="h-3.5 w-3.5" />} label="Chevening gap" highlight>
                    {s.cheveningGap}
                  </Fact>
                )}
                <Fact icon={<ScrollText className="h-3.5 w-3.5" />} label="GMAT policy" full={!s.cheveningGap}>
                  {s.gmatPolicy}
                </Fact>
              </dl>

              {s.notes && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  {s.notes}
                </p>
              )}

              {/* Rounds */}
              <div className="mt-4">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" /> Application rounds
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {s.rounds.map((r) => {
                    const u = urgencyFor(r.date);
                    return (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800/60"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u ? URGENCY_DOT[u] : 'bg-slate-400'}`} />
                        <span className="font-medium text-slate-700 dark:text-slate-200">{r.name}</span>
                        <span className="text-slate-400">{formatDate(r.date)}</span>
                        {r.approx && <VerifyFlag />}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Scholarships */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Scholarships</h4>
                <div className="mt-2 space-y-2">
                  {s.scholarships.map((a) => {
                    const ci = s.scholarships.indexOf(a);
                    const separate = a.apply === 'Separate application';
                    return (
                      <div
                        key={a.id}
                        className={`rounded-xl border p-3 ${
                          separate
                            ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/60 dark:bg-rose-950/20'
                            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.name}</span>
                            <ApplyBadge apply={a.apply} />
                          </div>
                          <StatusSelect
                            value={a.status}
                            ariaLabel={`${a.name} status`}
                            onChange={(next) => mutate((d) => { d.schools[si].scholarships[ci].status = next; })}
                          />
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium text-slate-600 dark:text-slate-300">{a.amount}</span>
                          {a.deadline && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(a.deadline)}
                              {a.approx && <VerifyFlag />}
                              <CountdownPill iso={a.deadline} className="ml-1" />
                            </span>
                          )}
                        </div>
                        {a.notes && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{a.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {s.link && (
                <a
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Programme page <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  children,
  highlight,
  full,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-sm ${
          highlight ? 'font-semibold text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        {children}
      </dd>
    </div>
  );
}
