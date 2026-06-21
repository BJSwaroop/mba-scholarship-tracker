import { useState } from 'react';
import { AlertCircle, Banknote, CalendarDays, ExternalLink, Landmark } from 'lucide-react';
import { formatDate } from '../lib/dates';
import { useStore } from '../store';
import { ApplyBadge, CountdownPill, VerifyFlag } from './ui/Bits';
import { StatusSelect } from './ui/StatusControl';

export function ScholarshipsView() {
  const { data, mutate } = useStore();
  const [onlySeparate, setOnlySeparate] = useState(false);

  const schoolAwards = data.schools.flatMap((s, si) =>
    s.scholarships.map((a, ci) => ({ schoolName: s.name, a, si, ci })),
  );
  const filtered = onlySeparate
    ? schoolAwards.filter((x) => x.a.apply === 'Separate application')
    : schoolAwards;

  const separateTotal = schoolAwards.filter((x) => x.a.apply === 'Separate application').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900/60">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">{separateTotal} separate-application</span> scholarships need their own
            forms/essays — don&apos;t miss them.
          </span>
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={onlySeparate}
            onChange={(e) => setOnlySeparate(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
          />
          Show only separate-application
        </label>
      </div>

      {/* Group A — school scholarships */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Banknote className="h-4 w-4 text-indigo-500" /> School scholarships
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {filtered.map(({ schoolName, a, si, ci }) => {
            const separate = a.apply === 'Separate application';
            return (
              <div
                key={a.id}
                className={`card p-4 ${separate ? 'ring-1 ring-rose-200 dark:ring-rose-900/60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">{schoolName}</p>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{a.name}</h3>
                  </div>
                  <StatusSelect
                    value={a.status}
                    ariaLabel={`${a.name} status`}
                    onChange={(next) => mutate((d) => { d.schools[si].scholarships[ci].status = next; })}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ApplyBadge apply={a.apply} />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{a.amount}</span>
                </div>
                {a.deadline && (
                  <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatDate(a.deadline)}
                    {a.approx && <VerifyFlag />}
                    <CountdownPill iso={a.deadline} />
                  </p>
                )}
                {a.notes && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{a.notes}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Group B — India loan-scholarships */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Landmark className="h-4 w-4 text-teal-500" /> India loan-scholarships
          <span className="font-normal normal-case text-slate-400">· stackable, low / zero interest · apply after admits</span>
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {data.loanScholarships.map((l, li) => (
            <div key={l.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{l.name}</h3>
                <StatusSelect
                  value={l.status}
                  ariaLabel={`${l.name} status`}
                  onChange={(next) => mutate((d) => { d.loanScholarships[li].status = next; })}
                />
              </div>
              <p className="mt-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400">{l.amount}</p>
              <dl className="mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  <dt className="inline font-medium text-slate-600 dark:text-slate-300">Eligibility: </dt>
                  <dd className="inline">{l.eligibility}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-600 dark:text-slate-300">Window: </dt>
                  <dd className="inline">{l.window}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-slate-600 dark:text-slate-300">Process: </dt>
                  <dd className="inline">{l.process}</dd>
                </div>
              </dl>
              {l.link && (
                <a
                  href={l.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Apply / info <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
