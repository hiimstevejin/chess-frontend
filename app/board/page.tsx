"use client"
import { Chessboard } from "react-chessboard";

export default function BoardPage() {

  return (
    <main className="flex items-center justify-center min-h-screen">
    <div className="w-full max-w-200 mx-auto">
      <Chessboard
        options={{
          id: 'play-vs-random',
          position: "6b1/P3KPR1/6pp/1p2Pr2/1B6/8/1p1Pn2p/3k4 w - - 0 1",
        }}
      />
      </div>
    </main>
  );
}
