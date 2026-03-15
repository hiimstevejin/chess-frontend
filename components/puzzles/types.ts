import { CSSProperties } from "react";

export interface PuzzleRecord {
  puzzle_id: string;
  fen: string;
  moves: string;
  rating: number;
  rating_deviation: number;
  popularity: number;
  nb_plays: number;
  themes: string;
}

export interface FeedbackState {
  tone: "neutral" | "success" | "error";
  message: string;
}

export interface HintState {
  visible: boolean;
  move: string | null;
}

export interface PuzzleResponse {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  has_next?: boolean;
  has_prev?: boolean;
  count?: number;
  items?: PuzzleRecord[];
}

export type PuzzleViewMode = "all" | "starred";

export interface PendingPromotion {
  from: string;
  to: string;
}

export type OptionSquares = Record<string, CSSProperties>;
