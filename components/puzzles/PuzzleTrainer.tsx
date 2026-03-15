"use client";

import PromotionSelection from "@/components/board/PromotionSelection";
import PuzzleInfoPanel from "@/components/puzzles/PuzzleInfoPanel";
import PuzzleSidebar from "@/components/puzzles/PuzzleSidebar";
import { usePuzzleTrainer } from "@/hooks/usePuzzleTrainer";
import { Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chessboard,
  PieceDropHandlerArgs,
  SquareHandlerArgs,
} from "react-chessboard";

export default function PuzzleTrainer() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  const {
    appliedMaxRating,
    appliedMinRating,
    applyRatingFilters,
    clearRatingFilters,
    error,
    feedback,
    fen,
    hasNext,
    hasPrev,
    hint,
    history,
    isSolved,
    loading,
    maxRatingInput,
    minRatingInput,
    onPieceDrop,
    onSquareClick,
    optionSquares,
    page,
    pendingPromotion,
    playerColor,
    puzzles,
    revealHint,
    selectPromotion,
    selectedPuzzle,
    selectedPuzzleId,
    setMaxRatingInput,
    setMinRatingInput,
    setPage,
    setPendingPromotion,
    setSelectedPuzzleId,
    setViewMode,
    solutionMoves,
    solutionIndex,
    starredPuzzleIds,
    starredPuzzles,
    toggleStarredPuzzle,
    totalPages,
    totalPuzzles,
    viewMode,
  } = usePuzzleTrainer();

  useEffect(() => {
    if (boardRef.current) {
      setBoardWidth(boardRef.current.offsetWidth);
    }
  }, [selectedPuzzleId]);

  const { menuLeft, squareWidth } = useMemo(() => {
    if (!pendingPromotion || boardWidth === 0) {
      return { menuLeft: 0, squareWidth: 0 };
    }

    const singleSquareWidth = boardWidth / 8;
    const colIndex = pendingPromotion.to.charCodeAt(0) - "a".charCodeAt(0);

    return {
      menuLeft: colIndex * singleSquareWidth,
      squareWidth: singleSquareWidth,
    };
  }, [boardWidth, pendingPromotion]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 text-white lg:px-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
          Puzzle
        </p>
        <h1 className="text-4xl font-bold text-white">
          Solve tactical puzzles
        </h1>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
          Loading puzzles...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
          Failed to load puzzles from `/api/puzzles`.
          <div className="mt-2 text-sm text-red-100/80">{error}</div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)_20rem]">
          <PuzzleSidebar
            appliedMaxRating={appliedMaxRating}
            appliedMinRating={appliedMinRating}
            applyRatingFilters={applyRatingFilters}
            clearRatingFilters={clearRatingFilters}
            hasNext={hasNext}
            hasPrev={hasPrev}
            loading={loading}
            maxRatingInput={maxRatingInput}
            minRatingInput={minRatingInput}
            page={page}
            puzzles={puzzles}
            selectedPuzzleId={selectedPuzzleId}
            setMaxRatingInput={setMaxRatingInput}
            setMinRatingInput={setMinRatingInput}
            setPage={setPage}
            setSelectedPuzzleId={setSelectedPuzzleId}
            setViewMode={setViewMode}
            starredPuzzleIds={starredPuzzleIds}
            starredPuzzlesCount={starredPuzzles.length}
            toggleStarredPuzzle={toggleStarredPuzzle}
            totalPages={totalPages}
            totalPuzzles={totalPuzzles}
            viewMode={viewMode}
          />

          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Current Puzzle
                  </p>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-white">
                      {selectedPuzzle
                        ? `#${selectedPuzzle.themes}`
                        : "No puzzle"}
                    </h2>
                    {selectedPuzzle && (
                      <button
                        type="button"
                        onClick={() => toggleStarredPuzzle(selectedPuzzle)}
                        className={`rounded-lg border px-2 py-1 transition ${
                          starredPuzzleIds.has(selectedPuzzle.puzzle_id)
                            ? "border-amber-400/50 bg-amber-400/10 text-amber-300"
                            : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                        }`}
                        aria-label={
                          starredPuzzleIds.has(selectedPuzzle.puzzle_id)
                            ? "Remove bookmark"
                            : "Bookmark puzzle"
                        }
                      >
                        <Star
                          className="h-4 w-4"
                          fill={
                            starredPuzzleIds.has(selectedPuzzle.puzzle_id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {playerColor === "w" ? "White to solve" : "Black to solve"}
                </div>
              </div>

              <div
                ref={boardRef}
                className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl"
              >
                <Chessboard
                  options={{
                    id: "puzzle-trainer",
                    position: fen,
                    onPieceDrop: ({
                      sourceSquare,
                      targetSquare,
                      piece,
                    }: PieceDropHandlerArgs) =>
                      onPieceDrop(
                        sourceSquare,
                        targetSquare ?? undefined,
                        piece.pieceType,
                      ),
                    onSquareClick: ({ square, piece }: SquareHandlerArgs) =>
                      onSquareClick(square ?? undefined, piece?.pieceType),
                    squareStyles: optionSquares,
                    boardOrientation: playerColor === "b" ? "black" : "white",
                  }}
                />
                <PromotionSelection
                  pendingPromotion={pendingPromotion}
                  setPendingPromotion={setPendingPromotion}
                  menuLeft={menuLeft}
                  squareWidth={squareWidth}
                  selectPromotion={selectPromotion}
                  color={playerColor}
                />
              </div>
            </div>
          </section>

          <PuzzleInfoPanel
            feedback={feedback}
            hint={hint}
            history={history}
            isSolved={isSolved}
            revealHint={revealHint}
            selectedPuzzle={selectedPuzzle}
            solutionIndex={solutionIndex}
            solutionMoves={solutionMoves}
          />
        </div>
      )}
    </div>
  );
}
