"use client";

import { useState, useRef, useEffect } from "react";
import { ChessRook, Bot, User } from "lucide-react";
import AnimatedButton from "@/components/resusable/AnimatedButton";

interface PlayDropdownProps {
  onJoinPlayer: () => void;
  onJoinBot: () => void;
}

export default function PlayDropdown({
  onJoinPlayer,
  onJoinBot,
}: PlayDropdownProps) {
  const [playSelected, setPlaySelected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setPlaySelected(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePlayClick = () => {
    setPlaySelected(!playSelected);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <AnimatedButton
        primaryText="Play"
        hoverText="Now"
        icon={<ChessRook />}
        onClick={handlePlayClick}
        isActive={playSelected}
      />

      {playSelected && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-20">
          <button
            onClick={() => {
              setPlaySelected(false);
              onJoinPlayer();
            }}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-600 cursor-pointer transition-colors text-sm text-left"
          >
            <span>Human</span>
            <User size={18} />
          </button>
          <div className="h-px w-full bg-slate-700"></div>
          <button
            onClick={() => {
              setPlaySelected(false);
              onJoinBot();
            }}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-600 cursor-pointer transition-colors text-sm text-left"
          >
            <span className="font-medium">Bot</span>
            <Bot size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
