import type { FeedFilter } from '../types/card';

export interface Deck {
  id: string;
  /** Cards file, relative to the app base URL. */
  file: string;
  /** Who learns with it, for the Ask AI prompts. */
  learner: string;
  /** Short field name for the Ask AI prompts, e.g. "Embedded". */
  field: string;
  filters: { key: FeedFilter; label: string }[];
  /** Card requests go to the owner's GitHub; only the main deck shows them. */
  requests: boolean;
  /** Color theme from index.css ([data-theme=…]); none = the dark default. */
  theme?: { name: string; browserColor: string };
}

const DECKS: Record<string, Deck> = {
  main: {
    id: 'main',
    file: 'cards.json',
    learner: 'an embedded developer',
    field: 'Embedded',
    filters: [
      { key: 'embedded', label: 'Embedded' },
      { key: 'c', label: 'C' },
      { key: 'cpp', label: 'C++' },
      { key: 'rust', label: 'Rust' },
      { key: 'electronics', label: 'Electronics' },
      { key: 'pr', label: 'PR review' },
    ],
    requests: true,
  },
  olha: {
    id: 'olha',
    file: 'decks/olha.json',
    learner: 'a junior PHP/Symfony web developer',
    field: 'Web',
    filters: [
      { key: 'php', label: 'PHP' },
      { key: 'symfony', label: 'Symfony' },
      { key: 'js', label: 'JavaScript' },
      { key: 'jquery', label: 'jQuery' },
      { key: 'git', label: 'Git' },
      { key: 'pr', label: 'PR review' },
    ],
    requests: false,
    theme: { name: 'bloom', browserColor: '#fdf7fb' },
  },
};

const STORAGE_KEY = 'bitfeed-deck';

/**
 * Deck from ?deck=<id>, remembered on this device: the installed app starts at "."
 * without the query, so it must still open the same deck. ?deck=main switches back.
 */
function resolveDeck(): Deck {
  let id: string | null = null;
  try {
    id = new URLSearchParams(window.location.search).get('deck');
    if (id && DECKS[id]) localStorage.setItem(STORAGE_KEY, id);
    else id = localStorage.getItem(STORAGE_KEY);
  } catch {
    // storage blocked: use the URL only
  }
  return (id && DECKS[id]) || (DECKS.main as Deck);
}

export const deck: Deck = typeof window === 'undefined' ? (DECKS.main as Deck) : resolveDeck();

/** Sets the deck's color theme on <html> and the browser bar color. Call before the first render. */
export function applyDeckTheme(): void {
  if (!deck.theme) return;
  document.documentElement.dataset.theme = deck.theme.name;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', deck.theme.browserColor);
}
