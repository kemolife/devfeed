import type { BugCard, QuizCard } from '../types/card';
import { buildAskPrompt, googleAiUrl } from './askAi';

const quiz: QuizCard = {
  id: 'q',
  type: 'quiz',
  topic: 'c',
  tags: ['macro'],
  difficulty: 1,
  title: 'What does this print?',
  lang: 'c',
  code: 'printf("%d", 1 + 1);',
  options: ['1', '2'],
  answer: 1,
  explain: 'Because math.',
};

const bug: BugCard = {
  id: 'b',
  type: 'bug',
  topic: 'embedded',
  tags: ['stack-overflow'],
  difficulty: 2,
  title: 'Tap the bug',
  lang: 'c',
  code: 'char line[2048];',
  bugLines: [1],
  explain: 'Too big.',
  fix: 'static char line[2048];',
};

test('empty question falls back to a default', () => {
  expect(buildAskPrompt(bug, '   ').startsWith('I do not fully get this.')).toBe(true);
});

test('prompt starts with the question and skips the card explanation', () => {
  const p = buildAskPrompt(quiz, 'Why not 1?', '1');
  expect(p.startsWith('Why not 1?')).toBe(true);
  expect(p).toContain('My answer was: 1');
  expect(p).toContain('Correct answer: 2');
  expect(p).not.toContain('Because math.');
});

test('google url opens AI Mode and stays short', () => {
  const url = googleAiUrl('a b\n'.repeat(5000));
  expect(url.startsWith('https://www.google.com/search?udm=50&q=a%20b%0A')).toBe(true);
  expect(url.length).toBeLessThanOrEqual(2000);
  expect(() => decodeURIComponent(url.split('&q=')[1] ?? '')).not.toThrow();
});

test('bug prompt names the bug line and keeps the code', () => {
  const p = buildAskPrompt(bug, 'Is stack size fixed?');
  expect(p).toContain('bug on line 1');
  expect(p).toContain('char line[2048];');
});
