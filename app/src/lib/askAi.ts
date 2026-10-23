import type { Card } from '../types/card';

const DEFAULT_QUESTION = 'I do not fully get this. Explain it step by step, with a small example.';

// Long query strings get cut by some browsers and apps; code cards stay far below this.
const MAX_URL_LENGTH = 2000;

const DEFAULT_CHECK = 'Is my reasoning correct? What did I miss?';

/** The card itself, after the question: a cut URL only loses the end of the code. */
function cardContext(card: Card): string[] {
  switch (card.type) {
    case 'quiz':
      return [
        `Embedded ${card.topic} quiz: ${card.title}`,
        `Correct answer: ${card.options[card.answer] ?? '?'}`,
        ...(card.code ? [card.code] : []),
      ];
    case 'bug':
      return [`Embedded ${card.topic} bug on line ${card.bugLines.join(' or ')}: ${card.title}`, card.code];
    case 'pr':
      return [
        `Firmware PR "${card.pr.title}". Correct review: ${card.pr.verdict === 'approve' ? 'approve' : 'request changes'}.`,
        card.diff,
      ];
    case 'concept':
      return [`Embedded ${card.topic} pattern: ${card.title}`, card.bullets.join(' ')];
  }
}

/**
 * "Don't get it" prompt for Google AI Mode: question first, then the card.
 * No card explanation — Google answers on its own, and the URL limit is small.
 * Only card content and the user's own text go into it — no progress or personal data.
 */
export function buildAskPrompt(card: Card, question: string, myAnswer?: string): string {
  return [
    `${question.trim() || DEFAULT_QUESTION} Answer short, in simple English.`,
    ...(myAnswer ? [`My answer was: ${myAnswer}`] : []),
    ...cardContext(card),
  ].join('\n');
}

/** "Check my thinking" prompt: the user's own reasoning goes first, so it is never cut. */
export function buildCheckPrompt(card: Card, reasoning: string, asks: string, myAnswer?: string): string {
  return [
    `Check my reasoning about this embedded card. ${asks.trim() || DEFAULT_CHECK} Say what is right, what is wrong and what is missing. Be honest and short, in simple English.`,
    `My reasoning: ${reasoning.trim()}`,
    ...(myAnswer ? [`My answer was: ${myAnswer}`] : []),
    ...cardContext(card),
  ].join('\n');
}

/** Own text plus picked quick questions, as one question: "Why? 1) Explain it. 2) Show an example." */
export function combineQuestions(text: string, picked: string[]): string {
  const own = text.trim();
  if (picked.length === 0) return own;
  const end = (q: string) => (/[.?!]$/.test(q) ? q : `${q}.`);
  const list =
    picked.length === 1 ? end(picked[0] ?? '') : picked.map((q, i) => `${i + 1}) ${end(q)}`).join(' ');
  return own ? `${own} ${list}` : list;
}

/** Cuts the URL to max length, never inside a %XX escape. */
function fitUrl(base: string, prompt: string, max: number): string {
  let url = base + encodeURIComponent(prompt);
  if (url.length > max) {
    url = url.slice(0, max);
    url = url.replace(/%[0-9A-F]?$/i, '');
  }
  return url;
}

/** Google Search in AI Mode (udm=50): free, short answers, follow-ups stay in Google. */
export function googleAiUrl(prompt: string): string {
  return fitUrl('https://www.google.com/search?udm=50&q=', prompt, MAX_URL_LENGTH);
}
