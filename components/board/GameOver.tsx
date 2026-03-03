import { useChessStore } from "@/store/useChessStore";

export default function GameOver() {
  const isGameOver = useChessStore((state) => state.isGameOver);
  const gameResult = useChessStore((state) => state.gameResult);
  const resetGame = useChessStore((state) => state.resetGame);

  if (!isGameOver) return null

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-white mb-4">{gameResult}</h2>
      <button
        onClick={resetGame}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition"
      >
        Play Again
      </button>
    </div>
  );
}
