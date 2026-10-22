import type { BugCard, QuizCard } from '../types/card';
import { buildAskPrompt, claudeUrl } from './askClaude';

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

test('quiz prompt has code, correct answer, my answer and my question', () => {
  const p = buildAskPrompt(quiz, 'Why not 1?', '1');
  expect(p).toContain('```c\nprintf("%d", 1 + 1);\n```');
  expect(p).toContain('Correct answer: 2');
  expect(p).toContain('My answer was: 1');
  expect(p).toContain('My question: Why not 1?');
});

test('empty question falls back to a default', () => {
  expect(buildAskPrompt(bug, '   ')).toContain('My question: I do not fully get this.');
});

test('bug prompt names the bug line and the fix', () => {
  const p = buildAskPrompt(bug, 'Is stack size fixed?');
  expect(p).toContain('Bug is on line 1.');
  expect(p).toContain('static char line[2048];');
});

test('url is encoded and never cut inside an escape', () => {
  const url = claudeUrl('a b\n'.repeat(5000));
  expect(url.startsWith('https://claude.ai/new?q=a%20b%0A')).toBe(true);
  expect(url.length).toBeLessThanOrEqual(6000);
  expect(() => decodeURIComponent(url.split('?q=')[1] ?? '')).not.toThrow();
});
