import { CSSProperties } from "react";
import { create } from "zustand";
import { Chess, Square } from "chess.js";

const game = new Chess();

// To load sample fen for testing
// const a = "8/5P2/8/8/8/7K/8/k7 w - - 0 1"
// game.load(a)

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface ChessStore {
  fen: string;
  history: string[];
  moveFrom: string;
  optionSquares: Record<string, CSSProperties>;
  status: ConnectionStatus;
  isGameOver: boolean;
  gameResult: string | null;
  socket: WebSocket | null;

  // Actions
  setSocket: (socket: WebSocket | null) => void;
  setStatus: (status: ConnectionStatus) => void;
  makeMove: (source: string, target: string, promotion?: string) => boolean;
  isPromotion: (source: string, target: string) => boolean;
  applyEngineMove: (move: string) => void;
  highlightMoves: (square: Square | null) => void;
  checkStatus: () => void;
  resetGame: () => void;
}

export const useChessStore = create<ChessStore>((set, get) => ({
  fen: game.fen(),
  history: [],
  moveFrom: "",
  optionSquares: {},
  status: "disconnected",
  isGameOver: false,
  gameResult: null,
  socket: null,

  setSocket: (socket) => set({ socket }),
  setStatus: (status) => set({ status }),

  makeMove: (source, target, promotion ="q") => {
    if (get().isGameOver || game.turn() !== "w") return false;

    try {
      const move = game.move({ from: source, to: target, promotion: promotion });

      if (move) {
        const newFen = game.fen();
        set({
          fen: newFen,
          history: [...get().history, move.lan],
          moveFrom: "",
          optionSquares: {},
        });

        // 2. Send move to FastAPI so Cerberus can think
        const socket = get().socket;
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            move: move.lan,
            fen: newFen
          }));
        }
        get().checkStatus();
        return true;
      }
    } catch (e) { return false; }
    return false;
  },

  isPromotion: (source, target) => {
      const piece = game.get(source as Square);
      if (!piece || piece.type !== "p") return false;

      const isCorrectRank = (piece.color === 'w' && target[1] === '8') || (piece.color === 'b' && target[1] === '1');

      if (!isCorrectRank) return false;
      const moves = game.moves({ square: source as Square, verbose: true });
      return moves.some(m => m.to === target && m.isPromotion);
    },

  applyEngineMove: (move) => {
      try {
        game.move(move);
        set({
          fen: game.fen(),
          history: [...get().history, move],
        });
        get().checkStatus();
      } catch (e) {
        console.error("Invalid engine move:", move);
      }
  },

  resetGame: () => {
      game.reset();
      set({
        fen: game.fen(),
        history: [],
        moveFrom: "",
        optionSquares: {},
        isGameOver: false
      });
  },

  checkStatus: () => {
      if (game.isGameOver()) {
        let result = "";
        if (game.isCheckmate()) result = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`;
        else if (game.isDraw()) result = "Draw!";
        else if (game.isStalemate()) result = "Stalemate!";
        else result = "Game Over";

        set({ isGameOver: true, gameResult: result });
      }
  },

  highlightMoves: (square) => {
    if (!square) {
      set({ moveFrom: "", optionSquares: {} });
      return;
    }
    const moves = game.moves({ square, verbose: true });
    const newSquares: Record<string, CSSProperties> = {
      [square]: { background: "rgba(255, 255, 0, 0.4)" }
    };
    moves.forEach((m) => {
      newSquares[m.to] = {
        background: game.get(m.to as Square)
          ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
          : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    });
    set({ moveFrom: square, optionSquares: newSquares });
  },
}));
