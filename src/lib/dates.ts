// Date + urgency helpers. All comparisons are done at day granularity in the
// user's local timezone so a deadline "today" reads as 0 days, not -1.

export type Urgency = 'overdue' | 'red' | 'amber' | 'green';

/** Midnight (local) of today. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Parse an ISO `YYYY-MM-DD` (or full ISO) string to a local Date, or null. */
export function parseDate(iso?: string): Date | null {
  if (!iso) return null;
  // Treat a bare YYYY-MM-DD as local midnight (avoids UTC off-by-one).
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Whole days from today until `iso`. Negative = in the past. */
export function daysUntil(iso?: string): number | null {
  const target = parseDate(iso);
  if (!target) return null;
  target.setHours(0, 0, 0, 0);
  const ms = target.getTime() - startOfToday().getTime();
  return Math.round(ms / 86_400_000);
}

export function urgencyFor(iso?: string): Urgency | null {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days < 0) return 'overdue';
  if (days < 30) return 'red';
  if (days < 90) return 'amber';
  return 'green';
}

/** A short human countdown: "3 days left", "Today", "Overdue by 5 days". */
export function countdownLabel(iso?: string): string {
  const days = daysUntil(iso);
  if (days === null) return '—';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days < 0) return `Overdue ${Math.abs(days)}d`;
  return `${days} days left`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "12 Sep 2026" — falls back to the raw string for non-date notes. */
export function formatDate(iso?: string): string {
  const d = parseDate(iso);
  if (!d) return iso ?? '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Sep 2026" — month + year only, for grouping headers. */
export function formatMonthYear(iso?: string): string {
  const d = parseDate(iso);
  if (!d) return iso ?? '—';
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function isThisMonth(iso?: string): boolean {
  const d = parseDate(iso);
  if (!d) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export const URGENCY_DOT: Record<Urgency, string> = {
  overdue: 'bg-rose-500',
  red: 'bg-rose-500',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
};

/** Pill classes for a countdown chip, keyed by urgency. */
export const URGENCY_PILL: Record<Urgency, string> = {
  overdue:
    'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900',
  red: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900',
  amber:
    'bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900',
  green:
    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900',
};
