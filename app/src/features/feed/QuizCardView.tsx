import { useState } from 'react';
import { Code } from '../../components/Code';
import type { QuizCard } from '../../types/card';
import { AskClaude } from './AskClaude';
import { ResultPanel } from './CardShell';

interface Props {
  card: QuizCard;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
}

export function QuizCardView({ card, onAnswered, onNext }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;

  const pick = (i: number) => {
    if (done) return;
    setPicked(i);
    onAnswered(i === card.answer);
  };

  return (
    <>
      <h2 className="mb-3 text-lg leading-snug font-semibold">{card.title}</h2>
      {card.code && <Code code={card.code} />}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {card.options.map((opt, i) => {
          const state = !done
            ? 'border-line bg-surface hover:border-muted/60'
            : i === card.answer
              ? 'border-ok bg-ok/15 text-ok'
              : i === picked
                ? 'border-bad bg-bad/15 text-bad'
                : 'border-line bg-surface opacity-50';
          return (
            <button
              key={i}
              type="button"
              disabled={done}
              onClick={() => pick(i)}
              className={`rounded-xl border px-3 py-3 text-left font-mono text-[13px] transition ${state}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {done && (
        <ResultPanel
          correct={picked === card.answer}
          explain={card.explain}
          onNext={onNext}
          ask={<AskClaude card={card} myAnswer={card.options[picked]} />}
        />
      )}
    </>
  );
}
