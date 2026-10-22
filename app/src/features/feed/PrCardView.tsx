import { useState } from 'react';
import { Code } from '../../components/Code';
import type { PrCard } from '../../types/card';
import { AskClaude } from './AskClaude';
import { ResultPanel } from './CardShell';

type Verdict = PrCard['pr']['verdict'];

interface Props {
  card: PrCard;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
}

export function PrCardView({ card, onAnswered, onNext }: Props) {
  const [picked, setPicked] = useState<Verdict | null>(null);
  const done = picked !== null;
  const correct = picked === card.pr.verdict;

  const pick = (v: Verdict) => {
    if (done) return;
    setPicked(v);
    onAnswered(v === card.pr.verdict);
  };

  const btn = (v: Verdict) => {
    if (!done) return 'border-line bg-surface hover:border-muted/60';
    if (v === card.pr.verdict) return 'border-ok bg-ok/15 text-ok';
    if (v === picked) return 'border-bad bg-bad/15 text-bad';
    return 'border-line bg-surface opacity-50';
  };

  return (
    <>
      <div className="mb-3 rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="rounded bg-ok/15 px-1.5 py-0.5 font-medium text-ok">Open</span>
          <span className="font-mono">@{card.pr.author}</span>
        </div>
        <h2 className="mt-1.5 text-[17px] leading-snug font-semibold">{card.pr.title}</h2>
        <p className="mt-1 text-sm text-muted">{card.pr.body}</p>
      </div>
      <Code code={card.diff} diff />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={done}
          onClick={() => pick('approve')}
          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${btn('approve')}`}
        >
          ✓ Approve
        </button>
        <button
          type="button"
          disabled={done}
          onClick={() => pick('changes')}
          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${btn('changes')}`}
        >
          ↻ Request changes
        </button>
      </div>
      {done && (
        <ResultPanel
          correct={correct}
          heading={
            correct
              ? '✓ Good review'
              : card.pr.verdict === 'changes'
                ? '✗ This PR has a problem'
                : '✗ This PR is fine'
          }
          explain={card.explain}
          onNext={onNext}
          ask={
            <AskClaude
              card={card}
              myAnswer={picked === 'approve' ? 'approve' : 'request changes'}
            />
          }
        />
      )}
    </>
  );
}
