import { AlertCircle, BadgeCheck } from 'lucide-react';
import type { ApplyType, SchoolType } from '../../data';
import { countdownLabel, urgencyFor, URGENCY_PILL, type Urgency } from '../../lib/dates';
import { APPLY_BADGE, SCHOOL_TYPE_BADGE } from '../../lib/status';
import { Badge } from './Badge';

/** Small "~ verify" flag shown next to approximate dates. */
export function VerifyFlag({ className = '' }: { className?: string }) {
  return (
    <span
      title="Approximate date — please verify on the official site."
      className={`inline-flex cursor-help items-center gap-0.5 rounded px-1 text-[10px] font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400 ${className}`}
    >
      <AlertCircle className="h-3 w-3" />~ verify
    </span>
  );
}

export function SchoolTypeBadge({ type }: { type: SchoolType }) {
  return <Badge className={SCHOOL_TYPE_BADGE[type]}>{type}</Badge>;
}

/** Apply-type badge. "Separate application" is visually loud (the must-not-miss ones). */
export function ApplyBadge({ apply }: { apply: ApplyType }) {
  const separate = apply === 'Separate application';
  return (
    <Badge className={APPLY_BADGE[apply]}>
      {separate ? <AlertCircle className="h-3 w-3" /> : <BadgeCheck className="h-3 w-3" />}
      {apply}
    </Badge>
  );
}

/** A countdown pill colored by urgency (red <30d, amber <90d, green otherwise). */
export function CountdownPill({ iso, className = '' }: { iso?: string; className?: string }) {
  const u: Urgency | null = urgencyFor(iso);
  if (!u) return null;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${URGENCY_PILL[u]} ${className}`}
    >
      {countdownLabel(iso)}
    </span>
  );
}
