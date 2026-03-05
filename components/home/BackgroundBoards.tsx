"use client";

import { useState, useEffect } from "react";
import RandomBoard from "./RandomBoard";

export default function BackgroundBoards() {
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
