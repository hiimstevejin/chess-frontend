"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import BackgroundBoards from "@/components/home/BackgroundBoards";
import { ChessKnight, ChessRook } from "lucide-react";
import AnimatedButton from "@/components/resusable/AnimatedButton";

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
        <h1 className="text-4xl font-bold mb-8">Chess Info</h1>
        <div className="flex justify-center gap-4">
          <AnimatedButton
            primaryText="Play"
            hoverText="Now"
            icon={<ChessRook />}
            onClick={createGame}
            className="mb-4"
          />

          <AnimatedButton
            primaryText="Solve"
            hoverText="Puzzle"
            icon={<ChessKnight />}
            onClick={() => console.log("clicked puzzle")}
            className="mb-4"
          />
        </div>

        <form onSubmit={joinGame} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="p-2 rounded bg-slate-800 border border-slate-700"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
