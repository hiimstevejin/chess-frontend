"use client";

import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import BackgroundBoards from "@/components/home/BackgroundBoards";
import { ChessKnight } from "lucide-react";
import AnimatedButton from "@/components/resusable/AnimatedButton";
import JoinGameForm from "@/components/home/JoinGameForm";
import PlayDropdown from "@/components/home/PlayDropdown";

export default function Home() {
  const router = useRouter();

  const handleJoinGameAgainstBot = () => {
    const newId = uuidv4();
    const color = Math.random() > 0.5 ? "w" : "b";
    router.push(`/board/${newId}?mode=bot&color=${color}`);
  };

  const handleJoinGameAgainstPlayer = () => {
    const newId = uuidv4();
    const color = Math.random() > 0.5 ? "w" : "b";
    router.push(`/board/${newId}?mode=player&color=${color}`);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white overflow-hidden">
      <BackgroundBoards />

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8">Chess Info</h1>

        <div className="flex justify-center gap-4 mb-8">
          <PlayDropdown
            onJoinPlayer={handleJoinGameAgainstPlayer}
            onJoinBot={handleJoinGameAgainstBot}
          />

          <AnimatedButton
            primaryText="Solve"
            hoverText="Puzzle"
            icon={<ChessKnight />}
            onClick={() => console.log("clicked puzzle")}
          />
        </div>

        <JoinGameForm />
      </div>
    </div>
  );
}
