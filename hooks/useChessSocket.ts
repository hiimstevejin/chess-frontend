import { useEffect, useRef } from 'react';
import { useChessStore } from '@/store/useChessStore';

export const useChessSocket = (gameId: string) => {
  const applyEngineMove = useChessStore((s) => s.applyEngineMove);
  const setStatus = useChessStore((s) => s.setStatus);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/game/${gameId}`);
    socketRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "ENGINE_MOVE") {
        applyEngineMove(data.move);
      }
    };

    // Store the socket globally or in a way makeMove can access it
    // Or just pass the send function to the store

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [gameId, applyEngineMove, setStatus]);

  const sendMove = (move: string, fen: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ move, fen }));
    }
  };

  return { sendMove };
};
