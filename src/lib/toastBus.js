let listeners = []

export function showGlobalToast(message) {
  listeners.forEach((fn) => fn(message))
}

export function subscribeGlobalToast(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
  }
}
