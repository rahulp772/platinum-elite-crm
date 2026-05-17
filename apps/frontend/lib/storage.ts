const STORAGE_KEYS = [
  'lastImportSessionId',
  'user',
  'unreadMessages',
] as const

export function clearAllLocalStorage() {
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}
