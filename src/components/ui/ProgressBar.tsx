export function ProgressBar({
  value,
  className = '',
  barClassName = 'bg-indigo-500',
}: {
  value: number; // 0..100
  className?: string;
  barClassName?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
