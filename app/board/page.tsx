"use client";

import { useChessStore } from "@/store/useChessStore";
import { Chessboard, PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { Chess, Square } from "chess.js";
import { useRef } from "react";

export default function BoardPage() {
  const fen = useChessStore((s) => s.fen);
  const setCurrentFen = useChessStore((s) => s.setCurrentFen);
  const setMove = useChessStore((s) => s.setMove);
  const moveFrom = useChessStore((s) => s.moveFrom);
  const setMoveFrom = useChessStore((s) => s.setMoveFrom);
  const optionSquares = useChessStore((s) => s.optionSquares);
  const setOptionSquares = useChessStore((s) => s.setOptionSquares);

  const chessGameRef = useRef(new Chess(fen));
  const chessGame = chessGameRef.current;

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    // TODO add promotion logic
    if (!targetSquare) return false;

    try {
      const move = chessGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      if (!move) return false;

      setCurrentFen(chessGame.fen());
      setMove(move.san);

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

     function getMoveOptions(square: Square) {
       // get the moves for the square
       const moves = chessGame.moves({
         square,
         verbose: true
       });

       // if no moves, clear the option squares
       if (moves.length === 0) {
         setOptionSquares({});
         return false;
       }

       // create a new object to store the option squares
       const newSquares: Record<string, React.CSSProperties> = {};

       // loop through the moves and set the option squares
       for (const move of moves) {
         newSquares[move.to] = {
           background: chessGame.get(move.to) && chessGame.get(move.to)?.color !== chessGame.get(square)?.color ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)' // larger circle for capturing
           : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
           borderRadius: '50%'
         };
       }

       // set the square clicked to move from to yellow
       newSquares[square] = {
         background: 'rgba(255, 255, 0, 0.4)'
       };

       // set the option squares
       setOptionSquares(newSquares);

       // return true to indicate that there are move options
       return true;
     }

     function onSquareClick({
       square,
       piece
     }: SquareHandlerArgs) {
       // piece clicked to move
       if (!moveFrom && piece) {
         // get the move options for the square
         const hasMoveOptions = getMoveOptions(square as Square);

         // if move options, set the moveFrom to the square
         if (hasMoveOptions) {
           setMoveFrom(square);
         }

         // return early
         return;
       }

       // square clicked to move to, check if valid move
       const moves = chessGame.moves({
         square: moveFrom as Square,
         verbose: true
       });
       const foundMove = moves.find(m => m.from === moveFrom && m.to === square);

       // not a valid move
       if (!foundMove) {
         // check if clicked on new piece
         const hasMoveOptions = getMoveOptions(square as Square);

         // if new piece, setMoveFrom, otherwise clear moveFrom
         setMoveFrom(hasMoveOptions ? square : '');

         // return early
         return;
       }

       // is normal move
       try {
         chessGame.move({
           from: moveFrom,
           to: square,
           promotion: 'q'
         });
       } catch {
         // if invalid, setMoveFrom and getMoveOptions
         const hasMoveOptions = getMoveOptions(square as Square);

         // if new piece, setMoveFrom, otherwise clear moveFrom
         if (hasMoveOptions) {
           setMoveFrom(square);
         }

         // return early
         return;
       }

       // update the position state
       setCurrentFen(chessGame.fen());

       // clear moveFrom and optionSquares
       setMoveFrom('');
       setOptionSquares({});
     }

  const chessboardOptions = {
    id: "play-vs-random",
    position: fen,
    onPieceDrop,
    onSquareClick,
    squareStyles: optionSquares,
  };
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-200 mx-auto">
        <Chessboard options={chessboardOptions} />
      </div>
    </main>
  );
}
