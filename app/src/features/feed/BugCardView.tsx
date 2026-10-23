import { useState } from 'react';
import { Code } from '../../components/Code';
import type { BugCard } from '../../types/card';
import { AskAi } from './AskAi';
import { ResultPanel } from './CardShell';

interface Props {
  card: BugCard;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
}

export function BugCardView({ card, onAnswered, onNext }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  const correct = picked !== null && card.bugLines.includes(picked);

  const pick = (line: number) => {
    if (done) return;
    setPicked(line);
    onAnswered(card.bugLines.includes(line));
  };

  return (
    <>
      <h2 className="mb-1 text-lg leading-snug font-semibold">{card.title}</h2>
      <p className="mb-3 text-sm text-muted">
        {done ? 'Green = bug line.' : 'Tap the line with the bug.'}
      </p>
      <Code
        code={card.code}
        onLineClick={done ? undefined : pick}
        markLine={(n) =>
          !done ? undefined : card.bugLines.includes(n) ? 'answer' : n === picked ? 'picked-wrong' : undefined
        }
      />
      {done && (
        <ResultPanel
          correct={correct}
          explain={card.explain}
          fix={card.fix}
          onNext={onNext}
          ask={<AskAi card={card} myAnswer={`line ${picked}`} />}
        />
      )}
    </>
  );
}
