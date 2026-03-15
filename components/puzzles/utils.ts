import { PuzzleRecord } from "@/components/puzzles/types";

export const PUZZLES_API_PATH = "/api/puzzles";
export const DEFAULT_LIMIT = 24;
export const STARRED_PUZZLES_STORAGE_KEY = "starred-puzzles";

export function normalizeMove(move: {
  from: string;
  to: string;
  promotion?: string;
}) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

export function loadStarredPuzzles() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(
      STARRED_PUZZLES_STORAGE_KEY,
    );
    if (!storedValue) return [];

    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? (parsed as PuzzleRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveStarredPuzzles(puzzles: PuzzleRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STARRED_PUZZLES_STORAGE_KEY,
    JSON.stringify(puzzles),
  );
}
