"use client";

import {
  FeedbackState,
  HintState,
  OptionSquares,
  PendingPromotion,
  PuzzleRecord,
  PuzzleResponse,
  PuzzleViewMode,
} from "@/components/puzzles/types";
import {
  DEFAULT_LIMIT,
  PUZZLES_API_PATH,
  loadStarredPuzzles,
  normalizeMove,
  saveStarredPuzzles,
} from "@/components/puzzles/utils";
import { Chess, Square } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";

export function usePuzzleTrainer() {
  const chessRef = useRef(new Chess());

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
  const [optionSquares, setOptionSquares] = useState<OptionSquares>({});
  const [pendingPromotion, setPendingPromotion] =
    useState<PendingPromotion | null>(null);
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

        const response = await fetch(`${PUZZLES_API_PATH}?${params.toString()}`);

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

  const selectedPuzzle = useMemo(
    () =>
      displayedPuzzles.find((puzzle) => puzzle.puzzle_id === selectedPuzzleId) ??
      null,
    [displayedPuzzles, selectedPuzzleId],
  );

  const starredPuzzleIds = useMemo(
    () => new Set(starredPuzzles.map((puzzle) => puzzle.puzzle_id)),
    [starredPuzzles],
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

  function highlightMoves(square: Square | null) {
    if (!square) {
      setMoveFrom("");
      setOptionSquares({});
      return;
    }

    const moves = chessRef.current.moves({ square, verbose: true });
    const nextSquares: OptionSquares = {
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
    setHistory(
      chessRef.current.history({ verbose: true }).map((move) => move.lan),
    );
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
        message: "Wrong move. Expected line remains unsolved.",
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

  function onPieceDrop(
    sourceSquare: string,
    targetSquare: string | undefined,
    pieceType: string,
  ) {
    if (!targetSquare || pieceType[0] !== playerColor || !isPlayerTurn) {
      return false;
    }

    return tryMove(sourceSquare, targetSquare);
  }

  function onSquareClick(square: string | undefined, pieceType?: string) {
    if (!square || !isPlayerTurn || isSolved) return;

    if (moveFrom === square) {
      highlightMoves(null);
      return;
    }

    if (!moveFrom) {
      if (pieceType && pieceType[0] === playerColor) {
        highlightMoves(square as Square);
      }
      return;
    }

    const moveSuccess = tryMove(moveFrom, square);
    if (!moveSuccess) {
      highlightMoves(
        pieceType && pieceType[0] === playerColor ? (square as Square) : null,
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

      saveStarredPuzzles(nextStarred);
      return nextStarred;
    });
  }

  return {
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
    isPlayerTurn,
    isSolved,
    loading,
    maxRatingInput,
    minRatingInput,
    moveFrom,
    onPieceDrop,
    onSquareClick,
    optionSquares,
    page,
    pendingPromotion,
    playerColor,
    puzzles: displayedPuzzles,
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
  };
}
