import type { ReactNode } from 'react';

/**
 * Page transition wrapper.
 * Next.js remounts a template on every navigation, so the enter animation
 * replays each time. The animation itself lives in globals.css and is
 * neutralised under `prefers-reduced-motion: reduce`.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="ui-page-enter flex grow flex-col">{children}</div>;
}
