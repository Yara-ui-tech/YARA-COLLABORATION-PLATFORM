/**
 * Non-blocking replacement for window.confirm().
 *
 * Native confirm() freezes the main thread while the dialog is open, and the
 * browser counts that whole time against the click's INP (Interaction to Next
 * Paint) — that is what produced multi-second INP reports on delete buttons.
 * This helper renders an in-page dialog instead (see ConfirmDialogHost) and
 * resolves a promise, so the click handler returns and paints immediately.
 *
 * Usage:  if (!(await confirmAction('Delete this item?'))) return;
 */

export interface ConfirmRequest {
  id: number;
  message: string;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
  resolve: (value: boolean) => void;
}

export interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type Listener = (queue: ConfirmRequest[]) => void;

let queue: ConfirmRequest[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach(l => l(queue));

export function subscribeConfirm(listener: Listener): () => void {
  listeners.add(listener);
  listener(queue);
  return () => {
    listeners.delete(listener);
  };
}

export function resolveConfirm(id: number, value: boolean): void {
  const req = queue.find(r => r.id === id);
  if (!req) return;
  queue = queue.filter(r => r.id !== id);
  emit();
  req.resolve(value);
}

export function confirmAction(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  // Fallback for non-browser contexts.
  if (typeof document === 'undefined') return Promise.resolve(true);

  return new Promise<boolean>(resolve => {
    queue = [
      ...queue,
      {
        id: nextId++,
        message,
        title: options.title ?? 'Please confirm',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        destructive: options.destructive ?? true,
        resolve
      }
    ];
    emit();
  });
}
