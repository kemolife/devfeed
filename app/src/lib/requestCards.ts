import type { FeedFilter } from '../types/card';

export const REPO = 'kemolife/devfeed';
export const REPO_URL = `https://github.com/${REPO}`;
export const REQUEST_LABEL = 'card-request';

/** Keep in sync with the "bitfeed-card-requests" scheduled task (cron 5 8,13,19 * * *). */
export const ARRIVAL_TEXT =
  'New cards arrive after the next check at 08:00, 13:00 or 19:00, while the Mac is on.';

const FILTER_NAME: Record<FeedFilter, string> = {
  embedded: 'embedded',
  c: 'C',
  cpp: 'C++',
  rust: 'Rust',
  electronics: 'electronics',
  pr: 'PR review',
  php: 'PHP',
  symfony: 'Symfony',
  js: 'JavaScript',
  jquery: 'jQuery',
  git: 'Git',
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
    `_Sent from the BitFeed app. ${ARRIVAL_TEXT}_`,
  ].join('\n');
}

export interface RequestIssue {
  title: string;
  body: string;
  labels: string[];
}

/** The issue the request task reads, for the GitHub API and the "new issue" form alike. */
export function requestIssue(count: number, filters: FeedFilter[], extraTopics: string): RequestIssue {
  return {
    title: `More cards: ${count}`,
    body: requestBody(count, filters, extraTopics),
    labels: [REQUEST_LABEL],
  };
}

/** Fallback without a token: GitHub's "new issue" form, filled in. Needs a GitHub login. */
export function requestIssueUrl(count: number, filters: FeedFilter[], extraTopics: string): string {
  const issue = requestIssue(count, filters, extraTopics);
  const params = new URLSearchParams({ title: issue.title, body: issue.body, labels: issue.labels.join(',') });
  return `${REPO_URL}/issues/new?${params.toString()}`;
}

/** GitHub page to create the token, with name and permission filled in where GitHub supports it. */
export const NEW_TOKEN_URL =
  'https://github.com/settings/personal-access-tokens/new?' +
  new URLSearchParams({
    name: 'BitFeed card requests',
    description: 'Lets the BitFeed app on my phone open card-request issues on kemolife/devfeed.',
    target_name: 'kemolife',
    expires_in: '366',
    issues: 'write',
  }).toString();
