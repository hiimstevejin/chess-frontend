"use client";

import { PuzzleRecord, PuzzleViewMode } from "@/components/puzzles/types";
import { Star } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface PuzzleSidebarProps {
  appliedMaxRating: string;
  appliedMinRating: string;
  applyRatingFilters: () => void;
  clearRatingFilters: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  loading: boolean;
  maxRatingInput: string;
  minRatingInput: string;
  page: number;
  puzzles: PuzzleRecord[];
  selectedPuzzleId: string | null;
  setMaxRatingInput: (value: string) => void;
  setMinRatingInput: (value: string) => void;
  setPage: Dispatch<SetStateAction<number>>;
  setSelectedPuzzleId: (value: string | null) => void;
  setViewMode: (mode: PuzzleViewMode) => void;
  starredPuzzleIds: Set<string>;
  starredPuzzlesCount: number;
  toggleStarredPuzzle: (puzzle: PuzzleRecord) => void;
  totalPages: number;
  totalPuzzles: number;
  viewMode: PuzzleViewMode;
}

export default function PuzzleSidebar({
  appliedMaxRating,
  appliedMinRating,
  applyRatingFilters,
  clearRatingFilters,
  hasNext,
  hasPrev,
  loading,
  maxRatingInput,
  minRatingInput,
  page,
  puzzles,
  selectedPuzzleId,
  setMaxRatingInput,
  setMinRatingInput,
  setPage,
  setSelectedPuzzleId,
  setViewMode,
  starredPuzzleIds,
  starredPuzzlesCount,
  toggleStarredPuzzle,
  totalPages,
  totalPuzzles,
  viewMode,
}: PuzzleSidebarProps) {
  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          {viewMode === "starred" ? "Bookmarked" : "Puzzles"}
        </h2>
        <span className="text-xs text-slate-500">
          {viewMode === "starred"
            ? `${starredPuzzlesCount} saved`
            : `${totalPuzzles.toLocaleString()} total`}
        </span>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-1">
        <button
          type="button"
          onClick={() => setViewMode("all")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            viewMode === "all"
              ? "bg-sky-500 text-slate-950"
              : "text-slate-300 hover:bg-slate-900"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setViewMode("starred")}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            viewMode === "starred"
              ? "bg-sky-500 text-slate-950"
              : "text-slate-300 hover:bg-slate-900"
          }`}
        >
          Saved
        </button>
      </div>

      {viewMode === "all" && (
        <div className="mb-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Elo
            </span>
            <input
              type="number"
              min="0"
              value={minRatingInput}
              onChange={(event) => setMinRatingInput(event.target.value)}
              className="min-w-0 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400"
              placeholder="Min"
            />
            <span className="text-slate-600">-</span>
            <input
              type="number"
              min="0"
              value={maxRatingInput}
              onChange={(event) => setMaxRatingInput(event.target.value)}
              className="min-w-0 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-400"
              placeholder="Max"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={applyRatingFilters}
              className="rounded-md bg-sky-500 px-3 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Go
            </button>
            <button
              type="button"
              onClick={clearRatingFilters}
              className="rounded-md border border-slate-700 px-2.5 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Clear
            </button>
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            {appliedMinRating || appliedMaxRating
              ? `Active: ${appliedMinRating || "Any"}-${appliedMaxRating || "Any"}`
              : "Active: Any rating"}
          </p>
        </div>
      )}

      <div
        className="max-h-[50vh] space-y-2 overflow-y-auto pr-1 [scrollbar-color:#38bdf8_#0f172a] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-slate-950 [&::-webkit-scrollbar-thumb]:bg-sky-400/70 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-900/80 [&::-webkit-scrollbar]:w-3"
        style={{
          msOverflowStyle: "auto",
        }}
      >
        {puzzles.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
            {viewMode === "starred"
              ? "No saved puzzles yet."
              : "No puzzles found for this filter."}
          </div>
        ) : (
          puzzles.map((puzzle) => {
            const isSelected = puzzle.puzzle_id === selectedPuzzleId;
            const isStarred = starredPuzzleIds.has(puzzle.puzzle_id);

            return (
              <button
                key={puzzle.puzzle_id}
                type="button"
                onClick={() => setSelectedPuzzleId(puzzle.puzzle_id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? "border-sky-400 bg-sky-500/10"
                    : "border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-white">
                    #{puzzle.puzzle_id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {puzzle.rating}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleStarredPuzzle(puzzle);
                      }}
                      className={`rounded-md p-1 transition ${
                        isStarred
                          ? "text-amber-300 hover:text-amber-200"
                          : "text-slate-500 hover:text-slate-200"
                      }`}
                      aria-label={
                        isStarred ? "Remove bookmark" : "Bookmark puzzle"
                      }
                    >
                      <Star
                        className="h-4 w-4"
                        fill={isStarred ? "currentColor" : "none"}
                      />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-300">{puzzle.themes}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {puzzle.nb_plays.toLocaleString()} plays
                </p>
              </button>
            );
          })
        )}
      </div>

      {viewMode === "all" && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={!hasPrev || loading}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={!hasNext || loading}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </aside>
  );
}
