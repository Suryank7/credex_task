'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persistent state across page reloads.
 * Synchronizes React state with localStorage using JSON serialization.
 * Falls back to initialValue if localStorage is unavailable (SSR) or corrupted.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initializer: read from localStorage only once on mount
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: Failed to parse key "${key}"`, error);
      return initialValue;
    }
  });

  // Persist to localStorage whenever storedValue changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`useLocalStorage: Failed to set key "${key}"`, error);
    }
  }, [key, storedValue]);

  // Memoized setter to avoid unnecessary re-renders in consumers
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      return nextValue;
    });
  }, []);

  // Clear this specific key
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`useLocalStorage: Failed to remove key "${key}"`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
