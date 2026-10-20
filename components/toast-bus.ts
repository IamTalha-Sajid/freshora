// Lets plain functions (like the admin fetch helper) raise toasts without needing a React hook.
export type ToastTone = "info" | "success" | "error";
type Listener = (message: string, tone: ToastTone) => void;

const listeners = new Set<Listener>();

export function subscribeToasts(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const emit = (message: string, tone: ToastTone) => listeners.forEach((fn) => fn(message, tone));

export const notify = {
  info: (message: string) => emit(message, "info"),
  success: (message: string) => emit(message, "success"),
  error: (message: string) => emit(message, "error"),
};
