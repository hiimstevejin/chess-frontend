"use client";

import PromotionSelection from "@/components/board/PromotionSelection";
import { Star } from "lucide-react";
import { Chess, Square } from "chess.js";
import {
  Chessboard,
  PieceDropHandlerArgs,
  SquareHandlerArgs,
} from "react-chessboard";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

interface PuzzleRecord {
  puzzle_id: string;
  fen: string;
  moves: string;
  rating: number;
  rating_deviation: number;
  popularity: number;
  nb_plays: number;
  themes: string;
}

interface FeedbackState {
  tone: "neutral" | "success" | "error";
  message: string;
}

interface HintState {
  visible: boolean;
  move: string | null;
}

interface PuzzleResponse {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  has_next?: boolean;
  has_prev?: boolean;
  count?: number;
  items?: PuzzleRecord[];
}

const PUZZLES_API_PATH = "/api/puzzles";
const DEFAULT_LIMIT = 24;
const STARRED_PUZZLES_STORAGE_KEY = "starred-puzzles";

type PuzzleViewMode = "all" | "starred";

function normalizeMove(move: { from: string; to: string; promotion?: string }) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function loadStarredPuzzles() {
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

export default function PuzzleTrainer() {
  const chessRef = useRef(new Chess());
  const boardRef = useRef<HTMLDivElement>(null);

  const [puzzles, setPuzzles] = useState<PuzzleRecord[]>([]);
  const [starredPuzzles, setStarredPuzzles] = useState<PuzzleRecord[]>([]);
  const [viewMode, setViewMode] = useState<PuzzleViewMode>("all");
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPuzzles, setTotalPuzzles] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [minRatingInput, setMinRatingInput] = useState("");
  const [maxRatingInput, setMaxRatingInput] = useState("");
  const [appliedMinRating, setAppliedMinRating] = useState("");
  const [appliedMaxRating, setAppliedMaxRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fen, setFen] = useState(chessRef.current.fen());
  const [history, setHistory] = useState<string[]>([]);
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState<
    Record<string, CSSProperties>
  >({});
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [playerColor, setPlayerColor] = useState<"w" | "b">("w");
  const [solutionMoves, setSolutionMoves] = useState<string[]>([]);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>({
    tone: "neutral",
    message: "Choose a puzzle to begin.",
  });
  const [hint, setHint] = useState<HintState>({
    visible: false,
    move: null,
  });
  const [boardWidth, setBoardWidth] = useState(0);

  useEffect(() => {
    setStarredPuzzles(loadStarredPuzzles());
  }, []);

  useEffect(() => {
    async function loadPuzzles() {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          page: String(page),
          limit: String(DEFAULT_LIMIT),
        });
        if (appliedMinRating) params.set("min_rating", appliedMinRating);
        if (appliedMaxRating) params.set("max_rating", appliedMaxRating);

        const response = await fetch(
          `${PUZZLES_API_PATH}?${params.toString()}`,
        );

        if (!response.ok) {
          const payload: { error?: string } = await response
            .json()
            .catch(() => ({}));
          throw new Error(
            payload.error ?? `Request failed with ${response.status}`,
          );
        }

        const data: PuzzleResponse = await response.json();
        const nextPuzzles = data.items ?? [];
        setPuzzles(nextPuzzles);
        setPage(data.page ?? page);
        setTotalPages(Math.max(1, data.total_pages ?? 1));
        setTotalPuzzles(data.total ?? nextPuzzles.length);
        setHasNext(Boolean(data.has_next));
        setHasPrev(Boolean(data.has_prev));
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load puzzles.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadPuzzles();
  }, [appliedMaxRating, appliedMinRating, page]);

  useEffect(() => {
    if (boardRef.current) {
      setBoardWidth(boardRef.current.offsetWidth);
    }
  }, [selectedPuzzleId]);

  const displayedPuzzles = viewMode === "starred" ? starredPuzzles : puzzles;

  useEffect(() => {
    if (displayedPuzzles.length === 0) {
      setSelectedPuzzleId(null);
      return;
    }

    const hasSelectedPuzzle = displayedPuzzles.some(
      (puzzle) => puzzle.puzzle_id === selectedPuzzleId,
    );

    if (!hasSelectedPuzzle) {
      setSelectedPuzzleId(displayedPuzzles[0].puzzle_id);
    }
  }, [displayedPuzzles, selectedPuzzleId]);

  const selectedPuzzle =
    displayedPuzzles.find((puzzle) => puzzle.puzzle_id === selectedPuzzleId) ??
    null;
  const starredPuzzleIds = new Set(
    starredPuzzles.map((puzzle) => puzzle.puzzle_id),
  );

  useEffect(() => {
    if (!selectedPuzzle) return;

    const chess = new Chess(selectedPuzzle.fen);
    const moves = selectedPuzzle.moves.split(" ").filter(Boolean);
    const nextHistory: string[] = [];

    if (moves.length > 0) {
      const setupMove = chess.move(moves[0]);
      if (setupMove) {
        nextHistory.push(setupMove.lan);
      }
    }

    chessRef.current = chess;
    setFen(chess.fen());
    setHistory(nextHistory);
    setMoveFrom("");
    setOptionSquares({});
    setPendingPromotion(null);
    setPlayerColor(chess.turn());
    setSolutionMoves(moves);
    setSolutionIndex(Math.min(1, moves.length));
    setHint({
      visible: false,
      move: moves[1] ?? null,
    });
    setFeedback({
      tone: "neutral",
      message:
        moves.length > 1
          ? "Find the best move."
          : "This puzzle has no follow-up move.",
    });
  }, [selectedPuzzle]);

  const isSolved =
    solutionMoves.length > 0 && solutionIndex >= solutionMoves.length;
  const isPlayerTurn = fen.split(" ")[1] === playerColor;

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

  function highlightMoves(square: Square | null) {
    if (!square) {
      setMoveFrom("");
      setOptionSquares({});
      return;
    }

    const moves = chessRef.current.moves({ square, verbose: true });
    const nextSquares: Record<string, CSSProperties> = {
      [square]: { background: "rgba(255, 255, 0, 0.4)" },
    };

    moves.forEach((move) => {
      nextSquares[move.to] = {
        background: chessRef.current.get(move.to as Square)
          ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
          : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });

    setMoveFrom(square);
    setOptionSquares(nextSquares);
  }

  function isPromotion(source: string, target: string) {
    const piece = chessRef.current.get(source as Square);
    if (!piece || piece.type !== "p") return false;

    const isCorrectRank =
      (piece.color === "w" && target[1] === "8") ||
      (piece.color === "b" && target[1] === "1");

    if (!isCorrectRank) return false;

    const moves = chessRef.current.moves({
      square: source as Square,
      verbose: true,
    });

    return moves.some((move) => move.to === target && move.isPromotion);
  }

  function syncBoardState(nextFeedback: FeedbackState, nextIndex: number) {
    setFen(chessRef.current.fen());
    setHistory([
      ...chessRef.current.history({ verbose: true }).map((move) => move.lan),
    ]);
    setMoveFrom("");
    setOptionSquares({});
    setFeedback(nextFeedback);
    setSolutionIndex(nextIndex);
    setHint({
      visible: false,
      move: solutionMoves[nextIndex] ?? null,
    });
  }

  function tryMove(source: string, target: string, promotion = "q") {
    if (!selectedPuzzle || isSolved || !isPlayerTurn) return false;

    if (isPromotion(source, target) && !pendingPromotion) {
      setPendingPromotion({ from: source, to: target });
      return true;
    }

    const chess = new Chess(chessRef.current.fen());
    let candidateMove;

    try {
      candidateMove = chess.move({
        from: source,
        to: target,
        promotion,
      });
    } catch {
      return false;
    }

    if (!candidateMove) {
      return false;
    }

    const expectedMove = solutionMoves[solutionIndex];
    if (normalizeMove(candidateMove) !== expectedMove) {
      setFeedback({
        tone: "error",
        message: `Wrong move. Expected line remains unsolved.`,
      });
      return false;
    }

    chessRef.current = chess;
    let nextIndex = solutionIndex + 1;

    if (nextIndex < solutionMoves.length) {
      const replyMove = chessRef.current.move(solutionMoves[nextIndex]);
      if (replyMove) {
        nextIndex += 1;
      }
    }

    syncBoardState(
      nextIndex >= solutionMoves.length
        ? {
            tone: "success",
            message: "Correct. Puzzle solved.",
          }
        : {
            tone: "success",
            message: "Correct. Find the next move.",
          },
      nextIndex,
    );

    return true;
  }

  function onPieceDrop({
    sourceSquare,
    targetSquare,
    piece,
  }: PieceDropHandlerArgs) {
    if (!targetSquare || piece.pieceType[0] !== playerColor || !isPlayerTurn) {
      return false;
    }

    return tryMove(sourceSquare, targetSquare);
  }

  function onSquareClick({ square, piece }: SquareHandlerArgs) {
    if (!square || !isPlayerTurn || isSolved) return;

    if (moveFrom === square) {
      highlightMoves(null);
      return;
    }

    if (!moveFrom) {
      if (piece && piece.pieceType[0] === playerColor) {
        highlightMoves(square as Square);
      }
      return;
    }

    const moveSuccess = tryMove(moveFrom, square);
    if (!moveSuccess) {
      highlightMoves(
        piece && piece.pieceType[0] === playerColor ? (square as Square) : null,
      );
    }
  }

  function selectPromotion(piece: string) {
    if (!pendingPromotion) return;

    tryMove(pendingPromotion.from, pendingPromotion.to, piece);
    setPendingPromotion(null);
  }

  function applyRatingFilters() {
    if (
      minRatingInput &&
      maxRatingInput &&
      Number(minRatingInput) > Number(maxRatingInput)
    ) {
      setError("Minimum Elo cannot be greater than maximum Elo.");
      return;
    }

    setError(null);
    setAppliedMinRating(minRatingInput);
    setAppliedMaxRating(maxRatingInput);
    setPage(1);
  }

  function clearRatingFilters() {
    setError(null);
    setMinRatingInput("");
    setMaxRatingInput("");
    setAppliedMinRating("");
    setAppliedMaxRating("");
    setPage(1);
  }

  function revealHint() {
    setHint({
      visible: true,
      move: solutionMoves[solutionIndex] ?? null,
    });
  }

  function toggleStarredPuzzle(puzzle: PuzzleRecord) {
    setStarredPuzzles((current) => {
      const alreadyStarred = current.some(
        (item) => item.puzzle_id === puzzle.puzzle_id,
      );
      const nextStarred = alreadyStarred
        ? current.filter((item) => item.puzzle_id !== puzzle.puzzle_id)
        : [puzzle, ...current];

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          STARRED_PUZZLES_STORAGE_KEY,
          JSON.stringify(nextStarred),
        );
      }

      return nextStarred;
    });
  }

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
          Failed to load puzzles from `{PUZZLES_API_PATH}`.
          <div className="mt-2 text-sm text-red-100/80">{error}</div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)_20rem]">
          <aside className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                {viewMode === "starred" ? "Bookmarked" : "Puzzles"}
              </h2>
              <span className="text-xs text-slate-500">
                {viewMode === "starred"
                  ? `${starredPuzzles.length} saved`
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
              {displayedPuzzles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
                  {viewMode === "starred"
                    ? "No saved puzzles yet."
                    : "No puzzles found for this filter."}
                </div>
              ) : (
                displayedPuzzles.map((puzzle) => {
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
                          <span
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
                            role="button"
                          >
                            <Star
                              className="h-4 w-4"
                              fill={isStarred ? "currentColor" : "none"}
                            />
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {puzzle.themes}
                      </p>
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
                    onPieceDrop,
                    onSquareClick,
                    squareStyles: optionSquares,
                    boardOrientation: playerColor === "b" ? "black" : "white",
                    arePiecesDraggable: isPlayerTurn && !isSolved,
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
                    {selectedPuzzle.rating} +/-{" "}
                    {selectedPuzzle.rating_deviation}
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
                <span className="text-xs text-slate-500">
                  {history.length} total
                </span>
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
        </div>
      )}
    </div>
  );
}
