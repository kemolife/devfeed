import { deck } from '../../lib/deck';
import { useProgressStore } from '../../store/progressStore';

interface Props {
  answered: number;
  goal: number;
}

export function FeedHeader({ answered, goal }: Props) {
  const filters = useProgressStore((s) => s.filters);
  const toggleFilter = useProgressStore((s) => s.toggleFilter);
  const clearFilters = useProgressStore((s) => s.clearFilters);
  const streak = useProgressStore((s) => s.streak.days);
  const pct = Math.min(100, Math.round((answered / goal) * 100));

  return (
    <header className="fixed inset-x-0 top-0 z-10 border-b border-line/60 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto max-w-xl px-4 pt-3 pb-2.5">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[15px] font-bold tracking-tight">
            bit<span className="text-accent">feed</span>
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-label="Daily goal">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="font-mono text-xs text-muted tabular-nums">
            {Math.min(answered, goal)}/{goal}
          </span>
          {streak > 0 && <span className="text-xs text-muted">🔥 {streak}</span>}
        </div>
        <div className="no-scrollbar -mx-4 mt-2.5 flex gap-1.5 overflow-x-auto px-4">
          <Chip active={filters.length === 0} onClick={clearFilters} label="All" />
          {deck.filters.map((f) => (
            <Chip
              key={f.key}
              active={filters.includes(f.key)}
              onClick={() => toggleFilter(f.key)}
              label={f.label}
            />
          ))}
        </div>
      </div>
    </header>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
        active ? 'border-accent bg-accent text-bg' : 'border-line text-muted hover:text-fg'
      }`}
    >
      {label}
    </button>
  );
}
