// The GitHub token lives only in this browser's storage on the user's phone.
// It is never part of the code, the repo or any URL.
const KEY = 'bitfeed-github-token';

export function loadToken(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveToken(token: string): void {
  try {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  } catch {
    // private mode / blocked storage: the token just is not remembered
  }
}

/** Fine-grained tokens start with github_pat_, classic ones with ghp_. */
export function looksLikeToken(token: string): boolean {
  return /^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(token.trim());
}
