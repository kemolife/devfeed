import { QueryClientProvider } from '@tanstack/react-query';
import { Feed } from './features/feed/Feed';
import { queryClient } from './lib/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Feed />
    </QueryClientProvider>
  );
}
