import type { ReactNode } from 'react';
import { Code } from '../../components/Code';
import type { Card } from '../../types/card';

const TOPIC_LABEL: Record<Card['topic'], string> = {
  rust: 'Rust',
  c: 'C',
  cpp: 'C++',
  embedded: 'Embedded',
  electronics: 'Electronics',
  php: 'PHP',
  symfony: 'Symfony',
  js: 'JavaScript',
  jquery: 'jQuery',
  git: 'Git',
};

const TYPE_LABEL: Record<Card['type'], string> = {
  quiz: 'Quiz',
  bug: 'Spot the bug',
  pr: 'PR review',
  concept: 'Pattern',
};

interface CardShellProps {
  card: Card;
  index: number;
  children: ReactNode;
}

export function CardShell({ card, index, children }: CardShellProps) {
  return (
    <section
      id={`card-${index}`}
      className="flex min-h-dvh snap-start flex-col justify-center px-4 pt-32 pb-12"
    >
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium">
          <span className="rounded-full bg-accent/15 px-2.5 py-1 text-accent">
            {TYPE_LABEL[card.type]}
          </span>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-muted">
            {TOPIC_LABEL[card.topic]}
          </span>
          <span className="ml-auto flex gap-1" aria-label={`Difficulty ${card.difficulty} of 3`}>
            {[1, 2, 3].map((d) => (
              <span
                key={d}
                className={`h-1.5 w-4 rounded-full ${d <= card.difficulty ? 'bg-accent' : 'bg-line'}`}
              />
            ))}
          </span>
        </div>
        {children}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {card.tags.map((t) => (
            <span key={t} className="font-mono text-[11px] text-muted/70">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ResultPanelProps {
  correct: boolean | null;
  heading?: string;
  explain: string;
  fix?: string;
  /** Heading above the fix code. */
  fixLabel?: string;
  onNext: () => void;
  /** Shown under the Next button, e.g. the Ask AI button. */
  ask?: ReactNode;
  children?: ReactNode;
}

export function ResultPanel({
  correct,
  heading,
  explain,
  fix,
  fixLabel = 'Fix',
  onNext,
  ask,
  children,
}: ResultPanelProps) {
  const tone =
    correct === null ? 'border-line' : correct ? 'border-ok/50 bg-ok/5' : 'border-bad/50 bg-bad/5';
  return (
    <div className={`animate-pop mt-4 rounded-xl border p-4 ${tone}`}>
      {correct !== null && (
        <p className={`mb-1.5 font-semibold ${correct ? 'text-ok' : 'text-bad'}`}>
          {heading ?? (correct ? '✓ Correct' : '✗ Not quite')}
        </p>
      )}
      <p className="text-[15px] leading-relaxed text-fg/90">{explain}</p>
      {children}
      {fix && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold tracking-wide text-ok uppercase">{fixLabel}</p>
          <Code code={fix} />
        </div>
      )}
      <button
        type="button"
        onClick={onNext}
        className="mt-4 w-full rounded-lg bg-fg py-2.5 text-sm font-semibold text-bg active:scale-[0.99]"
      >
        Next ↓
      </button>
      {ask}
    </div>
  );
}
