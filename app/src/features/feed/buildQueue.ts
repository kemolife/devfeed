import type { CardProgress } from '../../store/progressStore';
import type { Card, FeedFilter } from '../../types/card';

export function matchesFilters(card: Card, filters: FeedFilter[]): boolean {
  if (filters.length === 0) return true;
  return filters.includes(card.topic) || (filters.includes('pr') && card.type === 'pr');
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/**
 * Feed order, a light spaced repetition:
 * 1. cards answered wrong last time (oldest first) — they come back until you get them right
 * 2. unseen cards (shuffled)
 * 3. cards already answered right (least recently seen first)
 */
export function buildQueue(
  cards: Card[],
  progress: Record<string, CardProgress>,
  filters: FeedFilter[],
  rng: () => number = Math.random,
): Card[] {
  const pool = cards.filter((c) => matchesFilters(c, filters));
  const byOldest = (a: Card, b: Card) =>
    (progress[a.id]?.lastTs ?? 0) - (progress[b.id]?.lastTs ?? 0);

  const missed = pool.filter((c) => progress[c.id]?.lastCorrect === false).sort(byOldest);
  const unseen = shuffle(
    pool.filter((c) => !progress[c.id]),
    rng,
  );
  const known = pool.filter((c) => progress[c.id]?.lastCorrect === true).sort(byOldest);

  return [...missed, ...unseen, ...known];
}

/** Top missed patterns, for "train these" on the done screen. */
export function weakPatterns(tagMisses: Record<string, number>, limit = 3): [string, number][] {
  return Object.entries(tagMisses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}
