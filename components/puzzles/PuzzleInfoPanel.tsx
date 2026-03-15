"use client";

import { HintState, PuzzleRecord } from "@/components/puzzles/types";

interface PuzzleInfoPanelProps {
  feedback: {
    tone: "neutral" | "success" | "error";
    message: string;
  };
  hint: HintState;
  history: string[];
  isSolved: boolean;
  revealHint: () => void;
  selectedPuzzle: PuzzleRecord | null;
  solutionIndex: number;
  solutionMoves: string[];
}

export default function PuzzleInfoPanel({
  feedback,
  hint,
  history,
  isSolved,
  revealHint,
  selectedPuzzle,
  solutionIndex,
  solutionMoves,
}: PuzzleInfoPanelProps) {
  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          Feedback
        </h2>
        <div
          className={`mt-3 rounded-xl border p-4 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
              : feedback.tone === "error"
                ? "border-red-500/40 bg-red-500/10 text-red-100"
                : "border-slate-700 bg-slate-950/60 text-slate-300"
          }`}
        >
          {feedback.message}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Progress
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {Math.min(solutionIndex, solutionMoves.length)} /{" "}
              {solutionMoves.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Status
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {isSolved ? "Solved" : "Active"}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Hint
            </p>
            <button
              type="button"
              onClick={revealHint}
              disabled={!hint.move || isSolved}
              className="rounded-md border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Show move
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            {isSolved
              ? "Puzzle complete."
              : hint.visible && hint.move
                ? `Next move: ${hint.move}`
                : "Reveal the next move if you get stuck."}
          </p>
        </div>
      </div>

      {selectedPuzzle && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Details
          </h2>
          <div className="mt-3 space-y-3 text-sm text-slate-300">
            <p>
              <span className="text-slate-500">Theme:</span>{" "}
              {selectedPuzzle.themes}
            </p>
            <p>
              <span className="text-slate-500">Rating:</span>{" "}
              {selectedPuzzle.rating} +/- {selectedPuzzle.rating_deviation}
            </p>
            <p>
              <span className="text-slate-500">Popularity:</span>{" "}
              {selectedPuzzle.popularity}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            Move Log
          </h2>
          <span className="text-xs text-slate-500">{history.length} total</span>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-slate-400">No moves yet.</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {history.map((move, index) => (
              <div
                key={`${move}-${index}`}
                className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2 text-sm"
              >
                <span className="text-slate-500">#{index + 1}</span>
                <span className="font-medium text-white">{move}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
