import type { CardProgress } from '../../store/progressStore';
import type { Card } from '../../types/card';
import { buildQueue, matchesFilters, weakPatterns } from './buildQueue';

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

test('missed cards come first, then unseen, then known', () => {
  const cards = [concept('known', 'c'), concept('new', 'c'), concept('missed', 'c')];
  const progress = { known: seen(true, 1), missed: seen(false, 2) };

  const ids = buildQueue(cards, progress, [], () => 0).map((c) => c.id);

  expect(ids).toEqual(['missed', 'new', 'known']);
});

test('older misses come before newer misses', () => {
  const cards = [concept('a', 'c'), concept('b', 'c')];
  const progress = { a: seen(false, 200), b: seen(false, 100) };

  expect(buildQueue(cards, progress, []).map((c) => c.id)).toEqual(['b', 'a']);
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
