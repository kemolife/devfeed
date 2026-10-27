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

/** A card answered wrong comes back after this time, not on the very next app start. */
export const MISSED_DELAY_MS = 12 * 60 * 60 * 1000;

/**
 * Feed order, a light spaced repetition:
 * 1. cards answered wrong at least 12 h ago (oldest first): time to try again
 * 2. cards never shown (shuffled)
 * 3. cards shown but not answered, e.g. scrolled past (least recently shown first)
 * 4. cards answered wrong less than 12 h ago: they wait for the next day
 * 5. cards already answered right (least recently answered first)
 */
export function buildQueue(
  cards: Card[],
  progress: Record<string, CardProgress>,
  filters: FeedFilter[],
  viewed: Record<string, number> = {},
  now: number = Date.now(),
  rng: () => number = Math.random,
): Card[] {
  const pool = cards.filter((c) => matchesFilters(c, filters));
  const answeredAt = (c: Card) => progress[c.id]?.lastTs ?? 0;
  const byAnswered = (a: Card, b: Card) => answeredAt(a) - answeredAt(b);
  const byViewed = (a: Card, b: Card) => (viewed[a.id] ?? 0) - (viewed[b.id] ?? 0);

  const missed = pool.filter((c) => progress[c.id]?.lastCorrect === false).sort(byAnswered);
  const missedDue = missed.filter((c) => now - answeredAt(c) >= MISSED_DELAY_MS);
  const missedLater = missed.filter((c) => now - answeredAt(c) < MISSED_DELAY_MS);
  const unanswered = pool.filter((c) => !progress[c.id]);
  const fresh = shuffle(
    unanswered.filter((c) => viewed[c.id] === undefined),
    rng,
  );
  const viewedOnly = unanswered.filter((c) => viewed[c.id] !== undefined).sort(byViewed);
  const known = pool.filter((c) => progress[c.id]?.lastCorrect === true).sort(byAnswered);

  return [...missedDue, ...fresh, ...viewedOnly, ...missedLater, ...known];
}

/** Top missed patterns, for "train these" on the done screen. */
export function weakPatterns(tagMisses: Record<string, number>, limit = 3): [string, number][] {
  return Object.entries(tagMisses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}
