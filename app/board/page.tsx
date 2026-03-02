"use client";

import { useEffect } from "react";
import { useChessStore } from "@/store/useChessStore";
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";

export default function BoardPage() {
  const { fen, optionSquares, moveFrom, makeMove, highlightMoves, isGameOver, gameResult, resetGame } = useChessStore();
  const isPlayerTurn = fen.split(" ")[1] === "w";

  function onPieceDrop({ sourceSquare, targetSquare, piece }: PieceDropHandlerArgs) {
    if (piece.pieceType[0] === "b") return false
    if (!isPlayerTurn) return false;
    return makeMove(sourceSquare, targetSquare);
  }


  function onSquareClick({ square, piece }: SquareHandlerArgs) {
    if (!square || !isPlayerTurn) return;

    // If clicking the same square again, deselect
    if (moveFrom === square) {
      highlightMoves(null);
      return;
    }

    if (!moveFrom) {
      if (piece && piece.pieceType[0] === "w") {
        highlightMoves(square as any);
      }
      return;
    }

    const moveSuccess = makeMove(moveFrom, square);
    if (!moveSuccess) {
      // If move failed, try to select the new square if it's a white piece
      highlightMoves(piece && piece.pieceType[0] === "w" ? (square as any) : null);
    } else {
      highlightMoves(null);
    }
  }

  const chessboardOptions = {
    id: "play-vs-random",
    position: fen,
    onPieceDrop,
    onSquareClick,
    squareStyles: optionSquares,
    boardOrientation: "white" as const,
    arePiecesDraggable: isPlayerTurn,
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-150 p-4 bg-slate-800  shadow-2xl">
        {/*{isGameOver && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <h2 className="text-3xl font-bold text-white mb-4">{gameResult}</h2>
                    <button
                      onClick={resetGame}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition"
                    >
                      Play Again
                    </button>
                  </div>
                )}*/}
        <Chessboard
        options={chessboardOptions}
        />
      </div>
    </main>
  );
}
