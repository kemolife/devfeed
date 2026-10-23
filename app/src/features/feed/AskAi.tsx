import { useState } from 'react';
import { buildAskPrompt, googleAiUrl } from '../../lib/askAi';
import type { Card } from '../../types/card';

const QUICK_QUESTIONS = [
  'Explain it step by step',
  'Show a real-world example',
  'How do I spot this in a code review?',
];

interface Props {
  card: Card;
  /** What the user picked, so the AI can explain why it was wrong. */
  myAnswer?: string;
}

export function AskAi({ card, myAnswer }: Props) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const href = googleAiUrl(buildAskPrompt(card, question, myAnswer));

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 w-full rounded-lg border border-line py-2.5 text-sm font-medium text-muted hover:text-fg"
      >
        ✦ Don't get it? Ask AI
      </button>
    );
  }

  return (
    <div className="animate-pop mt-2 rounded-lg border border-line bg-surface p-3">
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={2}
        autoFocus
        placeholder="What is not clear? (optional)"
        className="w-full resize-none rounded-md border border-line bg-bg px-3 py-2 text-[15px] text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
      />
      <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuestion(q)}
            className="shrink-0 rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:text-fg"
          >
            {q}
          </button>
        ))}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block w-full rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-bg"
      >
        Ask Google AI ↗
      </a>
      <p className="mt-2 text-center text-[11px] text-muted/70">
        Opens Google AI Mode with this card filled in.
      </p>
    </div>
  );
}
