"use client";

import { useCallback, useSyncExternalStore } from "react";

const memory = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

function read<T>(key: string, fallback: T): T {
  if (memory.has(key)) return memory.get(key) as T;
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as T) : fallback;
    memory.set(key, parsed);
    return parsed;
  } catch {
    memory.set(key, fallback);
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, fallback: T) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const set = listeners.get(key) ?? new Set<() => void>();
      set.add(onChange);
      listeners.set(key, set);
      return () => set.delete(onChange);
    },
    [key]
  );

  const getSnapshot = useCallback(() => read(key, fallback), [key, fallback]);
  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read(key, fallback);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      memory.set(key, resolved);
      localStorage.setItem(key, JSON.stringify(resolved));
      emit(key);
    },
    [fallback, key]
  );

  return [value, setValue] as const;
}
