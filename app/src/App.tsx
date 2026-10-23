import { QueryClientProvider } from '@tanstack/react-query';
import { UpdateToast } from './components/UpdateToast';
import { Feed } from './features/feed/Feed';
import { queryClient } from './lib/queryClient';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Feed />
      <UpdateToast />
    </QueryClientProvider>
  );
}
