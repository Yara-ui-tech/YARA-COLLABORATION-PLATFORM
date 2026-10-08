import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ConfirmRequest, resolveConfirm, subscribeConfirm } from '../lib/confirmAction';

/**
 * Renders the dialog for confirmAction(). Mount once near the app root.
 * Only the first queued request is shown; the rest follow as each resolves.
 */
export default function ConfirmDialogHost() {
  const [queue, setQueue] = useState<ConfirmRequest[]>([]);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => subscribeConfirm(setQueue), []);

  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    confirmBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resolveConfirm(current.id, false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current?.id]);

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/60"
      onClick={() => resolveConfirm(current.id, false)}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              current.destructive ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 id="confirm-dialog-title" className="text-base font-black text-slate-900">
              {current.title}
            </h2>
            <p id="confirm-dialog-message" className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {current.message}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => resolveConfirm(current.id, false)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
          >
            {current.cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={() => resolveConfirm(current.id, true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${
              current.destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {current.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
