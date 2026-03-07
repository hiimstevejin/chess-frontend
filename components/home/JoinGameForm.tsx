"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGameForm() {
  const [gameId, setGameId] = useState("");
  const router = useRouter();

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      router.push(`/board/${gameId}`);
    }
  };

  return (
    <form onSubmit={joinGame} className="flex gap-2">
      <input
        type="text"
        placeholder="Enter Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        className="p-2 rounded-lg bg-slate-800 border border-slate-700"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
      >
        Join
      </button>
    </form>
  );
}
