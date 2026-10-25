import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { deck } from '../lib/deck';
import type { Card } from '../types/card';

const CARDS_KEY = 'cards';

export function useCards() {
  return useQuery({
    queryKey: [CARDS_KEY, deck.id],
    queryFn: async () => {
      const { data } = await api.get<Card[]>(deck.file);
      return data;
    },
  });
}
