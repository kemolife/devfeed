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
  /** Own install manifest (public/), so the installed app starts on this deck. iPhone home-screen
   *  apps have their own storage, separate from Safari, so the remembered deck is not enough there. */
  manifest?: string;
  /** Name under the home-screen icon on iPhone. */
  appTitle?: string;
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
      { key: 'oop', label: 'OOP' },
      { key: 'composer', label: 'Composer' },
      { key: 'git', label: 'Git' },
      { key: 'pr', label: 'PR review' },
    ],
    requests: false,
    theme: { name: 'sky', browserColor: '#f4f8fe' },
    manifest: 'manifest-olha.webmanifest',
    appTitle: 'BitFeed',
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

function setHeadTag(selector: string, tag: 'link' | 'meta', attrs: Record<string, string>): void {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tag);
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

/** Theme, browser bar color and install manifest of the deck. Call before the first render. */
export function applyDeck(): void {
  if (deck.theme) {
    document.documentElement.dataset.theme = deck.theme.name;
    setHeadTag('meta[name="theme-color"]', 'meta', { name: 'theme-color', content: deck.theme.browserColor });
  }
  if (deck.manifest) {
    const href = `${import.meta.env.BASE_URL}${deck.manifest}`;
    setHeadTag('link[rel="manifest"]', 'link', { rel: 'manifest', href });
  }
  if (deck.appTitle) {
    setHeadTag('meta[name="apple-mobile-web-app-title"]', 'meta', {
      name: 'apple-mobile-web-app-title',
      content: deck.appTitle,
    });
  }
}
