import { useRegisterSW } from 'virtual:pwa-register/react';

const HOURLY = 60 * 60 * 1000;

/**
 * Shows "New version" when a new deploy is ready, so one tap updates the app.
 * An installed PWA often stays in memory for days, so it also checks for a new
 * version each time it comes back to the screen.
 */
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      const check = () => {
        if (document.visibilityState === 'visible') void registration.update();
      };
      document.addEventListener('visibilitychange', check);
      setInterval(check, HOURLY);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="animate-pop fixed inset-x-0 bottom-4 z-20 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center gap-3 rounded-xl border border-accent/50 bg-surface-2 p-3 shadow-lg shadow-black/40"
    >
      <span className="flex-1 text-sm">New version of BitFeed is ready.</span>
      <button
        type="button"
        onClick={() => setNeedRefresh(false)}
        className="rounded-lg px-2.5 py-1.5 text-sm text-muted hover:text-fg"
      >
        Later
      </button>
      <button
        type="button"
        onClick={() => {
          void updateServiceWorker(true);
          // updateServiceWorker reloads only when the old worker controlled this page.
          // On a first visit it did not, so reload ourselves as a fallback.
          setTimeout(() => window.location.reload(), 1500);
        }}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-bg"
      >
        Reload
      </button>
    </div>
  );
}
