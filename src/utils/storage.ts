const STORAGE_PREFIX = 'skate-app:';

export function getStorageKey(key: string): string {
  return STORAGE_PREFIX + key;
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(getStorageKey(key));
    if (stored === null) {
      return defaultValue;
    }
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(value));
  } catch {
    console.warn('Failed to save to localStorage');
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(getStorageKey(key));
  } catch {
    console.warn('Failed to remove from localStorage');
  }
}
