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
      { key: 'project', label: 'My project' },
      { key: 'php', label: 'PHP' },
      { key: 'symfony', label: 'Symfony' },
      { key: 'js', label: 'JavaScript' },
      { key: 'jquery', label: 'jQuery' },
      { key: 'oop', label: 'OOP' },
      { key: 'composer', label: 'Composer' },
      { key: 'git', label: 'Git' },
      { key: 'pr', label: 'PR review' },
    ],
    requests: false,
    theme: { name: 'sky', browserColor: '#f4f8fe' },
  },
};

const STORAGE_KEY = 'bitfeed-deck';

/**
 * Every deck except main has its own page: <base>/<id>/ (for example /devfeed/olha/), with its
 * own manifest in the HTML. That page is what gets installed: an iPhone home-screen app has its
 * own storage, separate from Safari, so only the address can say which deck it is.
 *
 * On the main page: ?deck=<id> and a deck remembered on this device (old installs and old
 * ?deck=olha links) redirect to that deck's page. ?deck=main switches back for good.
 */
function resolveDeck(): Deck {
  const base = import.meta.env.BASE_URL;
  const fromPath = window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length).split('/')[0]
    : '';
  if (fromPath && DECKS[fromPath]) return DECKS[fromPath] as Deck;

  let id: string | null = null;
  try {
    id = new URLSearchParams(window.location.search).get('deck');
    if (id && DECKS[id]) localStorage.setItem(STORAGE_KEY, id);
    else id = localStorage.getItem(STORAGE_KEY);
  } catch {
    // storage blocked: use the URL only
  }
  if (id && id !== 'main' && DECKS[id]) {
    window.location.replace(`${base}${id}/`);
  }
  return DECKS.main as Deck;
}

export const deck: Deck = typeof window === 'undefined' ? (DECKS.main as Deck) : resolveDeck();

/** Theme and browser bar color of the deck. Call before the first render. */
export function applyDeck(): void {
  if (!deck.theme) return;
  document.documentElement.dataset.theme = deck.theme.name;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', deck.theme.browserColor);
}
