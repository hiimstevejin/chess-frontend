import { CSSProperties } from "react";
import { create } from "zustand";

interface ChessStore {
  fen: string;
  setCurrentFen: (fen: string) => void;
  history: string[];
  setMove: (move: string) => void;
  moveFrom: string;
  setMoveFrom: (moveFrom: string) => void;
  optionSquares: Record<string, CSSProperties>;
  setOptionSquares: (optionSquares: Record<string, CSSProperties>) => void;
}

export const useChessStore = create<ChessStore>((set) => ({
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  setCurrentFen: (fen) => set({ fen }),
  history: [],
  setMove: (move) => set((state) => ({ history: [...state.history, move] })),
  moveFrom: "",
  setMoveFrom: (moveFrom) => set({ moveFrom }),
  optionSquares: {},
  setOptionSquares: (optionSquares) => set({ optionSquares }),
}));
