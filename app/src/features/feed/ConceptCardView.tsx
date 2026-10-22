import { useState } from 'react';
import type { ConceptCard } from '../../types/card';
import { AskClaude } from './AskClaude';

interface Props {
  card: ConceptCard;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
}

export function ConceptCardView({ card, onAnswered, onNext }: Props) {
  const [done, setDone] = useState(false);

  return (
    <>
      <h2 className="mb-4 text-xl leading-snug font-bold">{card.title}</h2>
      <ol className="space-y-3">
        {card.bullets.map((b, i) => (
          <li key={i} className="flex gap-3 rounded-xl border border-line bg-surface p-3.5">
            <span className="font-mono text-sm font-bold text-accent">{i + 1}</span>
            <span className="text-[15px] leading-relaxed">{b}</span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => {
          if (!done) {
            setDone(true);
            onAnswered(true);
          }
          onNext();
        }}
        className="mt-4 w-full rounded-lg bg-fg py-2.5 text-sm font-semibold text-bg"
      >
        Got it ↓
      </button>
      <AskClaude card={card} />
    </>
  );
}
