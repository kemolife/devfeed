import axios from 'axios';

export const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
});

const STATUS_MESSAGE: Record<number, string> = {
  401: 'GitHub says the token is not valid or has expired. Add a new token.',
  403: 'The token has no permission to create issues. It needs Issues: Read and write.',
  404: 'The token has no access to kemolife/devfeed. Select this repository for the token.',
};

githubApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error.response?.status;
    const known = status === undefined ? undefined : STATUS_MESSAGE[status];
    const message =
      known ?? (error.response ? `GitHub error ${status}.` : 'No connection to GitHub. Try again later.');
    return Promise.reject(new Error(message));
  },
);
