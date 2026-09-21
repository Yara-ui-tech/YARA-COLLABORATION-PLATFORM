/**
 * Helper utilities for offline data caching and fallback state management.
 */

const STORAGE_PREFIX = 'yaria_offline_';

export function saveOfflineData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`[OfflineStorage] Failed to save offline cache for ${key}:`, err);
  }
}

export function getOfflineData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch (err) {
    console.warn(`[OfflineStorage] Failed to read offline cache for ${key}:`, err);
  }
  return fallback;
}

export function clearOfflineCache(): void {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.warn('[OfflineStorage] Error clearing offline cache:', err);
  }
}
