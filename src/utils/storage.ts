export function getStoredValue(key: string): string | null {
  return localStorage.getItem(key)
}

export function setStoredValue(key: string, value: string): void {
  localStorage.setItem(key, value)
}
