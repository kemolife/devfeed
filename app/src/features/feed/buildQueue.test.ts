import type { CardProgress } from '../../store/progressStore';
import type { Card } from '../../types/card';
import { buildQueue, matchesFilters, MISSED_DELAY_MS, weakPatterns } from './buildQueue';

const concept = (id: string, topic: Card['topic']): Card => ({
  id,
  type: 'concept',
  topic,
  tags: [],
  difficulty: 1,
  title: id,
  bullets: [],
});

const pr: Card = {
  id: 'pr1',
  type: 'pr',
  topic: 'rust',
  tags: [],
  difficulty: 1,
  lang: 'rust',
  pr: { title: 't', author: 'a', body: 'b', verdict: 'approve' },
  diff: '',
  explain: '',
};

const seen = (lastCorrect: boolean, lastTs: number): CardProgress => ({
  seen: 1,
  wrong: lastCorrect ? 0 : 1,
  lastCorrect,
  lastTs,
});

const NOW = 10 * MISSED_DELAY_MS;
const ids = (q: Card[]) => q.map((c) => c.id);

test('full order: missed (due), fresh, viewed, missed (not due), known', () => {
  const cards = ['known', 'missedRecent', 'viewed', 'fresh', 'missedOld'].map((id) => concept(id, 'c'));
  const progress = {
    known: seen(true, NOW - 1000),
    missedRecent: seen(false, NOW - 1000),
    missedOld: seen(false, NOW - MISSED_DELAY_MS),
  };
  const viewed = { viewed: NOW - 5000 };

  expect(ids(buildQueue(cards, progress, [], viewed, NOW, () => 0))).toEqual([
    'missedOld',
    'fresh',
    'viewed',
    'missedRecent',
    'known',
  ]);
});

test('a card answered wrong a minute ago does not come back first on reopen', () => {
  const cards = [concept('wrong', 'c'), concept('new1', 'c'), concept('new2', 'c')];
  const progress = { wrong: seen(false, NOW - 60_000) };

  expect(ids(buildQueue(cards, progress, [], {}, NOW)).at(-1)).toBe('wrong');
});

test('scrolled-past cards come after never-shown ones, oldest view first', () => {
  const cards = [concept('v2', 'c'), concept('new', 'c'), concept('v1', 'c')];
  const viewed = { v1: NOW - 9000, v2: NOW - 1000 };

  expect(ids(buildQueue(cards, {}, [], viewed, NOW))).toEqual(['new', 'v1', 'v2']);
});

test('older due misses come before newer due misses', () => {
  const cards = [concept('a', 'c'), concept('b', 'c')];
  const progress = { a: seen(false, NOW - MISSED_DELAY_MS - 100), b: seen(false, NOW - MISSED_DELAY_MS - 200) };

  expect(ids(buildQueue(cards, progress, [], {}, NOW))).toEqual(['b', 'a']);
});

test('"pr" filter selects PR cards of any topic', () => {
  expect(matchesFilters(pr, ['pr'])).toBe(true);
  expect(matchesFilters(concept('x', 'rust'), ['pr'])).toBe(false);
  expect(matchesFilters(concept('x', 'c'), ['c', 'pr'])).toBe(true);
  expect(matchesFilters(concept('x', 'c'), [])).toBe(true);
});

test('weak patterns are sorted by misses', () => {
  expect(weakPatterns({ isr: 1, volatile: 4, spi: 2 }, 2)).toEqual([
    ['volatile', 4],
    ['spi', 2],
  ]);
});
