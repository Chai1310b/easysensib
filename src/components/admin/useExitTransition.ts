'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps an overlay mounted for `durationMs` after `open` turns false so its
 * exit animation can play. Returns `mounted` (whether to render at all) and
 * `closing` (apply the `-out` animation classes while it plays).
 */
export function useExitTransition(open: boolean, durationMs = 200) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [exiting, setExiting] = useState(false);

  // Render-phase adjustment (React's documented pattern for reacting to a
  // prop change without an effect): when `open` flips to false, start exiting.
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setExiting(true);
  }

  useEffect(() => {
    if (!exiting || open) return;
    const timer = setTimeout(() => setExiting(false), durationMs);
    return () => clearTimeout(timer);
  }, [exiting, open, durationMs]);

  return { mounted: open || exiting, closing: !open && exiting };
}
