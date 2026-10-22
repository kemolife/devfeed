import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FeedFilter } from '../types/card';

export interface CardProgress {
  seen: number;
  wrong: number;
  lastCorrect: boolean;
  lastTs: number;
}

interface Today {
  date: string;
  answered: number;
  correct: number;
}

interface ProgressState {
  cards: Record<string, CardProgress>;
  /** Wrong answers per bug pattern tag, all time. */
  tagMisses: Record<string, number>;
  today: Today;
  streak: { lastDate: string | null; days: number };
  filters: FeedFilter[];
  dailyGoal: number;
  record: (id: string, tags: string[], correct: boolean) => void;
  toggleFilter: (f: FeedFilter) => void;
  clearFilters: () => void;
}

export const todayKey = (d = new Date()) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD, local time

function nextStreak(streak: ProgressState['streak'], date: string) {
  if (streak.lastDate === date) return streak;
  const yesterday = todayKey(new Date(Date.now() - 86_400_000));
  return { lastDate: date, days: streak.lastDate === yesterday ? streak.days + 1 : 1 };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      cards: {},
      tagMisses: {},
      today: { date: todayKey(), answered: 0, correct: 0 },
      streak: { lastDate: null, days: 0 },
      filters: [],
      dailyGoal: 15,
      record: (id, tags, correct) =>
        set((s) => {
          const date = todayKey();
          const prev = s.cards[id];
          const today = s.today.date === date ? s.today : { date, answered: 0, correct: 0 };
          const tagMisses = { ...s.tagMisses };
          if (!correct) for (const t of tags) tagMisses[t] = (tagMisses[t] ?? 0) + 1;
          return {
            cards: {
              ...s.cards,
              [id]: {
                seen: (prev?.seen ?? 0) + 1,
                wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
                lastCorrect: correct,
                lastTs: Date.now(),
              },
            },
            tagMisses,
            today: {
              date,
              answered: today.answered + 1,
              correct: today.correct + (correct ? 1 : 0),
            },
            streak: nextStreak(s.streak, date),
          };
        }),
      toggleFilter: (f) =>
        set((s) => ({
          filters: s.filters.includes(f) ? s.filters.filter((x) => x !== f) : [...s.filters, f],
        })),
      clearFilters: () => set({ filters: [] }),
    }),
    { name: 'bitfeed-progress', version: 1 },
  ),
);
