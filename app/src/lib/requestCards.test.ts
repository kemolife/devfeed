import { looksLikeToken } from './githubToken';
import { requestBody, requestIssue, requestIssueUrl } from './requestCards';

test('api issue has title, parsable body and the request label', () => {
  const issue = requestIssue(20, ['rust'], 'DMA');
  expect(issue.title).toBe('More cards: 20');
  expect(issue.labels).toEqual(['card-request']);
  expect(issue.body.split('\n').slice(0, 2)).toEqual(['count: 20', 'topics: Rust, DMA']);
});

test('token check accepts GitHub token shapes only', () => {
  expect(looksLikeToken('github_pat_11ABCDEFG0123456789_abcdefghijklmnop')).toBe(true);
  expect(looksLikeToken('ghp_abcdefghijklmnopqrstuvwxyz0123')).toBe(true);
  expect(looksLikeToken('hello')).toBe(false);
  expect(looksLikeToken('github_pat_short')).toBe(false);
});

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
