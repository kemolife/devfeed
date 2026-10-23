import { useState } from 'react';
import { requestIssueUrl } from '../../lib/requestCards';
import { useProgressStore } from '../../store/progressStore';

const COUNTS = [10, 20];

export function RequestCards() {
  const filters = useProgressStore((s) => s.filters);
  const [count, setCount] = useState(10);
  const [extra, setExtra] = useState('');

  return (
    <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-left">
      <p className="text-sm font-semibold">Want new cards?</p>
      <p className="mt-1 text-xs text-muted">
        Opens a request on GitHub. New cards arrive within about 2 hours while your Mac is on.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-muted">How many</span>
        {COUNTS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={c === count}
            onClick={() => setCount(c)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              c === count ? 'border-accent bg-accent/15 text-accent' : 'border-line text-muted hover:text-fg'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <input
        value={extra}
        onChange={(e) => setExtra(e.target.value)}
        placeholder="Topics, comma separated (e.g. DMA, CAN bus)"
        className="mt-3 w-full rounded-md border border-line bg-bg px-3 py-2 text-[15px] text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
      />
      {filters.length > 0 && (
        <p className="mt-1.5 text-xs text-muted">Also uses your filters at the top.</p>
      )}

      <a
        href={requestIssueUrl(count, filters, extra)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block w-full rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-bg"
      >
        Request {count} cards on GitHub ↗
      </a>
    </div>
  );
}
