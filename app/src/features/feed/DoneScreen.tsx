import { useProgressStore } from '../../store/progressStore';
import { weakPatterns } from './buildQueue';
import { RequestCards } from './RequestCards';
import { deck } from '../../lib/deck';

interface Props {
  index: number;
  hasMore: boolean;
  onMore: () => void;
}

export function DoneScreen({ index, hasMore, onMore }: Props) {
  const today = useProgressStore((s) => s.today);
  const tagMisses = useProgressStore((s) => s.tagMisses);
  const weak = weakPatterns(tagMisses);
  const pct = today.answered ? Math.round((today.correct / today.answered) * 100) : 0;

  return (
    <section
      id={`card-${index}`}
      className="flex min-h-dvh snap-start flex-col justify-center px-4 pt-32 pb-12"
    >
      <div className="mx-auto w-full max-w-xl text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-ok/15 text-3xl text-ok">
          ✓
        </div>
        <h2 className="text-2xl font-bold">Done for today</h2>
        <p className="mt-1 text-muted">
          {today.correct}/{today.answered} correct · {pct}%
        </p>

        {weak.length > 0 && (
          <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-left">
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
              Patterns to train
            </p>
            <ul className="space-y-1.5">
              {weak.map(([tag, n]) => (
                <li key={tag} className="flex justify-between font-mono text-sm">
                  <span>#{tag}</span>
                  <span className="text-bad">{n} missed</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Missed cards come back first next time.</p>
          </div>
        )}

        <p className="mt-6 text-sm text-muted">Good session. Close the app and go build something.</p>
        {hasMore ? (
          <button
            type="button"
            onClick={onMore}
            className="mt-4 rounded-lg border border-line px-4 py-2 text-sm text-muted hover:text-fg"
          >
            Keep going (+10)
          </button>
        ) : (
          <p className="mt-4 text-sm text-muted">You have seen every card for this filter.</p>
        )}
        {deck.requests && <RequestCards />}
      </div>
    </section>
  );
}
