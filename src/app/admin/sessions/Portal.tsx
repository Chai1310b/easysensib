'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders its children directly under `document.body`.
 * The page wrapper of `src/app/template.tsx` keeps an identity transform once
 * its enter animation has played, which turns it into the containing block of
 * every `position: fixed` descendant. Overlays mounted through this portal
 * escape that wrapper and stay anchored to the viewport.
 * Only mount it from a client interaction, never during the first render.
 */
export function Portal({ children }: { children: ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
