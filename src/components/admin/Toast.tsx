'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircleIcon, CheckCircleIcon, CloseIcon, InfoCircleIcon } from './adminIcons';

export type ToastTone = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  /** Shows a toast; it dismisses itself after ~3.6 s. */
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLE: Record<ToastTone, { wrapper: string; icon: ReactNode }> = {
  success: {
    wrapper: 'border-success/30 bg-success-tint text-success',
    icon: <CheckCircleIcon size={16} />,
  },
  error: {
    wrapper: 'border-danger/30 bg-danger-tint text-danger-text',
    icon: <AlertCircleIcon size={16} />,
  },
  info: {
    wrapper: 'border-accent-border bg-accent-tint text-accent',
    icon: <InfoCircleIcon size={16} />,
  },
};

/**
 * Toast provider for the admin space: mounts the stack and exposes `useToast`.
 * Feedback only, no persistence: the actions of the admin space are simulated.
 */
export function ToastProvider({
  children,
  closeLabel,
}: {
  children: ReactNode;
  /** Accessible label of the dismiss button, already translated. */
  closeLabel: string;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 3600);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-6 bottom-6 z-[60] flex flex-col items-end gap-2"
      >
        {toasts.map((toast) => {
          const style = TONE_STYLE[toast.tone];
          return (
            <div
              key={toast.id}
              className={`ui-toast pointer-events-auto flex max-w-[360px] items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-[13px] font-medium shadow-[0_10px_28px_rgba(22,24,28,0.12)] ${style.wrapper}`}
            >
              {style.icon}
              <span className="grow">{toast.message}</span>
              <button
                type="button"
                aria-label={closeLabel}
                onClick={() => dismiss(toast.id)}
                className="cursor-pointer opacity-60 transition-opacity duration-200 hover:opacity-100"
              >
                <CloseIcon size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Access the toast API. Must be called under a ToastProvider. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a ToastProvider');
  }
  return context;
}
