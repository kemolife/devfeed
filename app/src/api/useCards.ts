import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import type { Card } from '../types/card';

const CARDS_KEY = 'cards';

export function useCards() {
  return useQuery({
    queryKey: [CARDS_KEY],
    queryFn: async () => {
      const { data } = await api.get<Card[]>('cards.json');
      return data;
    },
  });
}
