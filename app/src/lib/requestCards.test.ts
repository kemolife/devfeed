import { requestBody, requestIssueUrl } from './requestCards';

test('body lists count and topics from filters plus own topics', () => {
  const body = requestBody(20, ['embedded', 'rust'], ' DMA, CAN bus ,');
  expect(body.split('\n').slice(0, 2)).toEqual(['count: 20', 'topics: embedded, Rust, DMA, CAN bus']);
});

test('no filters and no own topics means any topic', () => {
  expect(requestBody(10, [], '  ')).toContain('topics: any');
});

test('url opens a labelled new issue on the repo', () => {
  const url = new URL(requestIssueUrl(10, ['pr'], ''));
  expect(url.origin + url.pathname).toBe('https://github.com/kemolife/devfeed/issues/new');
  expect(url.searchParams.get('labels')).toBe('card-request');
  expect(url.searchParams.get('title')).toBe('More cards: 10');
  expect(url.searchParams.get('body')).toContain('topics: PR review');
});
