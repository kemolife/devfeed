import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const HOURLY = 60 * 60 * 1000;

/**
 * Shows "New version" when a new deploy has taken over, so one tap loads it.
 * The new service worker activates by itself (skipWaiting); this page still runs
 * the old code until it reloads. An installed PWA often stays in memory for days,
 * so it also checks for a new version each time it comes back to the screen.
 */
export function UpdateToast() {
  const [updated, setUpdated] = useState(false);

  useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      const check = () => {
        if (document.visibilityState === 'visible') void registration.update();
      };
      document.addEventListener('visibilitychange', check);
      setInterval(check, HOURLY);
    },
  });

  useEffect(() => {
    const sw = navigator.serviceWorker;
    // No controller yet = first install, not an update.
    if (!sw?.controller) return;
    const onChange = () => setUpdated(true);
    sw.addEventListener('controllerchange', onChange);
    return () => sw.removeEventListener('controllerchange', onChange);
  }, []);

  if (!updated) return null;

  return (
    <div
      role="status"
      className="animate-pop fixed inset-x-0 bottom-4 z-20 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center gap-3 rounded-xl border border-accent/50 bg-surface-2 p-3 shadow-lg shadow-black/40"
    >
      <span className="flex-1 text-sm">New version of BitFeed is ready.</span>
      <button
        type="button"
        onClick={() => setUpdated(false)}
        className="rounded-lg px-2.5 py-1.5 text-sm text-muted hover:text-fg"
      >
        Later
      </button>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-bg"
      >
        Reload
      </button>
    </div>
  );
}
