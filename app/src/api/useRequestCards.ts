import { useMutation } from '@tanstack/react-query';
import { githubApi } from '../lib/githubApi';
import { REPO, type RequestIssue } from '../lib/requestCards';

interface CreatedIssue {
  number: number;
  html_url: string;
}

export function useRequestCards() {
  return useMutation({
    mutationFn: async ({ token, issue }: { token: string; issue: RequestIssue }) => {
      const { data } = await githubApi.post<CreatedIssue>(`/repos/${REPO}/issues`, issue, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
  });
}
