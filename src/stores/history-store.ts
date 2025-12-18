'use client';

import { create } from 'zustand';

interface HistoryEntry {
  id: string;
  timestamp: number;
  description: string;
  undo: () => void;
  redo: () => void;
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Actions
  pushHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getLastAction: () => HistoryEntry | null;
}

const MAX_HISTORY_SIZE = 50;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  pushHistory: (entry) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    set((state) => ({
      past: [...state.past.slice(-MAX_HISTORY_SIZE + 1), newEntry],
      future: [], // Clear future when new action is taken
    }));
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return;

    const entry = past[past.length - 1];

    // Execute undo
    entry.undo();

    set((state) => ({
      past: state.past.slice(0, -1),
      future: [entry, ...state.future],
    }));
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;

    const entry = future[0];

    // Execute redo
    entry.redo();

    set((state) => ({
      past: [...state.past, entry],
      future: state.future.slice(1),
    }));
  },

  canUndo: () => get().past.length > 0,

  canRedo: () => get().future.length > 0,

  clearHistory: () => set({ past: [], future: [] }),

  getLastAction: () => {
    const { past } = get();
    return past.length > 0 ? past[past.length - 1] : null;
  },
}));

// Helper hook for components that need undo/redo status
export function useUndoRedo() {
  const { undo, redo, canUndo, canRedo, getLastAction } = useHistoryStore();

  return {
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    lastAction: getLastAction(),
  };
}
