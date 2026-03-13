"use client";

import { useChessStore } from "@/store/useChessStore";

interface MovePair {
  turn: number;
  white: string;
  black: string | null;
}

export default function MoveHistory() {
  const history = useChessStore((state) => state.history);

  const movePairs: MovePair[] = [];
  for (let index = 0; index < history.length; index += 2) {
    movePairs.push({
      turn: index / 2 + 1,
      white: history[index],
      black: history[index + 1] ?? null,
    });
  }

  return (
    <aside className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
          Moves
        </h2>
        <span className="text-xs text-slate-500">{history.length} total</span>
      </div>

      {movePairs.length === 0 ? (
        <p className="text-sm text-slate-400">No moves yet.</p>
      ) : (
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {movePairs.map((pair) => (
            <div
              key={pair.turn}
              className="grid grid-cols-[auto_1fr_1fr] gap-3 rounded-md bg-slate-800/80 px-3 py-2 text-sm text-slate-200"
            >
              <span className="text-slate-500">{pair.turn}.</span>
              <span className="font-medium">{pair.white}</span>
              <span className="font-medium text-slate-400">
                {pair.black ?? "-"}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
