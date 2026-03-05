"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import BackgroundBoards from "@/components/home/BackgroundBoards";

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
