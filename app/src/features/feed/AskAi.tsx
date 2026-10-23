import { useState } from 'react';
import { buildAskPrompt, buildCheckPrompt, combineQuestions, googleAiUrl } from '../../lib/askAi';
import type { Card } from '../../types/card';

type Mode = 'explain' | 'check';

const MODES: Record<Mode, { tab: string; placeholder: string; quick: string[] }> = {
  explain: {
    tab: "Don't get it",
    placeholder: 'What is not clear? (optional)',
    quick: ['Explain it step by step', 'Show a real-world example', 'How do I spot this in a code review?'],
  },
  check: {
    tab: 'Check my thinking',
    placeholder: 'Write how you think about it: what happens, why it is a bug, how you would fix it…',
    quick: ['Is my reasoning correct?', 'What did I miss?', 'Ask me a harder follow-up question'],
  },
};

interface Props {
  card: Card;
  /** What the user picked, so the AI can explain why it was wrong. */
  myAnswer?: string;
}

export function AskAi({ card, myAnswer }: Props) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [text, setText] = useState<Record<Mode, string>>({ explain: '', check: '' });
  const [picked, setPicked] = useState<Record<Mode, string[]>>({ explain: [], check: [] });

  if (mode === null) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode('explain')}
          className="rounded-lg border border-line py-2.5 text-sm font-medium text-muted hover:text-fg"
        >
          ✦ Don't get it?
        </button>
        <button
          type="button"
          onClick={() => setMode('check')}
          className="rounded-lg border border-line py-2.5 text-sm font-medium text-muted hover:text-fg"
        >
          ✓ Check my thinking
        </button>
      </div>
    );
  }

  const cfg = MODES[mode];
  // keep the order of the quick list, not the tap order
  const pickedInOrder = cfg.quick.filter((q) => picked[mode].includes(q));
  const missingReasoning = mode === 'check' && text.check.trim() === '';
  const href =
    mode === 'explain'
      ? googleAiUrl(buildAskPrompt(card, combineQuestions(text.explain, pickedInOrder), myAnswer))
      : googleAiUrl(buildCheckPrompt(card, text.check, combineQuestions('', pickedInOrder), myAnswer));

  const toggle = (q: string) =>
    setPicked((p) => ({
      ...p,
      [mode]: p[mode].includes(q) ? p[mode].filter((x) => x !== q) : [...p[mode], q],
    }));

  return (
    <div className="animate-pop mt-2 rounded-lg border border-line bg-surface p-3">
      <div className="mb-2.5 grid grid-cols-2 gap-1 rounded-lg bg-bg p-1" role="tablist">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={m === mode}
            onClick={() => setMode(m)}
            className={`rounded-md py-1.5 text-xs font-medium transition ${
              m === mode ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'
            }`}
          >
            {MODES[m].tab}
          </button>
        ))}
      </div>
      <textarea
        key={mode}
        value={text[mode]}
        onChange={(e) => setText((t) => ({ ...t, [mode]: e.target.value }))}
        rows={mode === 'check' ? 4 : 2}
        autoFocus
        placeholder={cfg.placeholder}
        className="w-full resize-none rounded-md border border-line bg-bg px-3 py-2 text-[15px] text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cfg.quick.map((q) => {
          const on = picked[mode].includes(q);
          return (
            <button
              key={q}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(q)}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                on ? 'border-accent bg-accent/15 text-accent' : 'border-line text-muted hover:text-fg'
              }`}
            >
              {on ? '✓ ' : ''}
              {q}
            </button>
          );
        })}
      </div>
      {missingReasoning ? (
        <button
          type="button"
          disabled
          className="mt-3 block w-full cursor-not-allowed rounded-lg bg-accent/30 py-2.5 text-center text-sm font-semibold text-bg/70"
        >
          Write your thinking first
        </button>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block w-full rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-bg"
        >
          {mode === 'check' ? 'Check with Google AI ↗' : 'Ask Google AI ↗'}
        </a>
      )}
      <p className="mt-2 text-center text-[11px] text-muted/70">
        Opens Google AI Mode with this card filled in.
      </p>
    </div>
  );
}
