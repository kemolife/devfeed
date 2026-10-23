import type { FeedFilter } from '../types/card';

export const REPO_URL = 'https://github.com/kemolife/devfeed';
export const REQUEST_LABEL = 'card-request';

const FILTER_NAME: Record<FeedFilter, string> = {
  embedded: 'embedded',
  c: 'C',
  cpp: 'C++',
  rust: 'Rust',
  electronics: 'electronics',
  pr: 'PR review',
};

/**
 * Body of the GitHub issue the request task reads. Keep the "key: value" lines:
 * the task parses them (see REQUESTS.md).
 */
export function requestBody(count: number, filters: FeedFilter[], extraTopics: string): string {
  const topics = [...filters.map((f) => FILTER_NAME[f]), ...extraTopics.split(',')]
    .map((t) => t.trim())
    .filter(Boolean);
  return [
    `count: ${count}`,
    `topics: ${topics.length ? topics.join(', ') : 'any'}`,
    '',
    '_Sent from the BitFeed app. New cards arrive within about 2 hours while the Mac is on._',
  ].join('\n');
}

/** Opens GitHub's "new issue" form, filled in. The owner's own login adds the label. */
export function requestIssueUrl(count: number, filters: FeedFilter[], extraTopics: string): string {
  const params = new URLSearchParams({
    title: `More cards: ${count}`,
    body: requestBody(count, filters, extraTopics),
    labels: REQUEST_LABEL,
  });
  return `${REPO_URL}/issues/new?${params.toString()}`;
}
