import type { Card } from '../types/card';

const TYPE_LABEL: Record<Card['type'], string> = {
  quiz: 'quiz',
  bug: 'spot-the-bug',
  pr: 'pull request review',
  concept: 'pattern summary',
};

const DEFAULT_QUESTION = 'I do not fully get this. Explain it step by step, with a small example.';

// Long query strings get cut by some browsers and apps; code cards stay far below this.
const MAX_URL_LENGTH = 6000;

/**
 * Prompt for claude.ai: the card content, what the user picked, and their question.
 * Only card content and the user's own question go into it — no progress or personal data.
 */
export function buildAskPrompt(card: Card, question: string, myAnswer?: string): string {
  const parts: string[] = [
    `I am an embedded developer learning with a ${TYPE_LABEL[card.type]} card (topic: ${card.topic}).`,
  ];

  switch (card.type) {
    case 'quiz':
      parts.push(`Card: ${card.title}`);
      if (card.code) parts.push('```' + (card.lang ?? '') + '\n' + card.code + '\n```');
      parts.push(`Options: ${card.options.map((o, i) => `${i + 1}) ${o}`).join('  ')}`);
      parts.push(`Correct answer: ${card.options[card.answer] ?? '?'}`);
      parts.push(`Card explanation: ${card.explain}`);
      break;
    case 'bug':
      parts.push(`Card: ${card.title}`);
      parts.push('```' + card.lang + '\n' + card.code + '\n```');
      parts.push(`Bug is on line ${card.bugLines.join(' or ')}.`);
      parts.push(`Card explanation: ${card.explain}`);
      if (card.fix) parts.push('Fix:\n```' + card.lang + '\n' + card.fix + '\n```');
      break;
    case 'pr':
      parts.push(`PR "${card.pr.title}": ${card.pr.body}`);
      parts.push('```diff\n' + card.diff + '\n```');
      parts.push(`Correct review: ${card.pr.verdict === 'approve' ? 'approve' : 'request changes'}.`);
      parts.push(`Card explanation: ${card.explain}`);
      break;
    case 'concept':
      parts.push(`Card: ${card.title}`);
      parts.push(card.bullets.map((b) => `- ${b}`).join('\n'));
      break;
  }

  if (myAnswer) parts.push(`My answer was: ${myAnswer}`);
  parts.push(`My question: ${question.trim() || DEFAULT_QUESTION}`);
  parts.push('Answer in simple English. Short sentences. Show code where it helps.');
  return parts.join('\n\n');
}

export function claudeUrl(prompt: string): string {
  let url = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;
  if (url.length > MAX_URL_LENGTH) {
    url = url.slice(0, MAX_URL_LENGTH);
    // never end in the middle of a %XX escape
    url = url.replace(/%[0-9A-F]?$/i, '');
  }
  return url;
}
