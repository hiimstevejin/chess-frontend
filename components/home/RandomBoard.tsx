"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function RandomBoard({ boardId }: { boardId: string }) {
  const [game, setGame] = useState(() => new Chess());

  const makeRandomMove = useCallback(() => {
    setGame((g) => {
      const possibleMoves = g.moves();
      if (g.isGameOver() || g.isDraw() || possibleMoves.length === 0) {
        return new Chess();
      }
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      const newGame = new Chess(g.fen());
      newGame.move(possibleMoves[randomIndex]);
      return newGame;
    });
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isActive = true;

    const scheduleNextMove = () => {
      if (!isActive) return;
      const delay = 1500 + Math.random() * 2000;
      timeout = setTimeout(() => {
        if (isActive) {
          makeRandomMove();
          scheduleNextMove();
        }
      }, delay);
    };

    // Initial random delay to desync the boards
    timeout = setTimeout(() => {
      if (isActive) {
        makeRandomMove();
        scheduleNextMove();
      }
    }, Math.random() * 2000);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [makeRandomMove]);

  // Memoize options to prevent react-chessboard from entering an infinite render loop
  const positionFen = game.fen();
  const chessboardOptions = useMemo(() => ({
    id: boardId,
    position: positionFen,
    arePiecesDraggable: false,
    animationDuration: 300,
  }), [boardId, positionFen]);

  return <Chessboard options={chessboardOptions} />;
}
