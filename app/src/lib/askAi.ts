import type { Card } from '../types/card';

const DEFAULT_QUESTION = 'I do not fully get this. Explain it step by step, with a small example.';

// Long query strings get cut by some browsers and apps; code cards stay far below this.
const MAX_URL_LENGTH = 2000;

/**
 * Prompt for Google AI Mode: question first, so a cut URL only loses the end of the code.
 * No card explanation — Google answers on its own, and the URL limit is small.
 * Only card content and the user's own question go into it — no progress or personal data.
 */
export function buildAskPrompt(card: Card, question: string, myAnswer?: string): string {
  const parts: string[] = [`${question.trim() || DEFAULT_QUESTION} Answer short, in simple English.`];

  switch (card.type) {
    case 'quiz':
      parts.push(`Embedded ${card.topic} quiz: ${card.title}`);
      parts.push(`Correct answer: ${card.options[card.answer] ?? '?'}`);
      if (card.code) parts.push(card.code);
      break;
    case 'bug':
      parts.push(`Embedded ${card.topic} bug on line ${card.bugLines.join(' or ')}: ${card.title}`);
      parts.push(card.code);
      break;
    case 'pr':
      parts.push(
        `Firmware PR "${card.pr.title}". Correct review: ${card.pr.verdict === 'approve' ? 'approve' : 'request changes'}.`,
      );
      parts.push(card.diff);
      break;
    case 'concept':
      parts.push(`Embedded ${card.topic} pattern: ${card.title}`);
      parts.push(card.bullets.join(' '));
      break;
  }

  if (myAnswer) parts.splice(1, 0, `My answer was: ${myAnswer}`);
  return parts.join('\n');
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
