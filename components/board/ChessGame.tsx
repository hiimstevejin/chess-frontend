"use client";

import GameOver from "@/components/board/GameOver";
import PromotionSelection from "@/components/board/PromotionSelection";
import StatusBadge from "@/components/board/StatusBadge";
import { useChessSocket } from "@/hooks/useChessSocket";
import { useChessStore } from "@/store/useChessStore";
import { Square } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";

interface ChessGameProps {
  gameId: string;
}

export default function ChessGame({gameId}:ChessGameProps) {
  const { fen, optionSquares, moveFrom, makeMove, highlightMoves, isPromotion, isGameOver, gameResult, resetGame } = useChessStore();

  useChessSocket(gameId);

  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(0);

  useEffect(() => {
    if (boardRef.current) {
      setBoardWidth(boardRef.current.offsetWidth);
    }
  }, []);

  const { menuLeft, squareWidth } = useMemo(() => {
      if (!pendingPromotion || boardWidth === 0) return { menuLeft: 0, squareWidth: 0 };

      const singleSquareWidth = boardWidth / 8;
      const colIndex = pendingPromotion.to.charCodeAt(0) - 'a'.charCodeAt(0);

      return {
        menuLeft: colIndex * singleSquareWidth,
        squareWidth: singleSquareWidth
      };
    }, [pendingPromotion, boardWidth])

  const isPlayerTurn = fen.split(" ")[1] === "w";

  function handleMove(source: string, target: string) {
    if (isPromotion(source, target)) {
      setPendingPromotion({ from: source, to: target });
      return true;
    }
    return makeMove(source, target);
  }

  function onPieceDrop({ sourceSquare, targetSquare, piece }: PieceDropHandlerArgs) {
    if (piece.pieceType[0] === "b") return false
    if (!isPlayerTurn) return false;
    if (!targetSquare) return false;
    return handleMove(sourceSquare, targetSquare);
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
        highlightMoves(square as Square);
      }
      return;
    }

    const moveSuccess = handleMove(moveFrom, square);
    if (!moveSuccess) {
      // If move failed, try to select the new square if it's a white piece
      highlightMoves(piece && piece.pieceType[0] === "w" ? (square as Square) : null);
    } else {
      highlightMoves(null);
    }
  }

  const selectPromotion = (piece: string) => {
    if (pendingPromotion) {
      makeMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
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
      <div className="flex flex-col gap-4">
        <StatusBadge />
        <GameOver/>
        <div ref={boardRef} className="relative">
          <Chessboard options={chessboardOptions} />
          <PromotionSelection
            pendingPromotion={pendingPromotion}
            setPendingPromotion={setPendingPromotion}
            menuLeft={menuLeft} squareWidth={squareWidth}
            selectPromotion={selectPromotion}
          />
        </div>
      </div>
  );
}
