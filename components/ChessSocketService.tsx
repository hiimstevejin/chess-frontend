"use client";

import { useEffect, useRef } from "react";
import { useChessStore } from "@/store/useChessStore";

interface Props {
  gameId: string;
}

export default function ChessSocketService({ gameId }: Props) {
  const { setSocket, setStatus, applyEngineMove } = useChessStore();

  // We use a ref to track the socket instance for cleanup and stale closures
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Initiate Connection
    setStatus("connecting");
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/game/${gameId}`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to Cerberus");
      setStatus("connected");
      setSocket(ws); // Save to Zustand so makeMove() can use it to send moves
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 2. Handle Engine Move
        if (data.type === "ENGINE_MOVE") {
          applyEngineMove(data.move);
        }

        // 3. Handle Errors (Illegal moves, etc)
        if (data.type === "ERROR") {
          console.error("Backend Error:", data.message);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      console.log("Disconnected from Cerberus");
      setStatus("disconnected");
      setSocket(null);
    };

    // 4. Cleanup: Close socket when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [gameId, setSocket, setStatus, applyEngineMove]);

  return null; // Headless component
}
