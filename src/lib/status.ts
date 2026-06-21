import type { ApplyType, SchoolType, Status } from '../data';

// All class strings are written out in full (no string interpolation) so
// Tailwind's content scanner keeps them in the build.

export const ALL_STATUSES: Status[] = [
  'Not started',
  'In progress',
  'Submitted',
  'Interview',
  'Admitted',
  'Funded',
  'Rejected',
];

/** Badge styling per status — grey → blue → indigo → amber → green → red. */
export const STATUS_BADGE: Record<Status, string> = {
  'Not started':
    'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  'In progress':
    'bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-900',
  Submitted:
    'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-900',
  Interview:
    'bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900',
  Admitted:
    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900',
  Funded:
    'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900',
  Rejected:
    'bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900',
};

/** A solid dot color per status, for compact rows. */
export const STATUS_DOT: Record<Status, string> = {
  'Not started': 'bg-slate-400',
  'In progress': 'bg-blue-500',
  Submitted: 'bg-indigo-500',
  Interview: 'bg-amber-500',
  Admitted: 'bg-emerald-500',
  Funded: 'bg-emerald-500',
  Rejected: 'bg-rose-500',
};

/** Hex values for charts (recharts can't read Tailwind classes). */
export const STATUS_HEX: Record<Status, string> = {
  'Not started': '#94a3b8',
  'In progress': '#3b82f6',
  Submitted: '#6366f1',
  Interview: '#f59e0b',
  Admitted: '#10b981',
  Funded: '#059669',
  Rejected: '#f43f5e',
};

export const SCHOOL_TYPE_BADGE: Record<SchoolType, string> = {
  'Chevening core':
    'bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-900',
  'India backup':
    'bg-teal-100 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:ring-teal-900',
  'Scholarship-or-nothing reach':
    'bg-purple-100 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:ring-purple-900',
};

/** Apply-type badge — "Separate application" is intentionally loud. */
export const APPLY_BADGE: Record<ApplyType, string> = {
  Automatic:
    'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  'Separate application':
    'bg-rose-50 text-rose-700 ring-1 ring-rose-300 font-semibold dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-800',
};

const DONE_STATUSES: Status[] = ['Submitted', 'Interview', 'Admitted', 'Funded'];

/** Does a status count as "completed" for progress math? */
export function isDoneStatus(s: Status): boolean {
  return DONE_STATUSES.includes(s);
}

/** Has any work started on this status? */
export function isStartedStatus(s: Status): boolean {
  return s !== 'Not started';
}
