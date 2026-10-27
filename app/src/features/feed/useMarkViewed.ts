import { useEffect, type RefObject } from 'react';
import { useProgressStore } from '../../store/progressStore';

/** On screen this long = "seen", so a fast scroll past a card does not count. */
const VIEW_MS = 1000;

/**
 * Marks the card as viewed when it fills most of the screen for a second.
 * Tall cards never reach a high ratio, so "most of the screen" also counts.
 */
export function useMarkViewed(ref: RefObject<HTMLElement | null>, cardId: string): void {
  const markViewed = useProgressStore((s) => s.markViewed);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let timer: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const screen = entry.rootBounds?.height ?? window.innerHeight;
        const onScreen = entry.intersectionRatio >= 0.6 || entry.intersectionRect.height >= screen * 0.6;
        window.clearTimeout(timer);
        if (onScreen) timer = window.setTimeout(() => markViewed(cardId), VIEW_MS);
      },
      { threshold: [0, 0.3, 0.6, 1] },
    );
    observer.observe(el);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [ref, cardId, markViewed]);
}
