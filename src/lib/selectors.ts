import type { AppData, Milestone, School } from '../data';
import { daysUntil, isThisMonth, parseDate } from './dates';
import { isDoneStatus } from './status';

export interface ProgressStat {
  label: string;
  done: number;
  total: number;
  pct: number;
}

function pct(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

/** Per-category and overall completion. */
export function computeProgress(data: AppData): { overall: ProgressStat; parts: ProgressStat[] } {
  const tasksDone = data.tasks.filter((t) => t.done).length;
  const milestonesDone = data.milestones.filter((m) => m.done).length;
  const essaysDone = data.essays.filter((e) => isDoneStatus(e.status)).length;
  const appsDone = data.schools.filter((s) => isDoneStatus(s.status)).length;

  const parts: ProgressStat[] = [
    { label: 'Applications', done: appsDone, total: data.schools.length, pct: pct(appsDone, data.schools.length) },
    { label: 'Essays', done: essaysDone, total: data.essays.length, pct: pct(essaysDone, data.essays.length) },
    { label: 'Tasks', done: tasksDone, total: data.tasks.length, pct: pct(tasksDone, data.tasks.length) },
    {
      label: 'Milestones',
      done: milestonesDone,
      total: data.milestones.length,
      pct: pct(milestonesDone, data.milestones.length),
    },
  ];

  const done = tasksDone + milestonesDone + essaysDone + appsDone;
  const total =
    data.tasks.length + data.milestones.length + data.essays.length + data.schools.length;

  return {
    overall: { label: 'Overall', done, total, pct: pct(done, total) },
    parts,
  };
}

/** Upcoming, not-done milestones sorted soonest-first. */
export function upcomingMilestones(data: AppData): Milestone[] {
  return data.milestones
    .filter((m) => !m.done && (daysUntil(m.date) ?? -1) >= 0)
    .sort((a, b) => (parseDate(a.date)?.getTime() ?? 0) - (parseDate(b.date)?.getTime() ?? 0));
}

/** The next upcoming round date for a school (fallback: its earliest round). */
export function nearestSchoolDeadline(school: School): string | undefined {
  const sorted = [...school.rounds].sort(
    (a, b) => (parseDate(a.date)?.getTime() ?? 0) - (parseDate(b.date)?.getTime() ?? 0),
  );
  const next = sorted.find((r) => (daysUntil(r.date) ?? -1) >= 0);
  return (next ?? sorted[0])?.date;
}

export interface AgendaItem {
  id: string;
  date: string;
  label: string;
  kind: 'Milestone' | 'Task';
}

/** Everything due in the current calendar month that isn't done yet. */
export function dueThisMonth(data: AppData): AgendaItem[] {
  const items: AgendaItem[] = [];
  for (const m of data.milestones) {
    if (!m.done && isThisMonth(m.date)) {
      items.push({ id: m.id, date: m.date, label: m.label, kind: 'Milestone' });
    }
  }
  for (const t of data.tasks) {
    if (!t.done && t.due && isThisMonth(t.due)) {
      items.push({ id: t.id, date: t.due, label: t.title, kind: 'Task' });
    }
  }
  return items.sort((a, b) => (parseDate(a.date)?.getTime() ?? 0) - (parseDate(b.date)?.getTime() ?? 0));
}

/** Count of "Separate application" scholarships — the ones easy to miss. */
export function separateApplicationCount(data: AppData): number {
  return data.schools.reduce(
    (n, s) => n + s.scholarships.filter((a) => a.apply === 'Separate application').length,
    0,
  );
}
