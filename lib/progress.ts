"use client";

import * as React from "react";

export type Mark = "learned" | "important" | "review";

const KEY = "go-patterns:progress:v1";

type Store = Record<string, Mark>;

let state: Store = {};
let hydrated = false;
const listeners = new Set<() => void>();

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(next: Store) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private mode or blocked storage — keep the in-memory copy
  }
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = read();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);

  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = read();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = (): Store => ({});

export const CYCLE: (Mark | undefined)[] = [
  "learned",
  "important",
  "review",
  undefined,
];

export function useProgress() {
  const store = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setMark = React.useCallback((id: string, mark: Mark | undefined) => {
    const next = { ...state };
    if (mark) next[id] = mark;
    else delete next[id];
    write(next);
  }, []);

  const cycle = React.useCallback((id: string) => {
    const cur = state[id];
    const i = CYCLE.indexOf(cur);
    setMark(id, CYCLE[(i + 1) % CYCLE.length]);
  }, [setMark]);

  const clearAll = React.useCallback(() => write({}), []);

  return { marks: store, setMark, cycle, clearAll };
}

/** How many of these problem ids are marked learned. */
export function countLearned(marks: Record<string, Mark>, ids: number[]) {
  let n = 0;
  for (const id of ids) if (marks[`p:${id}`] === "learned") n++;
  return n;
}
