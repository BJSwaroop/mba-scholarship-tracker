import type { Status } from '../../data';
import { ALL_STATUSES, STATUS_BADGE, STATUS_DOT } from '../../lib/status';
import { Badge } from './Badge';

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={STATUS_BADGE[status]}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </Badge>
  );
}

/**
 * An inline editable status. Renders as a colored badge, but the whole thing is
 * a native <select> so it works on mobile and persists immediately on change.
 */
export function StatusSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: Status;
  onChange: (next: Status) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="relative inline-flex">
      <select
        aria-label={ariaLabel ?? 'Status'}
        value={value}
        onChange={(e) => onChange(e.target.value as Status)}
        className={`cursor-pointer appearance-none rounded-full py-0.5 pl-5 pr-7 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 ${STATUS_BADGE[value]}`}
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s} className="bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            {s}
          </option>
        ))}
      </select>
      <span
        className={`pointer-events-none absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${STATUS_DOT[value]}`}
      />
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
