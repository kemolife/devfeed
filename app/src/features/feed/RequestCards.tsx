import { useState } from 'react';
import { useRequestCards } from '../../api/useRequestCards';
import { loadToken, looksLikeToken, saveToken } from '../../lib/githubToken';
import { ARRIVAL_TEXT, NEW_TOKEN_URL, requestIssue, requestIssueUrl } from '../../lib/requestCards';
import { useProgressStore } from '../../store/progressStore';

const COUNTS = [10, 20];

export function RequestCards() {
  const filters = useProgressStore((s) => s.filters);
  const [count, setCount] = useState(10);
  const [extra, setExtra] = useState('');
  const [token, setToken] = useState(loadToken);
  const [editingToken, setEditingToken] = useState(false);
  const request = useRequestCards();

  const send = () => request.mutate({ token, issue: requestIssue(count, filters, extra) });

  return (
    <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-left">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">Want new cards?</p>
        {token && !editingToken && (
          <button
            type="button"
            onClick={() => setEditingToken(true)}
            className="text-xs text-muted hover:text-fg"
          >
            ⚙ Token
          </button>
        )}
      </div>

      {!token || editingToken ? (
        <TokenSetup
          hasToken={!!token}
          onSave={(t) => {
            saveToken(t);
            setToken(t);
            setEditingToken(false);
            request.reset();
          }}
          onCancel={token ? () => setEditingToken(false) : undefined}
          fallbackUrl={requestIssueUrl(count, filters, extra)}
        />
      ) : (
        <>
          <p className="mt-1 text-xs text-muted">{ARRIVAL_TEXT}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted">How many</span>
            {COUNTS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={c === count}
                onClick={() => setCount(c)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  c === count ? 'border-accent bg-accent/15 text-accent' : 'border-line text-muted hover:text-fg'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="Topics, comma separated (e.g. DMA, CAN bus)"
            className="mt-3 w-full rounded-md border border-line bg-bg px-3 py-2 text-[15px] text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
          {filters.length > 0 && (
            <p className="mt-1.5 text-xs text-muted">Also uses your filters at the top.</p>
          )}
          <button
            type="button"
            onClick={send}
            disabled={request.isPending}
            className="mt-3 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-bg disabled:opacity-60"
          >
            {request.isPending
              ? 'Sending…'
              : request.isSuccess
                ? `Request ${count} more`
                : `Request ${count} cards`}
          </button>
          {request.isSuccess && (
            <p className="animate-pop mt-2 text-sm text-ok">
              ✓ Requested{' '}
              <a href={request.data.html_url} target="_blank" rel="noopener noreferrer" className="underline">
                #{request.data.number}
              </a>
              . New cards after the next check (08:00, 13:00 or 19:00).
            </p>
          )}
          {request.isError && <p className="animate-pop mt-2 text-sm text-bad">{request.error.message}</p>}
        </>
      )}
    </div>
  );
}

interface TokenSetupProps {
  hasToken: boolean;
  onSave: (token: string) => void;
  onCancel?: () => void;
  fallbackUrl: string;
}

function TokenSetup({ hasToken, onSave, onCancel, fallbackUrl }: TokenSetupProps) {
  const [value, setValue] = useState('');
  const valid = looksLikeToken(value);

  return (
    <div className="mt-2 text-sm">
      <p className="text-xs text-muted">
        One-time setup, so requests need no browser and no login. The token is saved only on this
        phone.
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[13px] text-fg/90">
        <li>
          <a href={NEW_TOKEN_URL} target="_blank" rel="noopener noreferrer" className="text-accent underline">
            Create a GitHub token ↗
          </a>
        </li>
        <li>
          Repository access: <b>Only select repositories</b> → <code className="font-mono">kemolife/devfeed</code>
        </li>
        <li>
          Permissions: <b>Issues → Read and write</b>. Nothing else.
        </li>
        <li>Generate, copy, paste it here:</li>
      </ol>
      <input
        type="password"
        value={value}
        onChange={(e) => setValue(e.target.value.trim())}
        placeholder="github_pat_…"
        autoComplete="off"
        className="mt-2 w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-[14px] text-fg placeholder:text-muted/60 focus:border-accent focus:outline-none"
      />
      {value && !valid && <p className="mt-1 text-xs text-bad">This does not look like a GitHub token.</p>}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={!valid}
          onClick={() => onSave(value)}
          className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-bg disabled:opacity-40"
        >
          Save token
        </button>
        {hasToken && (
          <button
            type="button"
            onClick={() => onSave('')}
            className="rounded-lg border border-line px-3 py-2 text-sm text-bad"
          >
            Remove
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-line px-3 py-2 text-sm text-muted"
          >
            Cancel
          </button>
        )}
      </div>
      <a
        href={fallbackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-center text-xs text-muted underline"
      >
        Or request on the GitHub website (needs login)
      </a>
    </div>
  );
}
