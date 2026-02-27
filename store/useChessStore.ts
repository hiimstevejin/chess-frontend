import { create } from "zustand";

interface ChessState {
  fen: string;
  setCurrentFen: (fen: string) => void;
  history: string[];
  setMove: (move: string) => void;
}

export const useChessStore = create<ChessState>((set) => ({
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  setCurrentFen: (fen) => set({ fen }),
  history: [],
  setMove: (move) => set((state) => ({ history: [...state.history, move] })),
}));
