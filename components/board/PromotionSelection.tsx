import { defaultPieces, PieceRenderObject } from "react-chessboard";

interface PromotionSelectionProps {
  pendingPromotion: { from: string; to: string } | null;
  setPendingPromotion: (val: { from: string; to: string } | null) => void;
  menuLeft: number;
  squareWidth: number;
  selectPromotion: (piece: string) => void;
}

export default function PromotionSelection({ pendingPromotion, setPendingPromotion, menuLeft, squareWidth, selectPromotion }:PromotionSelectionProps) {
  if (pendingPromotion) {
    return (
      <>
        <div
          className="absolute inset-0 z-10 bg-black/10"
          onClick={() => setPendingPromotion(null)}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: menuLeft,
            width: squareWidth,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)'
          }}
        >
          {['q', 'r', 'n', 'b'].map((p) => (
            <button
              key={p}
              onClick={() => selectPromotion(p)}
              style={{
                width: '100%',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer'
              }}
              className="hover:bg-slate-200 transition"
            >
              <span className="text-3xl text-black">
                {defaultPieces[`w${p.toUpperCase()}` as keyof PieceRenderObject]()}
              </span>
            </button>
          ))}
        </div>
      </>
    )
  }

}
