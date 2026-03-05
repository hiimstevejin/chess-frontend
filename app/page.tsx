"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

function RandomBoard({ boardId }: { boardId: string }) {
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

function BackgroundBoards() {
  const [dimensions, setDimensions] = useState({ cols: 0, rows: 0 });
  
  useEffect(() => {
    const updateDimensions = () => {
      const boardSize = 300;
      const gap = 16; // 1rem (gap-4)
      
      const cols = Math.ceil(window.innerWidth / (boardSize + gap));
      const rows = Math.ceil(window.innerHeight / (boardSize + gap));
      
      setDimensions(prev => ({
        // Only increase dimensions to prevent unmounting/resetting boards on window shrink
        cols: Math.max(prev.cols, cols + 1),
        rows: Math.max(prev.rows, rows + 1),
      }));
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (dimensions.cols === 0) return null;

  const boards = Array.from({ length: dimensions.cols * dimensions.rows });

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.08] flex items-center justify-center">
      <div 
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${dimensions.cols}, 300px)`,
          gridTemplateRows: `repeat(${dimensions.rows}, 300px)`
        }}
      >
        {boards.map((_, i) => (
          <div key={i} className="w-[300px] h-[300px]">
            <RandomBoard boardId={`bg-board-${i}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [gameId, setGameId] = useState("");
  const router = useRouter();

  const createGame = () => {
    const newId = uuidv4();
    router.push(`/board/${newId}`);
  };

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      router.push(`/board/${gameId}`);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white overflow-hidden">
      <BackgroundBoards />
      
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8">Chess Online</h1>

        <button
          onClick={createGame}
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 mb-4"
        >
          Create New Game
        </button>

        <form onSubmit={joinGame} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="p-2 rounded bg-slate-800 border border-slate-700"
          />
          <button type="submit" className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
