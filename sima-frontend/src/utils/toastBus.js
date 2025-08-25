let toastFn = null;

export function setToastFn(fn) {
  toastFn = fn;
}

export function toast(message, severity = 'info') {
  if (typeof toastFn === 'function') toastFn(message, severity);
}
